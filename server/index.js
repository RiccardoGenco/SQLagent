require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const aiService = require('./services/aiService');
const sqlService = require('./services/sqlService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        res.json({
            user: { id: row.id, name: row.name, email: row.email, role: row.role }
        });
    });
});

// Routes
app.post('/api/chat', async (req, res) => {
    const { message, role = 'user' } = req.body; // In real app, extract role from session/token
    const timestamp = new Date().toISOString();

    try {
        // Log User Message
        db.run("INSERT INTO chat_logs (sender, message, timestamp) VALUES (?, ?, ?)",
            ['user', message, timestamp]);

        // 1. Interpret Intent (NL -> SQL)
        const sqlQuery = await aiService.generateQuery(message);

        // 2. Security Check for Dangerous Operations
        const upperSql = sqlQuery.trim().toUpperCase();
        const isDangerous = ['DELETE', 'DROP', 'TRUNCATE'].some(keyword => upperSql.startsWith(keyword));

        if (isDangerous) {
            return res.json({
                requiresConfirmation: true,
                sql: sqlQuery,
                response: "This action requires confirmation."
            });
        }

        // 3. Execute Query Securely (passing role)
        const result = await sqlService.executeQuery(sqlQuery, role);

        // Log Agent Response
        const metadata = JSON.stringify({ sql: sqlQuery, resultCount: result ? result.length : 0 });
        db.run("INSERT INTO chat_logs (sender, message, timestamp, metadata) VALUES (?, ?, ?, ?)",
            ['agent', "Here is what I found:", new Date().toISOString(), metadata]);

        res.json({
            response: "Here is what I found:",
            data: result,
            sql: sqlQuery
        });
    } catch (error) {
        console.error(error);
        // Log Error
        db.run("INSERT INTO chat_logs (sender, message, timestamp, metadata) VALUES (?, ?, ?, ?)",
            ['agent', "Error: " + error.message, new Date().toISOString(), JSON.stringify({ error: true })]);

        res.status(500).json({ error: error.message });
    }
});

app.post('/api/confirm-query', async (req, res) => {
    const { sql, role } = req.body;
    try {
        // Execute Confirmed Query
        const result = await sqlService.executeQuery(sql, role);

        // Log Agent Response
        const metadata = JSON.stringify({ sql: sql, resultCount: result ? result.length : 0, confirmed: true });
        db.run("INSERT INTO chat_logs (sender, message, timestamp, metadata) VALUES (?, ?, ?, ?)",
            ['agent', "Action executed after confirmation.", new Date().toISOString(), metadata]);

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/history', (req, res) => {
    db.all("SELECT * FROM chat_logs ORDER BY timestamp ASC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} page in http://localhost:5173/`);
});

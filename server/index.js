require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const aiService = require('./services/aiService');
const sqlService = require('./services/sqlService');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token." });
        req.user = user; // { id, name, email, role }
        next();
    });
};

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        // Generate Token
        const token = jwt.sign(
            { id: row.id, name: row.name, email: row.email, role: row.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: row.id, name: row.name, email: row.email, role: row.role }
        });
    });
});

// Chat Route
app.post('/api/chat', authenticateToken, async (req, res) => {
    const { message } = req.body;
    const role = req.user.role; // Securely get role from token
    const timestamp = new Date().toISOString();

    try {
        // Log User Message
        db.run("INSERT INTO chat_logs (sender, message, timestamp) VALUES (?, ?, ?)",
            [req.user.name || 'user', message, timestamp]);

        // 1. Interpret Intent (NL -> SQL)
        const schemaContext = await sqlService.getSchema();
        const { sql: sqlQuery, usage } = await aiService.generateQuery(message, schemaContext);

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

        // 3. Execute Query Securely
        const result = await sqlService.executeQuery(sqlQuery, req.user);

        // Log Agent Response
        const metadata = JSON.stringify({
            sql: sqlQuery,
            resultCount: result ? result.length : 0,
            tokens: usage
        });
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

// Confirm Query Route
app.post('/api/confirm-query', authenticateToken, async (req, res) => {
    const { sql } = req.body;
    const role = req.user.role; // Securely get role from token

    try {
        // Execute Confirmed Query
        const result = await sqlService.executeQuery(sql, req.user);

        // Log Agent Response
        const metadata = JSON.stringify({ sql: sql, resultCount: result ? result.length : 0, confirmed: true });
        db.run("INSERT INTO chat_logs (sender, message, timestamp, metadata) VALUES (?, ?, ?, ?)",
            ['agent', "Action executed after confirmation.", new Date().toISOString(), metadata]);

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// History Route
app.get('/api/history', authenticateToken, (req, res) => {
    db.all("SELECT * FROM chat_logs ORDER BY timestamp ASC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// CSV Export Route
app.get('/api/export/:table', authenticateToken, (req, res) => {
    const { table } = req.params;
    // Basic SQL injection protection for table name
    const safeTables = ['users', 'products', 'chat_logs'];
    if (!safeTables.includes(table)) {
        return res.status(400).json({ error: "Invalid table name" });
    }

    db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        if (rows.length === 0) return res.send('');

        // Convert to CSV with BOM and semicolon separator for Excel (common in EU)
        const headers = Object.keys(rows[0]).join(';');
        const csvRows = rows.map(row => Object.values(row).map(v => {
            // Handle null/undefined
            if (v === null || v === undefined) return '';
            // Escape quotes and wrap in quotes if necessary
            const stringValue = String(v);
            if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(';'));

        const csvContent = '\uFEFF' + [headers, ...csvRows].join('\n');

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment(`${table}.csv`);
        res.send(csvContent);
    });
});

// CSV Import Route
app.post('/api/import', authenticateToken, upload.single('file'), (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can import data." });
    }

    const tableName = req.body.tableName;
    if (!tableName || !/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: "Invalid table name" });
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            if (results.length === 0) {
                return res.status(400).json({ error: "Empty CSV" });
            }

            // Filter out 'id' from columns if it exists in the CSV to avoid conflict with AUTOINCREMENT
            const rawColumns = Object.keys(results[0]);
            const columns = rawColumns.filter(c => c.toLowerCase() !== 'id');

            // Create Table dynamically
            // We always add our own ID primary key.
            const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns.map(c => `${c} TEXT`).join(', ')})`;

            db.serialize(() => {
                db.run(createTableSql);

                const placeholders = columns.map(() => '?').join(',');
                const insertSql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;
                const stmt = db.prepare(insertSql);

                results.forEach(row => {
                    // Extract only the values for the filtered columns
                    const values = columns.map(col => row[col]);
                    stmt.run(values);
                });
                stmt.finalize();
            });

            // Cleanup uploaded file
            fs.unlinkSync(req.file.path);

            res.json({ message: `Imported ${results.length} rows into ${tableName}` });
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} page in http://localhost:5173/`);
});

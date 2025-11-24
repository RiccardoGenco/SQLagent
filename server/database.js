const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create a sample Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT
        )`);

        // Create a sample Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL,
            stock INTEGER
        )`);

        // Create chat_logs table
        db.run(`CREATE TABLE IF NOT EXISTS chat_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT
        )`);

        // Seed data if empty
        db.get("SELECT count(*) as count FROM users", (err, row) => {
            if (row.count === 0) {
                const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
                stmt.run("Alice Admin", "admin@example.com", "admin123", "admin");
                stmt.run("Bob User", "user@example.com", "user123", "user");
                stmt.finalize();
                console.log("Seeded users table with passwords.");
            }
        });

        db.get("SELECT count(*) as count FROM products", (err, row) => {
            if (row.count === 0) {
                const stmt = db.prepare("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)");
                stmt.run("Laptop", 999.99, 10);
                stmt.run("Mouse", 29.99, 100);
                stmt.run("Keyboard", 59.99, 50);
                stmt.finalize();
                console.log("Seeded products table.");
            }
        });
    });
}

module.exports = db;

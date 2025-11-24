const db = require('../database');

//const FORBIDDEN_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];

async function executeQuery(sql, user = { role: 'user', name: 'user' }) {
    return new Promise((resolve, reject) => {
        // 1. Security Check
        const upperSql = sql.trim().toUpperCase();

        // Whitelist approach: ONLY allow SELECT (unless Admin)
        if (user.role !== 'admin' && !upperSql.startsWith('SELECT')) {
            return reject(new Error("Security Alert: Only SELECT queries are allowed for visitors."));
        }

        // 2. Row Level Security for chat_logs (Non-Admins only see their own logs)
        let finalSql = sql;
        if (user.role !== 'admin' && /chat_logs/i.test(sql)) {
            const safeName = user.name.replace(/'/g, "''"); // Escape single quotes
            // Replace 'chat_logs' with a subquery that filters by sender
            // We use a regex to match the whole word 'chat_logs' case-insensitive
            finalSql = sql.replace(/\bchat_logs\b/gi, `(SELECT * FROM chat_logs WHERE sender = '${safeName}')`);
        }

        db.all(finalSql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getSchema() {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], async (err, tables) => {
            if (err) return reject(err);

            const schemaParts = [];
            for (const table of tables) {
                const tableName = table.name;
                try {
                    const columns = await new Promise((res, rej) => {
                        db.all(`PRAGMA table_info(${tableName})`, [], (err, cols) => {
                            if (err) rej(err);
                            else res(cols.map(c => c.name).join(', '));
                        });
                    });
                    schemaParts.push(`- ${tableName} (${columns})`);
                } catch (e) {
                    console.error(`Error fetching columns for ${tableName}`, e);
                }
            }
            resolve(schemaParts.join('\n    '));
        });
    });
}

module.exports = {
    executeQuery,
    getSchema
};

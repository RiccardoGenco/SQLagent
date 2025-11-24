const db = require('../database');

//const FORBIDDEN_KEYWORDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];

async function executeQuery(sql, role = 'user') {
    return new Promise((resolve, reject) => {
        // 1. Security Check
        const upperSql = sql.trim().toUpperCase();

        // Whitelist approach: ONLY allow SELECT (unless Admin)
        if (role !== 'admin' && !upperSql.startsWith('SELECT')) {
            return reject(new Error("Security Alert: Only SELECT queries are allowed for visitors."));
        }

        // 2. Execute
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    executeQuery
};

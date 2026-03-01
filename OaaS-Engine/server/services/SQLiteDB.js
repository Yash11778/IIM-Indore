const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/oaas.db');

// Ensure data dir exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize DB
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite Connection Error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database (oaas.db)');
        initTables();
    }
});

function initTables() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'candidate',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Sessions Table (storing complex object as JSON)
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            sessionId TEXT PRIMARY KEY,
            userId TEXT,
            data TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log("📂 SQLite Tables Verified");
    });
}

const SQLiteDB = {
    // --- USER METHODS ---
    saveUser: (user) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("INSERT OR REPLACE INTO users (name, email, role) VALUES (?, ?, ?)");
            stmt.run(user.name, user.email, user.role, function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
            stmt.finalize();
        });
    },

    getUser: (email) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // --- SESSION METHODS ---
    saveSession: (sessionId, data) => {
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(data);
            // specific userId extraction if available, else null
            const userId = data.metadata?.userId || data.metadata?.email || null;

            const stmt = db.prepare(`
                INSERT INTO sessions (sessionId, userId, data, updated_at) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(sessionId) DO UPDATE SET
                data = excluded.data,
                updated_at = CURRENT_TIMESTAMP
            `);

            stmt.run(sessionId, userId, json, function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
            stmt.finalize();
        });
    },

    getSession: (sessionId) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT data FROM sessions WHERE sessionId = ?", [sessionId], (err, row) => {
                if (err) reject(err);
                else if (!row) resolve(null);
                else resolve(JSON.parse(row.data));
            });
        });
    },

    deleteSession: (sessionId) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM sessions WHERE sessionId = ?", [sessionId], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    },

    getAllCandidates: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM sessions", [], (err, rows) => {
                if (err) reject(err);
                else {
                    // Convert back to object map for format compatibility or array
                    // The original LocalDB returned an object map { sessionId: data } 
                    // or array depending on usage. Let's check usage. 
                    // SimulationController.getCandidates -> returns array of candidate objects derived from sessions.
                    // We'll mimic the logic: return map of parsed data.
                    const candidates = {};
                    rows.forEach(row => {
                        candidates[row.sessionId] = JSON.parse(row.data);
                    });
                    resolve(candidates);
                }
            });
        });
    }
};

module.exports = SQLiteDB;

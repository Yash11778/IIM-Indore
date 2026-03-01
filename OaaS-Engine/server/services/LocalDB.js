const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/database.json');
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

class LocalDB {
    constructor() {
        this.cache = {
            sessions: {},
            users: {} // Store registered users
        };
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(DB_PATH)) {
                const raw = fs.readFileSync(DB_PATH, 'utf-8');
                this.cache = JSON.parse(raw);
                // Ensure users object exists if loading old db
                if (!this.cache.users) this.cache.users = {};
                console.log(`📂 LocalDB: Loaded ${Object.keys(this.cache.sessions).length} sessions and ${Object.keys(this.cache.users).length} users.`);
            }
        } catch (e) {
            console.error("LocalDB Load Error:", e);
        }
    }

    save() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.cache, null, 2));
        } catch (e) {
            console.error("LocalDB Save Error:", e);
        }
    }

    // --- User Methods (Auth) ---
    saveUser(user) {
        // user = { name, email, role, timestamp }
        if (!user.email) return;
        this.cache.users[user.email] = user;
        this.save();
        return user;
    }

    getUser(email) {
        return this.cache.users[email];
    }

    // --- Session Methods (Simulation) ---
    getSession(id) {
        return this.cache.sessions[id] || null;
    }

    saveSession(id, data) {
        this.cache.sessions[id] = data;
        this.save();
        return data;
    }

    // --- Recruiter Portal Methods ---
    getAllCandidates() {
        // 1. Get all sessions
        const sessionList = Object.values(this.cache.sessions).map(s => ({
            id: s.sessionId,
            name: s.metadata?.name || 'Unknown Candidate',
            email: s.metadata?.email,
            role: 'Full Stack Dev',
            riskScore: s.auditMetrics?.hiringRiskScore || 0,
            focus: s.auditMetrics?.focusIntegrity || 100,
            status: (s.auditMetrics?.hiringRiskScore < 50) ? 'HIRE' : 'REJECT',
            hasSession: true
        }));

        // 2. Get registered users who haven't started a session yet
        const users = Object.values(this.cache.users || {}).filter(u => u.role === 'candidate');

        // Exclude users who already have a session (matched by name for demo simplicity)
        const sessionsByName = new Set(sessionList.map(s => s.name));

        const pendingUsers = users
            .filter(u => !sessionsByName.has(u.name))
            .map((u, index) => ({
                id: 'pending_' + u.email,
                name: u.name,
                role: 'Full Stack Dev',
                riskScore: 0,
                focus: 0,
                status: 'PENDING', // Special status for Recruiter UI
                hasSession: false
            }));

        return [...sessionList, ...pendingUsers];
    }
}

const dbInstance = new LocalDB();
module.exports = dbInstance;

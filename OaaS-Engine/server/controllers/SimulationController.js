const { GoogleGenerativeAI } = require("@google/generative-ai");
const ScoringService = require('../services/ScoringService');
const AgentOrchestrator = require('../services/AgentOrchestrator');
const SQLiteDB = require('../services/SQLiteDB'); // SWITCHED TO SQLITE

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Scenario Config
const SCENARIO_STAGES = [
    { id: 1, name: 'Investigation', goal: 'Identify the root cause in logs' },
    { id: 2, name: 'Fix Implementation', goal: 'Modify the db-connector.js file' },
    { id: 3, name: 'Verification', goal: 'Run the simulation test suite' },
    { id: 4, name: 'Deployment', goal: 'Push changes to production' }
];

exports.startSimulation = async (req, res) => {
    try {
        const sessionId = 'session_' + Date.now();
        console.log(`Starting new simulation: ${sessionId}`);

        const initialData = {
            sessionId,
            metadata: {
                startTime: new Date(),
                name: req.body.name || 'Candidate', // Capture Name
                email: req.body.userId || 'guest@example.com', // Capture Email for SQL
                candidateId: 'CAND_' + Math.floor(Math.random() * 1000)
            },
            conversationHistory: [],
            currentStage: 1,
            auditMetrics: {
                hiringRiskScore: 0,
                behavioralComposureScore: 100,
                focusIntegrity: 100
            }
        };

        // SAVE TO LOCAL DB (Async)
        console.log(`💾 Saving Session ${sessionId} to SQLite... Name: ${initialData.metadata.name}`);
        await SQLiteDB.saveSession(sessionId, initialData);

        res.json({ sessionId, message: "Simulation initialized", stage: 1 });
    } catch (error) {
        console.error("Start Error:", error);
        res.status(500).json({ error: "Failed to start" });
    }
};

exports.handleTurn = async (req, res) => {
    try {
        const { sessionId, userMessage, inactivityFlag, focusScore } = req.body;

        // LOAD FROM LOCAL DB (Async)
        let sessionData = await SQLiteDB.getSession(sessionId);

        if (!sessionData) return res.status(404).json({ error: 'Session not found' });

        let history = sessionData.conversationHistory || [];
        let currentStage = sessionData.currentStage || 1;

        // 1. Record User Turn (Handle System Events)
        const isSystemEvent = userMessage.startsWith('[SYSTEM_EVENT]');

        history.push({
            role: isSystemEvent ? 'system' : 'user',
            content: userMessage.replace('[SYSTEM_EVENT] ', ''),
            timestamp: new Date(),
            metadata: { stressLevelDetected: isSystemEvent ? 'High' : 'Normal' }
        });

        // If System Event, don't trigger AI response, just acknowledge
        if (isSystemEvent) {
            // CHECK FOR EXIT SIGNAL
            const isExit = userMessage.includes('[SYSTEM_EVENT_EXIT]');

            // UPDATE METRICS ONLY
            const scorecard = ScoringService.calculateScorecard({
                stressEvents: history.filter(h => h.role === 'system').length,
                focusIntegrity: focusScore,
                stagesCompleted: currentStage,
                codeQualityPass: currentStage >= 3
            });

            sessionData.auditMetrics = {
                ...sessionData.auditMetrics,
                hiringRiskScore: scorecard.hiringRiskScore,
                behavioralComposureScore: scorecard.breakdown.behavioral,
                focusIntegrity: scorecard.breakdown.focus
            };

            if (isExit) {
                sessionData.status = 'REVIEW_PENDING'; // Mark as ready for Recruiter
            }

            sessionData.conversationHistory = history;
            await SQLiteDB.saveSession(sessionId, sessionData);

            return res.json({
                reply: null, // No AI reply needed for system logs
                sender: 'system',
                scorecard: sessionData.auditMetrics
            });
        }

        // 2. UPDATE AUDIT METRICS (B-TRA)
        const stressEventsCount = history.filter(h => h.metadata && h.metadata.stressLevelDetected === 'High').length;

        const scorecard = ScoringService.calculateScorecard({
            stressEvents: stressEventsCount + (inactivityFlag ? 1 : 0),
            focusIntegrity: focusScore,
            stagesCompleted: currentStage,
            codeQualityPass: currentStage >= 3
        });

        sessionData.auditMetrics = {
            ...sessionData.auditMetrics, // Preserve Tech Score
            hiringRiskScore: scorecard.hiringRiskScore,
            behavioralComposureScore: scorecard.breakdown.behavioral,
            focusIntegrity: scorecard.breakdown.focus
        };

        // 3. AI ORCHESTRATION (Agents)
        const agentResponse = await AgentOrchestrator.routeMessage(history, currentStage);

        history.push(agentResponse);

        // 4. CHECK STAGE PROGRESSION
        if (agentResponse.metadata && agentResponse.metadata.stageComplete) {
            currentStage++;
            sessionData.currentStage = currentStage;
        }

        // SAVE UPDATE TO LOCAL DB (Async)
        sessionData.conversationHistory = history;
        await SQLiteDB.saveSession(sessionId, sessionData);

        // 5. Respond to Client
        res.json({
            reply: agentResponse.content,
            sender: agentResponse.role, // 'product_manager', 'tech_lead', 'devops'
            stress_trigger: agentResponse.metadata ? agentResponse.metadata.stressLevelDetected === 'High' : false,
            stage: currentStage,
            scorecard: sessionData.auditMetrics // Live feedback
        });

    } catch (error) {
        console.error('Error handling turn:', error);
        res.json({
            reply: "System failure. Connection rebooting...",
            sender: 'devops',
            stress_trigger: false,
            stage: 1
        });
    }
};

exports.getResults = async (req, res) => {
    const { sessionId } = req.params;
    const sessionData = await SQLiteDB.getSession(sessionId);
    res.json(sessionData || {});
};

exports.getCandidates = async (req, res) => {
    try {
        const candidatesMap = await SQLiteDB.getAllCandidates();
        const consolidatedMap = new Map();

        // 1. Group by Email/Name and Pick the "Best" Session
        Object.values(candidatesMap).forEach(session => {
            const meta = session.metadata || {};
            const email = meta.email || meta.name || 'unknown'; // Key for deduplication

            const existing = consolidatedMap.get(email);
            const currentHistoryLen = (session.conversationHistory || []).length;
            const existingHistoryLen = existing ? (existing.conversationHistory || []).length : -1;

            // Logic: Prefer the session with more activity (avoids 0-risk ghost sessions)
            // If activity is equal, prefer the one with a later timestamp (implied by ID or we could check metadata)
            if (currentHistoryLen > existingHistoryLen) {
                consolidatedMap.set(email, session);
            }
        });

        // 2. Transform to Array
        const candidatesArray = Array.from(consolidatedMap.values()).map(session => {
            const metrics = session.auditMetrics || {};
            const meta = session.metadata || {};

            // Determine Status based on Risk Score
            let status = 'REVIEW';
            if (session.status === 'REVIEW_PENDING') status = 'REVIEW'; // Distinct status from backend
            else if (metrics.hiringRiskScore < 30) status = 'HIRE';
            else if (metrics.hiringRiskScore > 70) status = 'REJECT';

            return {
                id: session.sessionId,
                name: meta.name || 'Anonymous',
                role: 'Full Stack Developer',
                email: meta.email,
                photo: meta.photo, // EXPOSE PHOTO
                riskScore: metrics.hiringRiskScore || 0,
                focus: metrics.focusIntegrity || 100,
                status: status,
                // NEW: Detailed Report Data
                logs: session.conversationHistory || [],
                techScore: metrics.technicalScore || 0,
                behaviorScore: metrics.behavioralComposureScore || 100,
                stressEvents: (session.conversationHistory || []).filter(h => h.metadata?.stressLevelDetected === 'High').length
            };
        });

        res.json(candidatesArray);
    } catch (error) {
        console.error("Get Candidates Error:", error);
        res.status(500).json({ error: "Failed to fetch candidates" });
    }
};

exports.deleteCandidate = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const changes = await SQLiteDB.deleteSession(sessionId);

        if (changes > 0) {
            res.json({ message: "Candidate removed successfully" });
        } else {
            res.status(404).json({ error: "Candidate not found" });
        }
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete candidate" });
    }
};

exports.uploadSnapshot = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { image } = req.body; // Base64 string

        if (!image) return res.status(400).json({ error: "No image data" });

        const session = await SQLiteDB.getSession(sessionId);
        if (!session) return res.status(404).json({ error: "Session not found" });

        // Update Metadata with Image
        session.metadata = { ...session.metadata, photo: image };

        await SQLiteDB.saveSession(sessionId, session);
        res.json({ message: "Snapshot saved" });

    } catch (error) {
        console.error("Snapshot Upload Error:", error);
        res.status(500).json({ error: "Failed to save snapshot" });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        if (!email || !name) return res.status(400).json({ error: "Name and Email required" });

        const user = {
            name,
            email,
            role: role || 'candidate'
        };

        await SQLiteDB.saveUser(user);
        console.log(`👤 New User Registered (SQLite): ${name} (${email})`);
        res.json({ message: "Registration successful", user });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Registration failed or Email exists" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        const user = await SQLiteDB.getUser(email);

        if (!user) {
            return res.status(404).json({ error: "User not found. Please Sign Up first." });
        }

        // In a real app we'd check password, but for this demo email verification proves "account exists"
        res.json({ message: "Login successful", user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

exports.submitCode = async (req, res) => {
    try {
        const { sessionId, questionId, code, passed } = req.body;

        // Load Session (Async)
        let sessionData = await SQLiteDB.getSession(sessionId);

        if (!sessionData) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (passed) {
            // INCREMENT TECHNICAL SCORE
            // Initialize if missing
            if (!sessionData.auditMetrics) sessionData.auditMetrics = {};

            const currentTech = sessionData.auditMetrics.technicalScore || 0;
            const newTech = Math.min(100, currentTech + 34); // 3 questions = ~100%

            sessionData.auditMetrics.technicalScore = newTech;

            // Recalculate Risk Score (Simple heuristic for demo)
            // Tech Score reduces Risk.
            // Risk = 100 - (0.6 * Tech + 0.4 * Behavioral)
            const behavioral = sessionData.auditMetrics.behavioralComposureScore || 100;
            const risk = Math.max(0, 100 - (0.6 * newTech + 0.4 * behavioral));

            sessionData.auditMetrics.hiringRiskScore = Math.round(risk);

            // Log Event
            if (!sessionData.conversationHistory) sessionData.conversationHistory = [];
            sessionData.conversationHistory.push({
                role: 'system',
                content: `✅ Candidate solved Problem #${questionId} | Technical Score: ${newTech}%`,
                timestamp: new Date()
            });

            await SQLiteDB.saveSession(sessionId, sessionData);

            console.log(`💻 Code Solved: Session ${sessionId} | Score: ${newTech}%`);
        }

        res.json({
            message: "Score Updated",
            scores: sessionData.auditMetrics
        });

    } catch (error) {
        console.error("Code Submit Error:", error);
        res.status(500).json({ error: "Submission failed" });
    }
};

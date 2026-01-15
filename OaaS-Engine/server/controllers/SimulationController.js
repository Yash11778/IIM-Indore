require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SessionModel } = require('../models/SessionModel');

// Initialize Gemini Client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// MOCK SCENARIO (Fallback if no API Key)
const SCENARIO_STAGES = {
    0: { // Intro
        text: "We have a critical production issue. The payment gateway is rejecting 50% of transactions. I need you to investigate the logs and propose a fix within 1 hour.",
        next_trigger: ["log", "check", "monitor", "dashboard"],
        audit: { stress: false, skill: "Incident Response" }
    },
    1: { // Logs Phase
        text: "I've shared the logs. You see a spike in 'Connection Timeout' errors from the 'OrderService' to the 'InventoryDB'. What's your immediate hypothesis?",
        next_trigger: ["db", "database", "connection", "pool", "timeout", "latency"],
        audit: { stress: false, skill: "Root Cause Analysis" }
    },
    2: { // Root Cause Phase
        text: "Good catch. The DB connection pool is saturated. We deployed a new marketing campaign 2 hours ago. How do we mitigate this IMMEDIATELY? We are losing $50k/minute.",
        next_trigger: ["scale", "rollback", "cache", "limit", "restart", "kill"],
        audit: { stress: true, skill: "Crisis Management" } // Stress trigger!
    },
    3: { // Resolution Phase
        text: "Okay, rolling back the compiled query changes and increasing pool size... Metrics are stabilizing. Good work under pressure. Send me a quick RCA (Root Cause Analysis) summary.",
        next_trigger: ["rca", "campaign", "traffic", "optimization", "index"],
        audit: { stress: false, skill: "Communication" }
    },
    4: { // End
        text: "Scenario Complete. I've logged your performance. You can check your Readiness Report in the dashboard.",
        finished: true,
        audit: { stress: false, skill: "Completion" }
    }
};

let currentStage = 0;

const aiClient = {
    generateContent: async (prompt) => {
        // 1. OPENROUTER MODE
        if (process.env.OPENROUTER_API_KEY) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "google/gemini-2.0-flash-exp:free", // Free tier model
                        "messages": [
                            { "role": "system", "content": SYSTEM_PROMPT },
                            { "role": "user", "content": prompt }
                        ]
                    })
                });

                const data = await response.json();
                if (data.error) throw new Error(JSON.stringify(data.error));

                const responseText = data.choices[0].message.content;

                // Sanitize JSON
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : responseText;

                return { response: jsonStr };
            } catch (error) {
                console.error("OpenRouter API Error:", error);
                // Fallthrough to mock
            }
        }

        // 2. REAL AI MODE (Gemini Direct)
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                return { response: jsonMatch ? jsonMatch[0] : responseText };
            } catch (error) { console.error("Gemini Error:", error); }
        }

        // 3. MOCK MODE (Fallback)
        console.log("Using Mock AI (Fallback)");
        await new Promise(r => setTimeout(r, 1000));

        const input = prompt.toLowerCase();
        const stageConfig = SCENARIO_STAGES[currentStage];
        let responseText = "";
        let impact = 0;

        if (stageConfig.next_trigger && stageConfig.next_trigger.some(keyword => input.includes(keyword))) {
            currentStage = Math.min(currentStage + 1, 4);
            responseText = SCENARIO_STAGES[currentStage].text;
            impact = 5;
        } else {
            responseText = "That doesn't seem relevant. Focus! " + stageConfig.text;
            impact = -2;
        }

        return {
            response: JSON.stringify({
                office_message: responseText,
                internal_audit: {
                    stress_trigger: SCENARIO_STAGES[currentStage].audit?.stress || false,
                    reasoning: impact > 0 ? "User progressed." : "User stalled.",
                    competency_check: SCENARIO_STAGES[currentStage].audit?.skill,
                    current_score_impact: impact
                }
            })
        };
    }
};

const SYSTEM_PROMPT = `
You are an AI Manager in a high-stakes corporate simulation. 
Your goal is NOT to help the user, but to AUDIT their readiness.
Role: Senior Engineering Manager.
Tone: Professional, terse, demanding but fair.
Rules:
1. Never give the answer.
2. If the user is vague, push back.
3. If the user delays, express urgency.
4. Output strict JSON format.

Output JSON Structure:
{
  "office_message": "The text displayed to the user in the chat interface.",
  "internal_audit": {
    "stress_trigger": boolean, // Set to true if inactivity > 3 mins or poor answer
    "reasoning": "Why you replied this way.",
    "competency_check": "What skill is being tested now?",
    "current_score_impact": number // -10 to +10 change in perception
  }
}
`;

// IN-MEMORY STORE (Fallback)
const memorySessions = {};

exports.startSimulation = async (req, res) => {
    try {
        const { userId, domain } = req.body;

        // Reset Scenario
        currentStage = 0;
        const initialPrompt = SCENARIO_STAGES[0].text;

        let sessionId;
        let initialHistory = [{
            role: 'model',
            content: initialPrompt,
            metadata: { stressLevelDetected: 'Low' }
        }];

        if (global.mongoConnected) {
            const session = new SessionModel({
                userId,
                domain,
                conversationHistory: initialHistory
            });
            await session.save();
            sessionId = session._id;
        } else {
            // In-Memory Fallback
            sessionId = 'session_' + Date.now();
            memorySessions[sessionId] = {
                userId,
                domain,
                conversationHistory: initialHistory
            };
        }

        res.status(201).json({
            sessionId: sessionId,
            message: initialPrompt,
            stage: 0
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleTurn = async (req, res) => {
    try {
        const { sessionId, userMessage, inactivityFlag } = req.body;

        let sessionData;
        let history = [];

        // FETCH SESSION
        if (global.mongoConnected) {
            sessionData = await SessionModel.findById(sessionId);
            if (!sessionData) return res.status(404).json({ error: 'Session not found' });
            history = sessionData.conversationHistory;
        } else {
            sessionData = memorySessions[sessionId];
            if (!sessionData) return res.status(404).json({ error: 'Session not found (Memory)' });
            history = sessionData.conversationHistory;
        }

        // 1. Record User Turn
        history.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        // 2. Construct AI Context
        // Convert Mongoose array to plain JS if needed, or just slice
        let contextHistory = history.slice(-5);
        let contextInput = `History: ${JSON.stringify(contextHistory)} \n User Input: ${userMessage}`;

        if (inactivityFlag) {
            contextInput += " [SYSTEM NOTE: User has been inactive for > 3 minutes. Trigger Stress Test.]";
        }

        // 3. Call AI
        const rawResponse = await aiClient.generateContent(SYSTEM_PROMPT + contextInput);

        // Parse AI Response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(rawResponse.response);
        } catch (e) {
            console.error("Failed to parse AI JSON:", e);
            // Fallback if AI breaks JSON
            parsedResponse = {
                office_message: rawResponse.response, // Use the raw response text
                internal_audit: { stress_trigger: false, hiring_risk_score: 50 }
            };
        }

        // UPDATE SESSION METRICS
        const currentRisk = parsedResponse.internal_audit.hiring_risk_score || 50;
        // Impact of Cheating: If focus drops, Risk skyrockets
        const focusPenalty = (100 - (focusScore || 100));
        const adjustedRisk = Math.min(100, currentRisk + (focusPenalty * 0.5));

        sessionData.auditMetrics = {
            hiringRiskScore: adjustedRisk,
            behavioralComposureScore: 100 - adjustedRisk,
            focusIntegrity: focusScore || 100
        };

        // 5. Update Session with AI Turn
        history.push({
            role: 'model',
            content: parsedResponse.office_message,
            metadata: {
                responseData: JSON.stringify(parsedResponse.internal_audit),
                reactionTime: 0,
                stressLevelDetected: parsedResponse.internal_audit.stress_trigger ? 'High' : 'Low'
            }
        });

        // SAVE SESSION
        if (global.mongoConnected) {
            sessionData.conversationHistory = history; // Explicit assignment for Mongoose tracking
            await sessionData.save();
        } else {
            memorySessions[sessionId].conversationHistory = history;
        }

        res.json({
            reply: parsedResponse.office_message,
            stress_trigger: parsedResponse.internal_audit.stress_trigger,
            stage: currentStage
        });

    } catch (error) {
        console.error('Error handling turn:', error);
        res.status(500).json({ error: 'Simulation engine error' });
    }
};

/**
 * GET /api/simulation/results
 * Returns list of completed simulations with scores
 */
exports.getResults = async (req, res) => {
    try {
        let results = [];

        if (global.mongoConnected) {
            // Fetch from MongoDB
            const sessions = await SimulationSession.find().sort({ createdAt: -1 }).limit(50);
            results = sessions.map(s => formatSessionForDashboard(s));
        } else {
            // Fetch from Memory
            results = Object.values(memorySessions)
                .map(s => formatSessionForDashboard(s))
                .reverse(); // Show newest first
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ error: "Failed to fetch results" });
    }
};

// Helper to format raw data for the dashboard
function formatSessionForDashboard(session) {
    // Default values if audit hasn't happened yet
    const metrics = session.auditMetrics || {};

    // Calculate a simple aggregate score if not present
    const score = metrics.hiringRiskScore
        ? Math.round((1 - (metrics.hiringRiskScore / 100)) * 100) // Convert Risk to Readiness
        : 0;

    let riskLabel = 'Pending';
    if (metrics.hiringRiskScore) {
        riskLabel = metrics.hiringRiskScore > 70 ? 'High' : metrics.hiringRiskScore > 30 ? 'Medium' : 'Low';
    }

    return {
        id: session.sessionId || session._id,
        name: `Candidate ${typeof session.userId === 'string' ? session.userId.substring(0, 6) : 'Unknown'}`,
        role: "Full Stack Dev", // Hardcoded for this scenario
        score: score,
        risk: riskLabel,
        status: score > 70 ? 'Hired' : score > 0 ? 'Rejected' : 'In Progress',
        time: new Date(session.createdAt).toLocaleDateString()
    };
}

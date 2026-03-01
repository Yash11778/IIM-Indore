const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const PERSONAS = {
    TECH_LEAD: {
        id: "tech_lead",
        name: "Sarah (Tech Lead)",
        role: "Senior Staff Engineer",
        style: "Strict, code-focused, demands clean architecture.",
        systemPrompt: `You are Sarah, a Senior Staff Engineer. 
        Focus ONLY on code quality, design patterns, and performance. 
        If the user submits code, critique it harshly but fairly. 
        If they ask about requirements, redirect them to the PM.
        Your goal is to ensure the codebase remains maintainable.`
    },
    PRODUCT_MANAGER: {
        id: "pm",
        name: "Alex (Product Manager)",
        role: "Product Lead",
        style: "Urgent, business-focused, changes mind often.",
        systemPrompt: `You are Alex, the Product Lead. 
        Focus on business value, timelines, and user experience. 
        You often change requirements mid-stream. 
        Push the user to deliver faster. 
        Do not answer technical implementation questions.`
    },
    DEVOPS: {
        id: "devops",
        name: "Construct (DevOps Bot)",
        role: "Automated Site Reliability System",
        style: "Robotic, alert-heavy, purely factual.",
        systemPrompt: `You are Construct, the automated DevOps bot.
        You only speak in alerts, logs, and system status updates.
        Use format: [ALERT COMPONENT] Message.
        If the system is stable, report uptime.`
    }
};

/**
 * Determines which agent should respond based on the last user message or trigger.
 * Default is PM for general chat, Tech Lead for code, DevOps for system alerts.
 */
function routeToAgent(userMessage, context) {
    const msg = userMessage.toLowerCase();

    // Simple heuristic routing (Upgrade to LLM router for V2)
    if (msg.includes('git') || msg.includes('code') || msg.includes('refactor') || msg.includes('class')) {
        return PERSONAS.TECH_LEAD;
    }
    if (msg.includes('deploy') || msg.includes('server') || msg.includes('db') || msg.includes('latency')) {
        return PERSONAS.DEVOPS;
    }
    return PERSONAS.PRODUCT_MANAGER; // Default
}

const MOCK_SCRIPTS = {
    tech_lead: [
        "That's a decent start, but have you considered the memory complexity?",
        "Refactor this. It's too nested.",
        "Good. Now, proceed to the deployment phase.",
        "Your commit message is vague. Be more specific."
    ],
    pm: [
        "We're behind schedule! Can we ship this today?",
        "The client changed their mind. We need to support mobile.",
        "Focus on the MVP. Don't over-engineer it.",
        "Great progress! Let's get this in front of stakeholders."
    ],
    devops: [
        "[ALERT] High Latency detected in US-EAST-1.",
        "[INFO] Deployment pipeline active. Build #4021 pending.",
        "[WARN] CPU usage at 85%. Scaling required.",
        "[SUCCESS] Rollback complete. System stable."
    ]
};

const FALLBACK_PATTERNS = {
    tech_lead: [
        { keywords: ['hi', 'hello', 'hey'], response: "Hello. Let's keep this brief and focus on the code." },
        { keywords: ['help', 'stuck', 'error'], response: "Share your error log. I can't debug vague complaints." },
        { keywords: ['react', 'frontend'], response: "We use standard React hooks. Ensure your components are pure." },
        { keywords: ['node', 'backend', 'express'], response: "Keep the backend stateless. We need horizontal scalability." },
        { keywords: ['database', 'mongo', 'sql'], response: "We are monitoring query performance. Optimize your indices." },
        { keywords: ['good', 'thanks', 'ok'], response: "Understood. Proceed." }
    ],
    pm: [
        { keywords: ['hi', 'hello', 'hey'], response: "Hey! We're on a tight deadline. How's the feature coming along?" },
        { keywords: ['help', 'what', 'instructions'], response: "The requirement is simple: Build a high-frequency trading dashboard. Focus on the MVP." },
        { keywords: ['deadline', 'time', 'when'], response: "We launch in 48 hours. Velocity needs to increase." },
        { keywords: ['mobile', 'phone', 'responsive'], response: "Client just asked for mobile support. prioritization is key." },
        { keywords: ['good', 'thanks', 'ok'], response: "Great. Let's get this shipped." }
    ],
    devops: [
        { keywords: ['hi', 'hello', 'hey'], response: "[ACK] Connection established. System nominal." },
        { keywords: ['help', 'deploy', 'pipeline'], response: "[INFO] CI/CD pipeline is active. Push your code to trigger a build." },
        { keywords: ['error', 'fail', 'crash'], response: "[ALERT] Log anomaly detected. Please check your implementation." },
        { keywords: ['slow', 'latency', 'lag'], response: "[WARN] Latency spike in US-EAST-1. Optimize your API calls." }
    ]
};

async function generateAgentResponse(agent, history, userMessage) {
    if (!genAI) {
        // SMART FALLBACK (Keyword Matching)
        const msg = userMessage.toLowerCase();

        // 1. Check for specific Keyword Matches
        const agentPatterns = FALLBACK_PATTERNS[agent.id] || FALLBACK_PATTERNS.pm;
        for (const pattern of agentPatterns) {
            if (pattern.keywords.some(k => msg.includes(k))) {
                return { text: pattern.response, sender: agent.id };
            }
        }

        // 2. Contextual Triggers (Existing Logic Preserved & Enhanced)
        if (msg.includes('mvp') || msg.includes('requirement')) {
            return { text: "The MVP is a high-frequency trading dashboard. It needs a React frontend, Node.js backend, and a real-time WebSocket feed.", sender: agent.id };
        }

        // 3. Generic "On-Brand" Fallback (Avoids static looping)
        const genericFallbacks = {
            tech_lead: "I'm reviewing your PR. Make sure you handle edge cases.",
            pm: "Let's focus on user value. Does this feature solve the core problem?",
            devops: "[INFO] System awaiting input. Monitoring resources."
        };

        return {
            text: genericFallbacks[agent.id] || "Received.",
            sender: agent.id
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            generationConfig: {
                maxOutputTokens: 150,
            },
        });

        const fullPrompt = `${agent.systemPrompt}\n\nUser Message: ${userMessage}`;
        const result = await chat.sendMessage(fullPrompt);
        const responseText = result.response.text();

        return {
            text: responseText,
            sender: agent.id
        };

    } catch (error) {
        console.error("Gemini Interaction Failed:", error);
        return {
            text: `[System Error] ${agent.name} is offline.`,
            sender: "system"
        };
    }
}

/**
 * Main Orchestrator Function called by Controller
 */
async function routeMessage(history, currentStage) {
    const lastMessage = history[history.length - 1]; // User's latest msg

    // 1. Decide WHO should speak
    const agent = routeToAgent(lastMessage.content, currentStage);

    // 2. Generate content (try LLM, fallback to rules if needed)
    const response = await generateAgentResponse(agent, history, lastMessage.content);

    return {
        role: response.sender,
        content: response.text,
        metadata: {
            stressLevelDetected: response.stressLevel || 'Normal',
            stageComplete: false // Logic to detect stage completion can go here
        },
        timestamp: new Date()
    };
}

module.exports = {
    PERSONAS,
    routeMessage, // EXPORTED NOW
    routeToAgent,
    generateAgentResponse
};

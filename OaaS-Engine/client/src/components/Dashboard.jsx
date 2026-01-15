import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Briefcase,
    FileText,
    AlertCircle,
    Send,
    Terminal as TerminalIcon,
    Code
} from 'lucide-react';
import Terminal from './Terminal';
import CodeEditor from './CodeEditor';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [stressLevel, setStressLevel] = useState('Low');
    const [showReport, setShowReport] = useState(false);
    const [currentStage, setCurrentStage] = useState(0);
    const [focusScore, setFocusScore] = useState(100); // BIO-METRIC
    const [tabSwitches, setTabSwitches] = useState(0);
    const inactivityTimerRef = useRef(null);

    // Auto-scroll to bottom of chat
    const chatEndRef = useRef(null);
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const lastWarningRef = useRef(0);

    // BIOMETRIC MONITORING (Anti-Cheating)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => prev + 1);
                setFocusScore(prev => Math.max(0, prev - 5)); // Reduced penalty from 15 to 5

                // Debounce Chat Warnings (Max 1 msg every 10 seconds)
                const now = Date.now();
                if (now - lastWarningRef.current > 10000) {
                    handleSystemMessage("⚠️ [NEURO-LINK] Focus Loss Detected. Integrity Score Dropped.");
                    lastWarningRef.current = now;
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    // Start Simulation Session on Mount
    useEffect(() => {
        const startSession = async () => {
            try {
                // Get user details from login
                const userName = localStorage.getItem('candidateName') || 'Guest Candidate';
                const userEmail = localStorage.getItem('candidateEmail') || 'guest@example.com';

                const res = await fetch('http://localhost:5001/api/simulation/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userEmail, // treating email as unique ID for now
                        name: userName,
                        domain: 'Full Stack Dev'
                    })
                });
                const data = await res.json();
                setSessionId(data.sessionId);
                setCurrentStage(data.stage);
                setMessages([{
                    id: Date.now(),
                    sender: 'manager',
                    text: data.message,
                    time: new Date().toLocaleTimeString()
                }]);
            } catch (err) {
                console.error("Failed to start session:", err);
                handleSystemMessage("⚠️ Connection Error: Is the backend server running?");
            }
        };
        startSession();
    }, []);

    // Activity Monitor (The "Stress Trigger")
    const resetInactivityTimer = () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

        inactivityTimerRef.current = setTimeout(() => {
            handleSystemMessage("⚠️ [SYSTEM ALERT] Manager is waiting for your response...");
            setStressLevel('High');
            // Optional: Notify backend of inactivity if needed
        }, 180000); // 3 minutes
    };

    useEffect(() => {
        resetInactivityTimer();
        return () => clearTimeout(inactivityTimerRef.current);
    }, [messages]);

    const handleSystemMessage = (text) => {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: text, time: new Date().toLocaleTimeString() }]);
    };

    const handleTerminalSuccess = () => {
        // This runs when they fix the config in the terminal
        handleSystemMessage("✅ [SYSTEM] Configuration Update Verified. DB Connection Pool Scaled.");
        // We simulate sending a message to the AI so it knows we fixed it
        const autoMsg = "I have scaled the DB_POOL_SIZE to 200 via the terminal. The database latency alerts should be resolving now.";
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'me',
            text: autoMsg,
            time: new Date().toLocaleTimeString()
        }]);
        handleSend(autoMsg);
    };

    const handleCodeSuccess = (challengeTitle) => {
        handleSystemMessage(`✅ [IDE] Unit Tests Passed for: ${challengeTitle}`);
        const autoMsg = `I have completed the coding challenge: ${challengeTitle}. Algorithm optimized.`;
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'me',
            text: autoMsg,
            time: new Date().toLocaleTimeString()
        }]);
        handleSend(autoMsg);
    };

    // SEND MESSAGE
    const handleSend = async (msgOverride = null) => {
        const textToSend = msgOverride || inputText;
        if (!textToSend.trim() && !sessionId) return;

        const userMsg = {
            id: Date.now(),
            sender: 'me',
            text: textToSend,
            time: new Date().toLocaleTimeString()
        };

        // Only add to messages if it's not an override (i.e., user typed it)
        if (!msgOverride) {
            setMessages(prev => [...prev, userMsg]);
            setInputText('');
        }
        resetInactivityTimer();

        try {
            const res = await fetch('http://localhost:5001/api/simulation/turn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    userMessage: textToSend,
                    inactivityFlag: stressLevel === 'High',
                    focusScore: focusScore // Send biometric data
                })
            });

            const data = await res.json();

            const aiMsg = {
                id: Date.now() + 1,
                sender: 'manager',
                text: data.reply,
                time: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, aiMsg]);

            if (data.stress_trigger) {
                setStressLevel('High');
                handleSystemMessage("⚠️ [AUDIT LOG] Stress response triggered. Competency score impacted.");
            } else {
                setStressLevel('Low');
            }

            if (data.stage !== undefined) setCurrentStage(data.stage);

            // Check for completion
            if (data.reply.includes("Scenario Complete")) {
                setTimeout(() => setShowReport(true), 2000);
            }

        } catch (error) {
            console.error("Simulation Error", error);
            handleSystemMessage("❌ Error communicating with the AI Manager.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-inter text-gray-800">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
                        <Briefcase size={24} />
                        <span>OaaS Engine</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Role: Senior Full-Stack Dev</p>
                </div>

                {/* NEURO-LINK BIOMETRICS HUD */}
                <div className="bg-gray-900 rounded-lg p-4 shadow-inner border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            Neuro-Link Active
                        </h3>
                        <span className="text-gray-500 text-xs">v2.1</span>
                    </div>

                    <div className="space-y-4">
                        {/* Focus Integrity */}
                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span>Focus Integrity</span>
                                <span className={focusScore < 70 ? 'text-red-400' : 'text-green-400'}>{focusScore}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${focusScore < 70 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                    style={{ width: `${focusScore}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Cognitive Load (Fake Viz) */}
                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span>Cognitive Load</span>
                                <span>{stressLevel === 'High' ? 'CRITICAL' : 'OPTIMAL'}</span>
                            </div>
                            <div className="flex gap-1 h-3 mt-1">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-[1px] ${i < (stressLevel === 'High' ? 9 : 3) ? 'bg-purple-500' : 'bg-gray-800'} transition-colors duration-300`}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Tab Switch Counter */}
                        {tabSwitches > 0 && (
                            <div className="text-xs text-red-400 font-mono text-center border border-red-900/50 bg-red-900/20 py-1 rounded">
                                ⚠️ DISTRACTION EVENTS: {tabSwitches}
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <TabButton icon={<MessageSquare size={18} />} label="Office Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
                    <TabButton icon={<TerminalIcon size={18} />} label="Terminal (SSH)" active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} />
                    <TabButton icon={<Code size={18} />} label="IDE (Code)" active={activeTab === 'ide'} onClick={() => setActiveTab('ide')} />
                    <TabButton icon={<AlertCircle size={18} />} label="Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className={`text-xs px-3 py-1 rounded-full w-fit ${stressLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Stress Level: {stressLevel}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6">
                    <h2 className="font-semibold text-gray-700">
                        {activeTab === 'chat' ? 'Direct Message: Alex (Engineering Manager)' : 'Assignments'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm text-gray-500">System Online</span>
                    </div>
                </header>

                {/* Chat Area */}
                {activeTab === 'chat' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="max-w-4xl mx-auto relative flex items-center gap-2">
                                <input
                                    type="text"
                                    className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Type your reply..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2">
                                Behavioral Audit Active. Response times and logic are being monitored.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab !== 'chat' && activeTab === 'tasks' && (
                    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                        <h3 className="font-bold text-xl mb-4 text-gray-800">Current Objectives</h3>
                        <ul className="space-y-3">
                            <TaskItem status="done" title="Onboard to communication channels" />
                            <TaskItem
                                status={currentStage >= 1 ? 'done' : 'active'}
                                title="Investigate Payment Gateway Alerts"
                            />
                            <TaskItem
                                status={currentStage >= 2 ? 'done' : currentStage === 1 ? 'active' : 'pending'}
                                title="Identify Root Cause (DB Connection Limit)"
                            />
                            <TaskItem
                                status={currentStage >= 3 ? 'done' : currentStage === 2 ? 'active' : 'pending'}
                                title="Implement Mitigation (Scale Pool/Rollback)"
                            />
                            <TaskItem
                                status={currentStage >= 4 ? 'done' : currentStage === 3 ? 'active' : 'pending'}
                                title="Submit Final RCA"
                            />
                        </ul>
                    </div>
                )}

                {activeTab !== 'chat' && activeTab === 'terminal' && (
                    <div className="flex-1 p-0 bg-gray-900 overflow-hidden flex flex-col">
                        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-100 flex items-center gap-2">
                                <TerminalIcon size={18} className="text-green-500" />
                                Production Server (SSH)
                            </h3>
                            <span className="text-xs text-gray-500">root@ip-10-0-0-15</span>
                        </div>
                        <div className="flex-1 p-2 overflow-hidden">
                            <Terminal onCorrectAction={handleTerminalSuccess} />
                        </div>
                    </div>
                )}

                {activeTab !== 'chat' && activeTab === 'ide' && (
                    <div className="flex-1 p-0 bg-gray-900 overflow-hidden flex flex-col">
                        <CodeEditor onComplete={handleCodeSuccess} />
                    </div>
                )}

                {activeTab !== 'chat' && activeTab === 'ide' && (
                    <div className="flex-1 p-0 bg-gray-900 overflow-hidden flex flex-col">
                        <CodeEditor onComplete={handleCodeSuccess} />
                    </div>
                )}

                {/* Report Modal */}
                {showReport && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-300">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Readiness Audit Complete</h2>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-4 border-b">
                                    <span className="text-gray-500">Role Capability</span>
                                    <span className="text-green-600 font-bold text-xl">HIRED</span>
                                </div>

                                <div className="space-y-3">
                                    <ScoreBar label="Incident Response" score={85} />
                                    <ScoreBar label="Tech Communication" score={92} />
                                    <ScoreBar label="Pressure Handling" score={stressLevel === 'High' ? 40 : 88} />
                                </div>

                                <p className="text-sm text-gray-500 italic mt-4">
                                    "Candidate showed strong initial instincts but hesitated slightly during the database root cause analysis. Excellent final recovery."
                                </p>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                                >
                                    Start New Simulation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components
const TaskItem = ({ status, title }) => (
    <li className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
            {status === 'done' && <div className="h-2 w-2 bg-white rounded-full" />}
        </div>
        <span className={`${status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{title}</span>
    </li>
);

const ScoreBar = ({ label, score }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="font-bold text-indigo-600">{score}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${score}%` }} />
        </div>
    </div>
);

const TabButton = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
    >
        {icon}
        {label}
    </button>
);

const MessageBubble = ({ message }) => {
    const isMe = message.sender === 'me';
    const isSystem = message.sender === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center my-2">
                <span className="bg-yellow-50 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200">
                    {message.text}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-xl px-4 py-3 ${isMe
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {message.time}
                </span>
            </div>
        </div>
    );
};

export default Dashboard;

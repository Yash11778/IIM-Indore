import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Briefcase,
    FileText,
    AlertCircle,
    Terminal as TerminalIcon,
    Code
} from 'lucide-react';
import Terminal from './Terminal';
import CodeEditor from './CodeEditor';
import AgentChat from './AgentChat';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [stressLevel, setStressLevel] = useState('Low');
    const [showReport, setShowReport] = useState(false);
    const [currentStage, setCurrentStage] = useState(0);
    const [focusScore, setFocusScore] = useState(100);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [finalScorecard, setFinalScorecard] = useState(null);
    const [isTestActive, setIsTestActive] = useState(false); // LIFTED STATE
    const [candidateName, setCandidateName] = useState('Candidate'); // NEW STATE

    // Guard: Prevent accidental exit during test
    const handleTabSwitch = (newTab) => {
        // Log every tab switch for forensics
        handleSystemMessage(`[AUDIT] Candidate switched view to: ${newTab.toUpperCase()}`);

        if (activeTab === 'ide' && isTestActive && newTab !== 'ide') {
            const confirmExit = window.confirm(
                "⚠️ WARNING: Assessment in Progress!\n\nLeaving the IDE now will terminate the test session and impact your 'Focus Integrity' score.\n\nAre you sure you want to exit?"
            );

            if (confirmExit) {
                // PENALTY APPLIED
                setFocusScore(prev => Math.max(0, prev - 25)); // Major penalty
                setStressLevel('High');
                handleSystemMessage("⚠️ [AUDIT] Candidate abandoned technical assessment. Integrity score penalized (-25%).");
                setIsTestActive(false); // End test
                setActiveTab(newTab);
            }
        } else {
            setActiveTab(newTab);
        }
    };

    const lastWarningRef = useRef(0);
    const inactivityTimerRef = useRef(null);

    // BIOMETRIC MONITORING (Anti-Cheating)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => prev + 1);
                setFocusScore(prev => Math.max(0, prev - 5));

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
                const userName = localStorage.getItem('candidateName') || 'Guest Candidate';
                const userEmail = localStorage.getItem('candidateEmail') || 'guest@example.com';
                setCandidateName(userName);

                const res = await fetch('http://localhost:5002/api/simulation/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userEmail,
                        name: userName,
                        domain: 'Full Stack Dev'
                    })
                });
                const data = await res.json();
                setSessionId(data.sessionId);
                setCurrentStage(data.stage);
                setMessages([{
                    id: Date.now(),
                    sender: 'pm',
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

    // Activity Monitor
    const resetInactivityTimer = () => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

        inactivityTimerRef.current = setTimeout(() => {
            handleSystemMessage("⚠️ [SYSTEM ALERT] Manager is waiting for your response...");
            setStressLevel('High');
        }, 180000);
    };

    useEffect(() => {
        resetInactivityTimer();
        return () => clearTimeout(inactivityTimerRef.current);
    }, [messages]);

    const handleSystemMessage = async (text) => {
        const sysMsg = { id: Date.now(), sender: 'system', text: text, time: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, sysMsg]);

        // SYNC TO BACKEND (Crucial for Reporting)
        if (sessionId) {
            try {
                await fetch('http://localhost:5002/api/simulation/turn', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        userMessage: `[SYSTEM_EVENT] ${text}`, // Special flag for backend
                        inactivityFlag: false,
                        focusScore: focusScore
                    })
                });
            } catch (err) {
                console.error("Failed to sync system message", err);
            }
        }
    };

    const handleTerminalSuccess = () => {
        handleSystemMessage("✅ [SYSTEM] Configuration Update Verified. DB Connection Pool Scaled.");
        const autoMsg = "I have scaled the DB_POOL_SIZE to 200 via the terminal. The database latency alerts should be resolving now.";
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'me',
            text: autoMsg,
            time: new Date().toLocaleTimeString()
        }]);
        handleSend(autoMsg);
    };

    const handleGitPush = (branch) => {
        handleSystemMessage(`✅ [GIT] Pushed branch origin/${branch}. Notifying Tech Lead...`);
        const autoMsg = `I have pushed a fix to branch '${branch}'. Please review my PR.`;
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'me',
            text: autoMsg,
            time: new Date().toLocaleTimeString()
        }]);
        handleSend(autoMsg);
    }

    const handleCodeSuccess = (challengeTitle) => {
        handleSystemMessage(`✅ [IDE] Unit Tests Passed for: ${challengeTitle}`);
    };

    // SEND MESSAGE
    const handleSend = async (textToSend) => {
        if (!textToSend.trim() && !sessionId) return;

        const lastMsg = messages[messages.length - 1];
        if (!lastMsg || lastMsg.text !== textToSend) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'me',
                text: textToSend,
                time: new Date().toLocaleTimeString()
            }]);
        }

        resetInactivityTimer();

        try {
            setIsTyping(true);
            const res = await fetch('http://localhost:5002/api/simulation/turn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    userMessage: textToSend,
                    inactivityFlag: stressLevel === 'High',
                    focusScore: focusScore
                })
            });

            const data = await res.json();

            const aiMsg = {
                id: Date.now() + 1,
                sender: data.sender || 'manager',
                text: data.reply,
                time: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);

            if (data.stress_trigger) {
                setStressLevel('High');
                handleSystemMessage("⚠️ [AUDIT LOG] Stress response triggered. Competency score impacted.");
            } else {
                setStressLevel('Low');
            }

            if (data.scorecard) {
                setFinalScorecard(data.scorecard);
            }

            if (data.stage !== undefined) setCurrentStage(data.stage);

            if (data.reply.includes("Scenario Complete")) {
                setTimeout(() => setShowReport(true), 2000);
            }

        } catch (error) {
            console.error("Simulation Error", error);
            handleSystemMessage("❌ Error communicating with the AI Manager.");
            setIsTyping(false);
        }
    };

    const [timeRemaining, setTimeRemaining] = useState(3600); // 1 Hour in seconds

    // EXIT TEST LOGIC
    const handleExitTest = async () => {
        if (window.confirm("Are you sure you want to finish the test? This will submit your current progress and generate your final report.")) {
            // 1. Notify Verification System
            handleSystemMessage("⚠️ [SYSTEM] Candidate manually finished the session. Finalizing score...");

            // 2. Send Final Sync Event
            if (sessionId) {
                try {
                    await fetch('http://localhost:5002/api/simulation/turn', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId,
                            userMessage: `[SYSTEM_EVENT_EXIT] Candidate completed the proper test.`,
                            inactivityFlag: false,
                            focusScore: focusScore
                        })
                    });
                } catch (err) {
                    console.error("Exit sync failed", err);
                }
            }

            // 3. Clear Local Auth to prevent re-entry
            localStorage.removeItem('candidateName');
            localStorage.removeItem('candidateEmail');

            // 4. Redirect
            alert("Test Submitted Successfully. You may now close this window.");
            window.location.href = '/';
        }
    };

    // TIMER LOGIC
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSystemMessage("⏰ [SYSTEM ALERT] Time Limit Exceeded. Auto-submitting assessment...");
                    handleExitTest(); // Auto-exit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const webcamRef = useRef(null);

    const captureSnapshot = async () => {
        if (webcamRef.current && sessionId) {
            const image = webcamRef.current.getSnapshot();
            if (image) {
                try {
                    await fetch(`http://localhost:5002/api/simulation/session/${sessionId}/snapshot`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image })
                    });
                    // System Message for "Immersion"
                    // handleSystemMessage("[SYSTEM] Identity Verified via Biometric Scan."); 
                } catch (err) {
                    console.error("Snapshot upload failed", err);
                }
            }
        }
    };

    // Auto-capture when Test becomes Active
    useEffect(() => {
        if (isTestActive) {
            // Take initial snapshot after 2 seconds
            const timer = setTimeout(() => {
                captureSnapshot();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isTestActive, sessionId]);

    return (
        <div className="flex h-screen bg-gray-50 font-inter text-gray-800">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
                        <Briefcase size={24} />
                        <span>Proven.io</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mt-4 text-lg">{candidateName}</h3>
                    <p className="text-xs text-gray-400 mt-1">Role: Senior Full-Stack Dev</p>

                    {/* PROCTORING FEED */}
                    <div className="mt-4 flex justify-center">
                        <WebcamFeed ref={webcamRef} />
                    </div>

                    {/* TIMER WIDGET */}
                    <div className="mt-4 bg-slate-900 rounded p-3 text-center border border-slate-700 shadow-md">
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Time Remaining</span>
                        <div className={`text-2xl font-mono font-bold ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
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
                    <TabButton icon={<MessageSquare size={18} />} label="Office Chat" active={activeTab === 'chat'} onClick={() => handleTabSwitch('chat')} />
                    <TabButton icon={<TerminalIcon size={18} />} label="Terminal (SSH)" active={activeTab === 'terminal'} onClick={() => handleTabSwitch('terminal')} />
                    <TabButton icon={<Code size={18} />} label="IDE (Code)" active={activeTab === 'ide'} onClick={() => handleTabSwitch('ide')} />
                    <TabButton icon={<AlertCircle size={18} />} label="Tasks" active={activeTab === 'tasks'} onClick={() => handleTabSwitch('tasks')} />
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
                        {activeTab === 'chat' && 'Direct Message: Corporate Channel'}
                        {activeTab === 'terminal' && 'Production Terminal'}
                        {activeTab === 'ide' && 'Development Environment'}
                        {activeTab === 'tasks' && 'Jira Board'}
                    </h2>
                    <div className="flex items-center gap-4">
                        {isTestActive ? (
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Monitoring Active
                            </div>
                        ) : (
                            <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                                Environment Check
                            </div>
                        )}

                        <button
                            onClick={handleExitTest}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md"
                        >
                            Finish Test
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">System Online</span>
                        </div>
                    </div>
                </header>

                {/* ... (Rest of Dashboard Content) ... */}
                {/* Chat Area */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                        <MissionCard onAction={() => handleTabSwitch('ide')} />
                        <div className="flex-1 overflow-hidden">
                            <AgentChat
                                messages={messages}
                                onSendMessage={handleSend}
                                isTyping={isTyping}
                            />
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
                            <Terminal onGitPush={handleGitPush} />
                        </div>
                    </div>
                )}

                {activeTab !== 'chat' && activeTab === 'ide' && (
                    <div className="flex-1 p-0 bg-gray-900 overflow-hidden flex flex-col">
                        <CodeEditor
                            sessionId={sessionId}
                            isTestActive={isTestActive}
                            onStartTest={() => setIsTestActive(true)}
                        />
                    </div>
                )}

                {/* Report Modal */}
                {showReport && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-300">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Readiness Audit Complete</h2>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center py-4 border-b">
                                    <span className="text-gray-500">Validation Status</span>
                                    <span className={`font-bold text-xl ${finalScorecard?.status === 'HIRE' ? 'text-green-600' : 'text-red-500'}`}>
                                        {finalScorecard?.status || "PENDING"}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <ScoreBar label="Technical Execution" score={finalScorecard?.breakdown.technical || 0} />
                                    <ScoreBar label="Behavioral Resilience" score={finalScorecard?.breakdown.behavioral || 0} />
                                    <ScoreBar label="Focus Integrity" score={finalScorecard?.breakdown.focus || 0} />
                                </div>

                                <p className="text-sm text-gray-500 italic mt-4 bg-gray-50 p-3 rounded">
                                    "{finalScorecard?.notes || "Processing evaluation..."}"
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
const WebcamFeed = React.forwardRef((props, ref) => {
    const videoRef = useRef(null);
    const [error, setError] = useState(false);

    // Expose capture method
    React.useImperativeHandle(ref, () => ({
        getSnapshot: () => {
            if (videoRef.current) {
                const canvas = document.createElement("canvas");
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
                return canvas.toDataURL("image/jpeg", 0.7); // Return Base64
            }
            return null;
        }
    }));

    useEffect(() => {
        let stream = null;
        const startVideo = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setError(false);
            } catch (err) {
                console.error("Camera Access Denied:", err);
                setError(true);
            }
        };

        startVideo();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    if (error) {
        return (
            <div className="h-10 w-16 bg-red-900/20 rounded border border-red-500 flex items-center justify-center" title="Camera Blocked">
                <span className="text-[10px] text-red-500 font-bold">NO CAM</span>
            </div>
        );
    }

    return (
        <div className="relative group">
            <div className="h-10 w-16 bg-black rounded overflow-hidden border border-gray-300 shadow-sm relative">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover transform scale-125"
                />
            </div>
            {/* Status Indicator */}
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full border-2 border-white animate-pulse" title="Proctoring Active"></div>

            {/* Tooltip on Hover */}
            <div className="absolute hidden group-hover:block top-full mt-2 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                Proctoring Active
            </div>
        </div>
    );
});

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
            <span className="font-bold text-indigo-600">{Math.round(score)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
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

const MissionCard = ({ onAction }) => (
    <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-indigo-600" />
                Current Mission: Build MVP Dashboard
            </h3>
            <p className="text-sm text-gray-500">Implement React Frontend & Node.js Backend. Verify via Tests.</p>
        </div>
        <button
            onClick={onAction}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow"
        >
            <Code size={16} />
            Open IDE & Submit
        </button>
    </div>
);

export default Dashboard;

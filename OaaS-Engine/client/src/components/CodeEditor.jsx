import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { Play, CheckCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { QUESTIONS } from '../data/QuestionBank';

const CodeEditor = ({ sessionId, isTestActive, onStartTest }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [code, setCode] = useState(QUESTIONS[0].starterCode);
    const [output, setOutput] = useState("");
    const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].timeLimit);
    const [isSolved, setIsSolved] = useState(false);
    const [status, setStatus] = useState("idle");

    const currentQuestion = QUESTIONS[currentLevel];

    // Timer Logic
    useEffect(() => {
        if (!isTestActive) return; // Don't tick if not active

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentLevel, isTestActive]);

    // Reset when level changes
    useEffect(() => {
        setCode(currentQuestion.starterCode);
        setTimeLeft(currentQuestion.timeLimit);
        setIsSolved(false);
        setOutput("");
        setStatus("idle");
    }, [currentLevel]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRun = async () => {
        setStatus("running");
        setOutput("Running tests...");

        // 1. Client-Side Mock Validation (Immediate Feedback)
        setTimeout(async () => {
            const isValid = currentQuestion.testCase(code);

            if (isValid) {
                setStatus("success");
                setIsSolved(true);
                setOutput("✅ Tests Passed! Result: Correct. Syncing with HQ...");

                // 2. Report Success to Backend
                if (sessionId) {
                    try {
                        await fetch('http://localhost:5002/api/simulation/code-submit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sessionId,
                                questionId: currentQuestion.id,
                                code,
                                passed: true
                            })
                        });
                        console.log("Score synced with backend");
                    } catch (err) {
                        console.error("Score Sync Error:", err);
                    }
                }
            } else {
                setStatus("error");
                setIsSolved(false);
                setOutput("❌ Tests Failed. Logic incorrect.");
            }
        }, 1000);
    };

    const handleNext = () => {
        if (currentLevel < QUESTIONS.length - 1) {
            setCurrentLevel(prev => prev + 1);
        } else {
            setOutput("🎉 Assessment Complete! All levels cleared.");
        }
    };

    // --- START SCREEN OVERLAY ---
    if (!isTestActive) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-950 font-inter text-white">
                <div className="max-w-md text-center space-y-6 p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
                    <div className="mx-auto w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                        <Clock className="text-indigo-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Technical Assessment</h2>
                    <p className="text-gray-400">
                        You are about to start a timed coding challenge.
                        The environment includes a code editor and automated test cases.
                    </p>
                    <div className="text-sm bg-gray-800 p-4 rounded-lg text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-mono text-white">45 Minutes</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Questions:</span>
                            <span className="font-mono text-white">3 Problems</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Language:</span>
                            <span className="font-mono text-white">JavaScript (Node)</span>
                        </div>
                    </div>
                    <button
                        onClick={onStartTest}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                    >
                        Start Challenge
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        *By starting, you agree to webcam monitoring for proctoring purposes.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full font-inter bg-gray-950 text-white border-t border-gray-800">
            {/* LEFT PANE: DESCRIPTION */}
            <div className="w-1/2 border-r border-gray-800 flex flex-col bg-gray-900/30">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            {currentQuestion.title}
                        </h2>
                        <span className={`text-xs px-2 py-0.5 rounded ${currentQuestion.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                            currentQuestion.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-red-900 text-red-300'
                            }`}>
                            {currentQuestion.difficulty}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 bg-gray-800 px-3 py-1 rounded-full font-mono text-sm">
                        <Clock size={14} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none custom-scrollbar">
                    {/* Simplified Markdown Rendering */}
                    {currentQuestion.description.split('\n').map((line, i) => {
                        if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-gray-200 mt-4 mb-2">{line.replace('###', '')}</h3>;
                        if (line.startsWith('-')) return <li key={i} className="ml-4 list-disc text-gray-400">{line.replace('-', '')}</li>;
                        if (line.startsWith('```')) return null; // Skip code blocks in simple renderer
                        return <p key={i} className="text-gray-400 mb-2 leading-relaxed">{line}</p>;
                    })}
                </div>

                {/* Output Console */}
                <div className="h-40 border-t border-gray-800 bg-black p-4 font-mono text-sm overflow-y-auto">
                    <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Test Results</div>
                    <div className={`${status === 'success' ? 'text-green-400' :
                        status === 'error' ? 'text-red-400' : 'text-gray-300'
                        }`}>
                        {output || "Run code to see results..."}
                    </div>
                </div>
            </div>

            {/* RIGHT PANE: EDITOR */}
            <div className="w-1/2 flex flex-col bg-gray-950">
                {/* Tabs */}
                <div className="flex bg-gray-900 border-b border-gray-800">
                    <div className="px-4 py-2 text-sm bg-gray-950 text-white border-t-2 border-indigo-500 flex items-center gap-2">
                        <span className="text-indigo-400">JS</span>
                        solution.js
                    </div>
                </div>

                {/* Code Area */}
                <div className="flex-1 overflow-y-auto relative">
                    <Editor
                        value={code}
                        onValueChange={setCode}
                        highlight={code => highlight(code, languages.js)}
                        padding={24}
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                            minHeight: '100%',
                        }}
                        className="bg-transparent"
                    />
                </div>

                {/* Footer / Actions */}
                <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                    <button
                        onClick={handleRun}
                        disabled={status === 'running'}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition shadow-lg ${status === 'running' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                            'bg-indigo-600 hover:bg-indigo-500 text-white'
                            } ${!isSolved && 'animate-pulse'}`}
                    >
                        {status === 'running' ? <Clock size={18} className="animate-spin" /> : <Play size={18} />}
                        {status === 'running' ? 'Running Tests...' : 'Run Tests & Submit'}
                    </button>
                    {isSolved ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition animate-pulse"
                        >
                            Next Problem <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            disabled
                            className="px-6 py-2 bg-indigo-600/50 cursor-not-allowed text-white/50 rounded-lg text-sm font-bold flex items-center gap-2"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;

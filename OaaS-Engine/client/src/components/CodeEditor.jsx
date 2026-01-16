import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import { Play, CheckCircle, Code } from 'lucide-react';

const CodeEditor = ({ onComplete }) => {
    // Mock Dynamic Questions Pool
    // Single Static Scenario Question
    const scenarioQuestion = {
        id: 1,
        title: "Optimize High-Frequency Trade Execution",
        difficulty: "Hard",
        desc: `
**Problem Statement**
You are working on the core trading engine for a fintech client. The system receives a stream of buy/sell orders.
Your task is to implement a function \`optimizeQueue(orders)\` that reorders the execution processing to minimize total latency penalty.

**Input Format**
- An array of integers representing execution times for each order.

**Constraints**
- 1 <= orders.length <= 10^5
- Each order takes between 1ms and 100ms.

**Example**
Input: [10, 5, 20]
Output: [5, 10, 20] (Shortest Job First logic minimizes waiting time)
        `,
        starter: `/**
 * @param {number[]} orders - Array of execution times
 * @return {number[]} - Reordered array for minimal latency
 */
function optimizeQueue(orders) {
    // Write your code here
    
    return [];
}`,
        testCases: [
            { input: "[10, 5, 20]", expected: "[5, 10, 20]" },
            { input: "[100, 1, 50]", expected: "[1, 50, 100]" }
        ]
    };

    const [activeQuestion] = useState(scenarioQuestion);
    const [code, setCode] = useState(scenarioQuestion.starter);
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('idle'); // idle, running, success, fail

    const [activeTab, setActiveTab] = useState('description'); // description | results
    const [testResults, setTestResults] = useState(null);

    const runTests = () => {
        setStatus('running');
        setActiveTab('results');
        setTestResults(null);

        setTimeout(() => {
            // Fake execution logic - checks if code length suggests effort
            // In a real app, we'd eval() or send to backend
            const passed = code.length > 80 && (code.includes('sort') || code.includes('for'));

            setTestResults(activeQuestion.testCases.map((tc, i) => ({
                id: i,
                status: passed ? 'pass' : 'fail',
                input: tc.input,
                expected: tc.expected,
                actual: passed ? tc.expected : "[]"
            })));

            setStatus(passed ? 'success' : 'fail');
            if (passed && onComplete) onComplete(activeQuestion.title);
        }, 1500);
    };

    return (
        <div className="flex h-full font-inter bg-gray-900 text-white">
            {/* Left Panel: Tabs & Content */}
            <div className="w-2/5 border-r border-gray-700 flex flex-col bg-gray-900">
                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'description' ? 'bg-gray-800 text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'results' ? 'bg-gray-800 text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Test Results
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {activeTab === 'description' ? (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold mb-1">{activeQuestion.title}</h2>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${activeQuestion.difficulty === 'Hard' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                                {activeQuestion.difficulty}
                            </span>

                            <div className="mt-6 prose prose-invert prose-sm max-w-none">
                                <p className="whitespace-pre-wrap font-sans text-gray-300 text-sm leading-relaxed">
                                    {activeQuestion.desc}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300 space-y-4">
                            {!testResults && status !== 'running' && (
                                <div className="text-center text-gray-500 mt-10">
                                    <Play size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>Run code to see results</p>
                                </div>
                            )}

                            {status === 'running' && (
                                <div className="flex flex-col items-center justify-center mt-10 gap-3">
                                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm text-gray-400">Compiling & Testing...</span>
                                </div>
                            )}

                            {testResults && testResults.map((result) => (
                                <div key={result.id} className={`p-4 rounded-lg border ${result.status === 'pass' ? 'bg-green-900/10 border-green-800' : 'bg-red-900/10 border-red-800'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-bold ${result.status === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                                            Test Case {result.id + 1}
                                        </span>
                                        {result.status === 'pass' ? <CheckCircle size={14} className="text-green-400" /> : <div className="text-xs text-red-400">FAILED</div>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                        <div>
                                            <span className="text-gray-500 block mb-1">Input</span>
                                            <div className="bg-gray-950 p-2 rounded text-gray-300">{result.input}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block mb-1">Expected Output</span>
                                            <div className="bg-gray-950 p-2 rounded text-gray-300">{result.expected}</div>
                                        </div>
                                    </div>
                                    {result.status === 'fail' && (
                                        <div className="mt-2 text-xs font-mono">
                                            <span className="text-gray-500 block mb-1">Your Output</span>
                                            <div className="bg-black p-2 rounded text-red-300 border border-red-900/30">{result.actual}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <Editor
                        value={code}
                        onValueChange={code => setCode(code)}
                        highlight={code => highlight(code, languages.js)}
                        padding={24}
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                            minHeight: '100%',
                        }}
                        className="bg-gray-900"
                    />
                </div>

                <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
                    <div className="text-xs text-gray-500">JavaScript (Node.js 18.x)</div>
                    <div className="flex gap-3">
                        <button
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition"
                            onClick={() => setCode(activeQuestion.starter)} // Reset
                        >
                            Reset
                        </button>
                        <button
                            onClick={runTests}
                            className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition shadow-lg ${status === 'success'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                        >
                            {status === 'running' ? 'Running...' : status === 'success' ? 'Submitted' : 'Run Code'}
                            {status === 'success' ? <CheckCircle size={16} /> : <Play size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;

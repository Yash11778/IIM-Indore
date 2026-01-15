import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import { Play, CheckCircle, Code } from 'lucide-react';

const CodeEditor = ({ onComplete }) => {
    // Mock Dynamic Questions Pool
    const questions = [
        {
            id: 1,
            title: "Log Parser Utility",
            desc: "The auth service is failing. Write a function `parseLogs(logString)` that extracts all error messages with severity 'CRITICAL'.",
            starter: "function parseLogs(logs) {\n  // Your code here\n  return [];\n}"
        },
        {
            id: 2,
            title: "Connection Retry Logic",
            desc: "Implement an exponential backoff strategy for the database connection. Function `connectWithRetry(fn, retries)`.",
            starter: "async function connectWithRetry(fn, maxRetries) {\n  \n}"
        },
        {
            id: 3,
            title: "Data Sanitization",
            desc: "Sanitize the user input to prevent NoSQL injection. Remove operators like `$` from the input object.",
            starter: "function sanitize(inputObj) {\n  \n}"
        }
    ];

    const [activeQuestion, setActiveQuestion] = useState(questions[0]);
    const [code, setCode] = useState(questions[0].starter);
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('idle'); // idle, running, success, fail

    // Select random question on mount to simulate "Interviewer Choice"
    useEffect(() => {
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        setActiveQuestion(randomQ);
        setCode(randomQ.starter);
    }, []);

    const runTests = () => {
        setStatus('running');
        setOutput('Running test cases...');

        setTimeout(() => {
            // Fake execution logic for prototype
            if (code.length > 50) {
                setStatus('success');
                setOutput('Test Case 1: PASSED\nTest Case 2: PASSED\nTest Case 3: PASSED\n\n> All Tests Passed.');
                if (onComplete) onComplete(activeQuestion.title);
            } else {
                setStatus('fail');
                setOutput('SyntaxError: Unexpected token...\n(Hint: You need to implement the logic body)');
            }
        }, 1500);
    };

    return (
        <div className="flex h-full font-inter bg-gray-900 text-white">
            {/* Left Panel: Question */}
            <div className="w-1/3 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <Code size={18} />
                        <span className="text-xs font-bold tracking-wider uppercase">Coding Challenge</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">{activeQuestion.title}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        {activeQuestion.desc}
                    </p>
                </div>

                <div className="flex-1 p-6 bg-gray-800/50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Output / Console</h3>
                    <div className="font-mono text-sm p-4 bg-black rounded-lg min-h-[100px] text-gray-300 whitespace-pre-wrap border border-gray-700">
                        {output || "// Run code to see executed output..."}
                    </div>
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

import React, { useState, useEffect, useRef } from 'react';
import TypewriterText from './TypewriterText';

const Terminal = ({ onGitPush }) => {
    const [history, setHistory] = useState([
        { type: 'system', content: 'Legacy Payment Service v1.0.2' },
        { type: 'system', content: 'Environment: DEV-LOCAL' },
        { type: 'system', content: 'Type "help" for available commands.' }
    ]);
    const [input, setInput] = useState('');
    const [gitState, setGitState] = useState({
        initialized: false,
        branch: 'main',
        staged: [],
        commits: []
    });
    const [isMatrixActive, setIsMatrixActive] = useState(false);

    const endRef = useRef(null);
    const containerRef = useRef(null);

    const scrollToBottom = React.useCallback(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    useEffect(scrollToBottom, [history]);

    // Matrix Effect Helper
    useEffect(() => {
        if (!isMatrixActive) return;

        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        const interval = setInterval(() => {
            setHistory(prev => {
                const randomLine = Array(50).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join(' ');
                // Keep history size manageable
                const newHistory = [...prev, { type: 'matrix', content: randomLine }];
                if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
                return newHistory;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isMatrixActive]);

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            if (!cmd) return;

            // Stop matrix if running and user types anything (or special command to stop)
            if (isMatrixActive) {
                setIsMatrixActive(false);
                setHistory(prev => [...prev, { type: 'system', content: 'Matrix simulation terminated.' }]);
                setInput('');
                return;
            }

            const newHistory = [...history, { type: 'user', content: `dev@proven:~/project$ ${input}` }];
            const args = cmd.toLowerCase().split(' ');
            const baseCmd = args[0];

            // --- GIT COMMANDS ---
            if (baseCmd === 'git') {
                const subCmd = args[1];

                if (subCmd === 'init') {
                    setGitState({ ...gitState, initialized: true });
                    newHistory.push({ type: 'response', content: 'Initialized empty Git repository in /project/.git/' });
                }
                else if (subCmd === 'status') {
                    if (!gitState.initialized) {
                        newHistory.push({ type: 'error', content: 'fatal: not a git repository (or any of the parent directories): .git' });
                    } else {
                        newHistory.push({
                            type: 'response',
                            content: `On branch ${gitState.branch}\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\n    modified:   src/utils/UserAuth.js\n\nno changes added to commit (use "git add" and/or "git commit -a")`
                        });
                    }
                }
                else if (subCmd === 'add') {
                    if (args[2] === '.') {
                        setGitState(prev => ({ ...prev, staged: ['src/utils/UserAuth.js'] }));
                        newHistory.push({ type: 'response', content: '' }); // Silent success
                    } else {
                        newHistory.push({ type: 'error', content: 'Usage: git add .' });
                    }
                }
                else if (subCmd === 'commit') {
                    if (gitState.staged.length === 0) {
                        newHistory.push({ type: 'response', content: 'On branch ' + gitState.branch + '\nnothing to commit, working tree clean' });
                    } else if (!cmd.includes('-m')) {
                        newHistory.push({ type: 'error', content: 'Aborting commit due to empty commit message.' });
                    } else {
                        const msg = cmd.split('-m')[1]?.trim().replace(/['"]/g, '');
                        setGitState(prev => ({
                            ...prev,
                            staged: [],
                            commits: [...prev.commits, { id: Math.floor(Math.random() * 10000), msg }]
                        }));
                        newHistory.push({ type: 'response', content: `[${gitState.branch} ${Math.floor(Math.random() * 1000000)}] ${msg}\n 1 file changed, 12 insertions(+), 4 deletions(-)` });
                    }
                }
                else if (subCmd === 'push') {
                    newHistory.push({ type: 'response', content: 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nWriting objects: 100% (3/3), 420 bytes | 420.00 KiB/s, done.\nTotal 3 (delta 1), reused 0 (delta 0)\nTo github.com:org/legacy-payment.git' });
                    newHistory.push({ type: 'success', content: `   e23a1..f42d1  ${gitState.branch} -> ${gitState.branch}` });

                    // Trigger System Event
                    if (onGitPush) {
                        setTimeout(() => onGitPush(gitState.branch), 1000);
                    }
                }
                else if (subCmd === 'checkout') {
                    if (args[2] === '-b') {
                        const newBranch = args[3];
                        setGitState(prev => ({ ...prev, branch: newBranch }));
                        newHistory.push({ type: 'response', content: `Switched to a new branch '${newBranch}'` });
                    } else {
                        setGitState(prev => ({ ...prev, branch: args[2] }));
                        newHistory.push({ type: 'response', content: `Switched to branch '${args[2]}'` });
                    }
                }
                else {
                    newHistory.push({ type: 'response', content: `git: '${subCmd}' is not a git command. See 'git --help'.` });
                }
            }
            // --- STANDARD COMMANDS ---
            else if (baseCmd === 'ls') {
                newHistory.push({ type: 'response', content: 'src  package.json  README.md  tests  node_modules' });
            }
            else if (baseCmd === 'clear') {
                setHistory([]);
                setInput('');
                return;
            }
            else if (baseCmd === 'help') {
                newHistory.push({ type: 'response', content: 'Available commands: git, ls, cd, cat, clear, npm, matrix, integrity_check' });
            }
            else if (baseCmd === 'npm' && args[1] === 'test') {
                newHistory.push({ type: 'response', content: '> legacy-payment@1.0.0 test\n> jest\n\nPASS tests/auth.test.js\n  UserAuth\n    ✓ should store session (2ms)\n    ✕ should clear memory (Failed)\n\nTest Suites: 1 failed, 1 passed, 2 total\nTests:       1 failed, 3 passed, 4 total' });
            }
            // --- FUN COMMANDS ---
            else if (baseCmd === 'matrix') {
                setIsMatrixActive(true);
                newHistory.push({ type: 'system', content: 'Initiating Visual Interface Override...' });
            }
            else if (baseCmd === 'integrity_check') {
                newHistory.push({ type: 'system', content: 'Running System Diagnostics...' });
                setTimeout(() => setHistory(h => [...h, { type: 'success', content: 'CPU: OK\nRAM: OK\nNetwork: OK\nSecurity Breach: DETECTED' }]), 1500);
            }
            else {
                newHistory.push({ type: 'response', content: `Command not found: ${baseCmd}` });
            }

            setHistory(newHistory);
            setInput('');
        }
    };

    return (
        <div className="relative flex flex-col h-full bg-black font-mono text-sm p-4 overflow-hidden border-t border-gray-800 crt animate-flicker">
            {/* CRT Screen Overlay is handled by css class .crt */}

            <div className="text-green-500/80 text-xs mb-2 select-none border-b border-green-900/50 pb-1 flex justify-between items-center text-glow">
                <span>TERMINAL_V2.0 // SECURE_CONNECTION</span>
                <span className="animate-pulse">● LIVE</span>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto space-y-1 mb-2 custom-scrollbar z-10"
            >
                {history.map((line, i) => (
                    <div key={i} className={`
                        ${line.type === 'error' ? 'text-red-500 text-glow' : ''}
                        ${line.type === 'success' ? 'text-green-400 text-glow' : ''}
                        ${line.type === 'user' ? 'text-blue-300 font-bold text-glow' : ''}
                        ${line.type === 'response' ? 'text-gray-300' : ''}
                        ${line.type === 'system' ? 'text-yellow-500' : ''}
                        ${line.type === 'matrix' ? 'text-green-600 font-matrix opacity-70' : ''}
                        whitespace-pre-wrap leading-tight font-fira
                    `}>
                        {(line.type === 'response' || line.type === 'system') && !isMatrixActive ? (
                            <TypewriterText text={line.content} speed={1} onComplete={scrollToBottom} />
                        ) : (
                            line.content
                        )}
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <div className="flex items-center gap-2 pt-2 z-10 border-t border-green-900/30">
                <span className="text-green-500 font-bold text-glow">dev@proven:~/project$</span>
                <input
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-green-100 placeholder-green-800/50 focus:ring-0 text-glow caret-green-500"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    spellCheck="false"
                    placeholder={isMatrixActive ? "Press Enter to stop..." : ""}
                />
            </div>
        </div>
    );
};

export default Terminal;

import React, { useState, useEffect, useRef } from 'react';

const Terminal = ({ onCorrectAction }) => {
    const [history, setHistory] = useState([
        { type: 'system', content: 'Connected to payment-service-v4 (production)' },
        { type: 'system', content: 'Connection Pool Manager v2.1.0' },
        { type: 'system', content: 'Type "help" for check available commands.' }
    ]);
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [history]);

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            if (!cmd) return;

            const newHistory = [...history, { type: 'user', content: `admin@oaas:~$ ${input}` }];
            const args = cmd.split(' ');
            const baseCmd = args[0];

            // HELP
            if (baseCmd === 'help') {
                newHistory.push({
                    type: 'response', content:
                        `AVAILABLE COMMANDS:
  system      -----------------------
  status      Check service health metrics
  config      View current configuration
  set-config  Update configuration variable
  reboot      Restart system services
  
  diagnostics -----------------------
  logs        View recent application logs
  ps          List running processes
  netstat     Network connections
  ping        Test network connectivity
  
  files       -----------------------
  ls          List directory contents
  cat         Read file content
  
  misc        -----------------------
  whoami      Display current user
  clear       Clear terminal screen` });
            }
            // STATUS
            else if (baseCmd === 'status') {
                newHistory.push({ type: 'response', content: 'SERVICE: payment-gateway\nSTATUS:  DEGRADED [High Latency]\nUPTIME:  14d 2h 12m\n\nMETRICS:\n  CPU:     92% [CRITICAL]\n  MEMORY:  45%\n  DB_PEERS: 50/50 [MAX_CAPACITY]' });
            }
            // LOGS
            else if (baseCmd === 'logs') {
                newHistory.push({
                    type: 'error',
                    content: '[2026-01-15 14:32:01] [ERROR] ConnectionTimeout: Timeout waiting for free database connection.\n[2026-01-15 14:32:02] [WARN] Pool is exhausted (Size: 50). Retrying...'
                });
            }
            // CONFIG
            else if (baseCmd === 'config') {
                newHistory.push({ type: 'response', content: 'CURRENT CONFIGURATION:\n  ENV:           PRODUCTION\n  DB_HOST:       10.0.0.15\n  DB_POOL_SIZE:  50\n  TIMEOUT_MS:    3000' });
            }
            // LS
            else if (baseCmd === 'ls') {
                newHistory.push({ type: 'response', content: 'drwxr-xr-x  2 admin  admin  4096 Jan 15 10:00 .\ndrwxr-xr-x  4 root   root   4096 Jan 01 00:00 ..\n-rw-r--r--  1 admin  admin   450 Jan 15 14:28 config.env\n-rw-r--r--  1 admin  admin  2400 Jan 15 14:30 error.log\n-rwxr-x---  1 admin  admin  8042 Jan 10 09:00 deploy.sh' });
            }
            // CAT
            else if (baseCmd === 'cat') {
                if (args[1] === 'config.env') {
                    newHistory.push({ type: 'response', content: 'DB_HOST=10.0.0.15\nDB_USER=pg_admin\nDB_POOL_SIZE=50\nREDIS_URL=redis://cache:6379' });
                } else if (args[1] === 'error.log') {
                    newHistory.push({ type: 'error', content: '... [Truncated 500 lines] ...\nError: Max client connections reached (50/50).\nError: Max client connections reached (50/50).\nFatal: Pool exhausted.' });
                } else if (!args[1]) {
                    newHistory.push({ type: 'response', content: 'Usage: cat [filename]' });
                } else {
                    newHistory.push({ type: 'response', content: `cat: ${args[1]}: No such file or directory` });
                }
            }
            // PS
            else if (baseCmd === 'ps') {
                newHistory.push({
                    type: 'response', content:
                        `PID   USER   %CPU  %MEM  COMMAND
1     root   0.0   0.1   /sbin/init
44    admin  88.2  12.0  node server.js
89    postgres 5.0  8.0   postgres: writer process
92    redis    1.0  2.0   redis-server *:6379` });
            }
            // NETSTAT
            else if (baseCmd === 'netstat') {
                newHistory.push({
                    type: 'response', content:
                        `Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp       50      0 10.0.0.15:5432          192.168.1.104:49152     ESTABLISHED
tcp        0      0 10.0.0.15:5432          192.168.1.105:49155     TIME_WAIT` });
            }
            // PING
            else if (baseCmd === 'ping') {
                if (args[1]) {
                    newHistory.push({ type: 'response', content: `PING ${args[1]} (10.0.0.1): 56 data bytes\n64 bytes from 10.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms\n64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=0.058 ms\n64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms\n\n--- ${args[1]} ping statistics ---\n3 packets transmitted, 3 packets received, 0.0% packet loss` });
                } else {
                    newHistory.push({ type: 'response', content: 'Usage: ping [host]' });
                }
            }
            // WHOAMI
            else if (baseCmd === 'whoami') {
                newHistory.push({ type: 'response', content: 'admin' });
            }
            // REBOOT
            else if (baseCmd === 'reboot') {
                newHistory.push({ type: 'error', content: 'reboot: Operation not permitted (Must use sudo or fix configuration first)' });
            }
            // WINNING MOVE: SET-CONFIG
            else if (cmd.includes('set-config') && (cmd.includes('pool') || cmd.includes('200'))) {
                newHistory.push({ type: 'success', content: 'Applying configuration change...\n> SET DB_POOL_SIZE = 200\n> RESTARTING CONNECTION POOL...\n[SUCCESS] New configuration active. Connection queue clearing.' });
                if (onCorrectAction) onCorrectAction();
            }
            else if (baseCmd === 'set-config') {
                newHistory.push({ type: 'response', content: 'Usage: set-config [variable] [value]\nExample: set-config TIMEOUT_MS 5000' });
            }
            // CLEAR
            else if (baseCmd === 'clear') {
                setHistory([]);
                setInput('');
                return;
            }
            else {
                newHistory.push({ type: 'response', content: `Command not found: ${baseCmd}. Type "help" for list of commands.` });
            }

            setHistory(newHistory);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 font-mono text-sm p-4 overflow-hidden rounded-lg border border-gray-700 shadow-inner">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar">
                {history.map((line, i) => (
                    <div key={i} className={`
                        ${line.type === 'error' ? 'text-red-400' : ''}
                        ${line.type === 'success' ? 'text-green-400 font-bold' : ''}
                        ${line.type === 'user' ? 'text-cyan-300' : ''}
                        ${line.type === 'response' ? 'text-gray-300' : ''}
                        ${line.type === 'system' ? 'text-indigo-400 italic' : ''}
                        whitespace-pre-wrap leading-relaxed
                    `}>
                        {line.content}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-gray-700 pt-3">
                <span className="text-green-500 font-bold">admin@oaas:~$</span>
                <input
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 focus:ring-0"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    placeholder="Enter command..."
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

export default Terminal;

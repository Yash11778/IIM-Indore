import React, { useRef, useEffect } from 'react';
import { Send, CheckCircle, Terminal, User, Briefcase, Server, Code } from 'lucide-react';

const AgentChat = ({ messages, onSendMessage, isTyping }) => {
    const inputRef = useRef(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = () => {
        const text = inputRef.current.value.trim();
        if (text) {
            onSendMessage(text);
            inputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200 text-gray-500 text-xs flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="relative flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="Type your reply to the team..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400 px-1">
                    <span>Pro Tip: Be concise and professional.</span>
                    <span>Enter to send</span>
                </div>
            </div>
        </div>
    );
};

const ChatMessage = ({ message }) => {
    const isMe = message.sender === 'me';

    // Determine Persona Styling
    let avatarIcon = <User size={14} />;
    let avatarColor = "bg-gray-200 text-gray-600";
    let senderName = "Unknown";
    let bubbleStyle = "bg-white border-gray-100 text-gray-800";

    if (isMe) {
        avatarIcon = <User size={14} className="text-indigo-600" />;
        avatarColor = "bg-indigo-100 border-indigo-200";
        senderName = "You";
        bubbleStyle = "bg-indigo-600 text-white shadow-md border-indigo-600";
    } else {
        switch (message.sender) {
            case 'tech_lead':
                avatarIcon = <Code size={14} className="text-white" />;
                avatarColor = "bg-emerald-600 shadow-md";
                senderName = "Sarah details (Tech Lead)";
                bubbleStyle = "bg-emerald-50 border-emerald-100 text-emerald-900 border";
                break;
            case 'pm':
                avatarIcon = <Briefcase size={14} className="text-white" />;
                avatarColor = "bg-purple-600 shadow-md";
                senderName = "Alex (Product)";
                bubbleStyle = "bg-purple-50 border-purple-100 text-purple-900 border";
                break;
            case 'devops':
                avatarIcon = <Server size={14} className="text-white" />;
                avatarColor = "bg-slate-700 shadow-md";
                senderName = "Construct (DevOps Bot)";
                bubbleStyle = "bg-slate-100 border-slate-200 text-slate-800 font-mono text-xs border";
                break;
            default: // Fallback generic manager
                avatarIcon = <User size={14} className="text-white" />;
                avatarColor = "bg-gray-500";
                senderName = "Manager";
                bubbleStyle = "bg-gray-50 border-gray-200 text-gray-800 border";
        }
    }

    return (
        <div className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-transparent ${avatarColor} relative top-1`}>
                {avatarIcon}
            </div>

            {/* Bubble */}
            <div className="flex flex-col max-w-[75%]">
                {!isMe && <span className="text-[10px] text-gray-400 ml-1 mb-1 font-medium">{senderName}</span>}

                <div className={`px-4 py-3 shadow-sm rounded-2xl ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'} ${bubbleStyle}`}>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${message.sender === 'devops' ? 'font-mono' : ''}`}>
                        {message.text}
                    </p>
                </div>

                <div className={`text-[10px] flex items-center gap-1 mt-1 px-1 ${isMe ? 'text-indigo-200 justify-end' : 'text-gray-400'}`}>
                    {message.time}
                    {isMe && <CheckCircle size={10} />}
                </div>
            </div>
        </div>
    );
};

export default AgentChat;

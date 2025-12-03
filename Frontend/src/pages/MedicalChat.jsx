import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import Markdown from 'markdown-to-jsx';

export default function MedicalChat() {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hello! I'm your AI Medical Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            const data = await res.json();

            const botResponse = data.response || "I'm sorry, I couldn't process that request.";
            setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to server. Please check your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 h-[85vh] flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col border border-gray-100">

                {/* Header */}
                <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Medical Chat Assistant</h2>
                        <p className="text-blue-100 text-sm">Ask me anything about health</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {msg.role === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
                                    <Bot size={18} />
                                </div>
                            )}

                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                <div className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
                                    <Markdown options={{
                                        overrides: {
                                            ul: { props: { className: "list-disc pl-4 mb-2" } },
                                            ol: { props: { className: "list-decimal pl-4 mb-2" } },
                                            li: { props: { className: "mb-1" } },
                                            p: { props: { className: "mb-2 last:mb-0" } },
                                            strong: { props: { className: "font-bold" } },
                                        }
                                    }}>
                                        {msg.content}
                                    </Markdown>
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 mt-1">
                                    <User size={18} />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
                                <Bot size={18} />
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2">
                                <Loader className="animate-spin text-blue-600" size={20} />
                                <span className="text-gray-500 text-sm">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your health question..."
                            className="flex-1 bg-gray-100 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />

                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Send } from 'lucide-react';
import clsx from 'clsx';

const ChatInterface = ({
    messages,
    loading,
    messagesEndRef,
    input,
    setInput,
    handleSubmit,
    user
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                            "flex gap-4 max-w-3xl",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                            msg.role === 'user' ? "bg-purple-600" : "bg-blue-600"
                        )}>
                            {msg.role === 'user' ? "U" : <Terminal className="w-5 h-5 text-white" />}
                        </div>

                        <div className={clsx(
                            "p-4 rounded-2xl max-w-[80%]",
                            msg.role === 'user'
                                ? "bg-purple-600 text-white rounded-tr-none"
                                : "bg-gray-100 dark:bg-slate-700 dark:text-gray-100 rounded-tl-none"
                        )}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>

                            {msg.sql && (
                                <div className="mt-4 p-3 bg-slate-900 rounded-lg font-mono text-sm text-green-400 overflow-x-auto">
                                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs uppercase tracking-wider">
                                        <Terminal className="w-3 h-3" /> Generated SQL
                                    </div>
                                    {msg.sql}
                                </div>
                            )}

                            {msg.data && msg.data.length > 0 && (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-gray-200 dark:bg-slate-600">
                                            <tr>
                                                {Object.keys(msg.data[0]).map(key => (
                                                    <th key={key} className="px-4 py-2 rounded-t">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {msg.data.map((row, i) => (
                                                <tr key={i} className="border-b dark:border-slate-600 last:border-0">
                                                    {Object.values(row).map((val, j) => (
                                                        <td key={j} className="px-4 py-2">{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <Terminal className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={user.role === 'admin' ? "Ask anything (Admin Mode Active)..." : "Ask something like 'Show me all users'..."}
                        className={`flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${user.role === 'admin' ? 'border-purple-500/50' : ''}`}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                        <Send className="w-5 h-5" />
                        <span>Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;

import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Database, Shield, Moon, Sun, Download, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

function App() {
    const [darkMode, setDarkMode] = useState(true);
    const [user, setUser] = useState(null); // { name, email, role }
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your SQL Agent. Ask me anything about your data.' }
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

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
            } else {
                setLoginError(data.error || 'Login failed');
            }
        } catch (err) {
            setLoginError('Connection error');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setMessages([{ role: 'assistant', content: 'Hello! I am your SQL Agent. Ask me anything about your data.' }]);
        setEmail('');
        setPassword('');
    };

    const [confirmation, setConfirmation] = useState(null); // { sql, originalMessage }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    role: user?.role || 'user'
                })
            });
            const data = await res.json();

            if (data.requiresConfirmation) {
                setConfirmation({ sql: data.sql, originalMessage: input });
                setLoading(false);
                return;
            }

            const assistantMsg = {
                role: 'assistant',
                content: data.response,
                sql: data.sql,
                data: data.data
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: " + error.message }]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (confirmed) => {
        if (!confirmed) {
            setConfirmation(null);
            setMessages(prev => [...prev, { role: 'assistant', content: "Action cancelled." }]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/confirm-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: confirmation.sql, role: user?.role })
            });
            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Action executed successfully.",
                sql: confirmation.sql,
                data: data.data
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error executing action: " + error.message }]);
        } finally {
            setLoading(false);
            setConfirmation(null);
        }
    };

    if (!user) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">Welcome Back</h1>
                        <p className="text-gray-500 dark:text-gray-400">Sign in to access your data</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {loginError && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                                {loginError}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Try: <span className="font-mono text-blue-500">admin@example.com</span> / <span className="font-mono text-blue-500">admin123</span></p>
                        <p>Or: <span className="font-mono text-green-500">user@example.com</span> / <span className="font-mono text-green-500">user123</span></p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className="fixed top-0 w-full backdrop-blur-md bg-opacity-80 border-b border-gray-200 dark:border-gray-800 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">SQL Agent</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                            {user.role}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right hidden md:block">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 font-medium">
                            Logout
                        </button>
                        <div className="w-px h-6 bg-gray-700 mx-2"></div>
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-20 container mx-auto px-4 max-w-5xl">

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Talk to your Database
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Convert natural language into secure SQL queries instantly.
                        Powered by AI, protected by strict security protocols.
                    </p>
                </div>

                {/* Chat Interface */}
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

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    {[
                        { icon: Shield, title: "Secure by Design", desc: "Read-only access by default. Strict SQL validation prevents dangerous operations." },
                        { icon: Terminal, title: "Natural Language", desc: "No SQL knowledge required. Just ask questions in plain English or Italian." },
                        { icon: History, title: "History & Export", desc: "Keep track of your queries and export results for analysis." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>

            </main>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-500/20"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">Security Alert</h2>
                            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                                You are about to execute a dangerous operation (DELETE/DROP).
                                <br />
                                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-900 p-1 rounded mt-2 block break-all text-red-500">
                                    {confirmation.sql}
                                </span>
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleConfirm(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConfirm(true)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-lg shadow-red-500/30"
                                >
                                    Confirm Execution
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Mascot */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-8 right-8 z-50 hidden md:block"
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative group"
                >
                    <div className="absolute -top-16 right-0 bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-br-none shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity w-48 text-sm text-gray-600 dark:text-gray-300 pointer-events-none">
                        {loading ? "Thinking about your query..." : "I'm ready to help! Ask me anything."}
                    </div>
                    <img
                        src="/mascot.png"
                        alt="AI Mascot"
                        className="w-32 h-32 object-contain drop-shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                    />
                    {loading && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-ping" />
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}

export default App;

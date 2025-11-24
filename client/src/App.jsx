import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import Header from './components/Header';
import Hero from './components/Hero';
import ChatInterface from './components/ChatInterface';
import FeaturesGrid from './components/FeaturesGrid';
import ConfirmationModal from './components/ConfirmationModal';
import Mascot from './components/Mascot';

function App() {
    const [darkMode, setDarkMode] = useState(true);
    const [user, setUser] = useState(null); // { name, email, role }
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your SQL Agent. Ask me anything about your data.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

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
                setToken(data.token);
                localStorage.setItem('token', data.token);
            } else {
                setLoginError(data.error || 'Login failed');
            }
        } catch (err) {
            setLoginError('Connection error');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: input })
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sql: confirmation.sql })
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

    const downloadLastResult = () => {
        const lastMsgWithData = [...messages].reverse().find(m => m.data && m.data.length > 0);
        if (!lastMsgWithData) {
            alert("Nessun dato da scaricare.");
            return;
        }

        const rows = lastMsgWithData.data;
        // Convert to CSV with BOM and semicolon separator for Excel
        const headers = Object.keys(rows[0]).join(';');
        const csvRows = rows.map(row => Object.values(row).map(v => {
            if (v === null || v === undefined) return '';
            const stringValue = String(v);
            if (stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(';'));

        const csvContent = '\uFEFF' + [headers, ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'risultati_query.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const tableName = prompt("Enter table name for this CSV:");
        if (!tableName) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tableName', tableName);

        try {
            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Upload failed");
        }
    };

    if (!user) {
        return (
            <Login
                handleLogin={handleLogin}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loginError={loginError}
                darkMode={darkMode}
            />
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <Header
                user={user}
                handleLogout={handleLogout}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                downloadLastResult={downloadLastResult}
                handleFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
            />

            <main className="pt-24 pb-20 container mx-auto px-4 max-w-5xl">
                <Hero />

                <ChatInterface
                    messages={messages}
                    loading={loading}
                    messagesEndRef={messagesEndRef}
                    input={input}
                    setInput={setInput}
                    handleSubmit={handleSubmit}
                    user={user}
                />

                <FeaturesGrid />
            </main>

            <AnimatePresence>
                {confirmation && (
                    <ConfirmationModal
                        confirmation={confirmation}
                        handleConfirm={handleConfirm}
                    />
                )}
            </AnimatePresence>

            <Mascot loading={loading} />
        </div>
    );
}

export default App;

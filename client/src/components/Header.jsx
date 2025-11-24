import React from 'react';
import { Database, Download, Upload, Sun, Moon } from 'lucide-react';

const Header = ({
    user,
    handleLogout,
    darkMode,
    setDarkMode,
    downloadLastResult,
    handleFileUpload,
    fileInputRef
}) => {
    return (
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
                    {/* Export/Import Buttons */}
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={downloadLastResult}
                            className="text-xs bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors flex items-center gap-1"
                            title="Scarica l'ultima tabella visualizzata"
                        >
                            <Download className="w-3 h-3" /> Download CSV
                        </button>

                        {user.role === 'admin' && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".csv"
                                />
                                <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1">
                                    <Upload className="w-3 h-3" /> Import CSV
                                </button>
                            </>
                        )}
                    </div>

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
    );
};

export default Header;

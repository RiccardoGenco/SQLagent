import React from 'react';
import { Database } from 'lucide-react';

const Login = ({
    handleAuth,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loginError,
    darkMode
}) => {
    const [isRegistering, setIsRegistering] = React.useState(false);

    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        <Database className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{isRegistering ? 'Sign up to get started' : 'Sign in to access your data'}</p>
                </div>

                <form onSubmit={(e) => handleAuth(e, isRegistering)} className="space-y-6">
                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="user@example.com"
                            required
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
                            required
                        />
                    </div>

                    {loginError && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                            {loginError}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="font-bold text-blue-500 hover:text-blue-600 transition-colors"
                        >
                            {isRegistering ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

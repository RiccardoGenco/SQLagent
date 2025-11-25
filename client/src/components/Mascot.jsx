import React from 'react';
import { motion } from 'framer-motion';

const Mascot = ({ loading }) => {
    return (
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
                    src="/renekton.png"
                    alt="AI Mascot"
                    className="w-32 h-32 object-contain drop-shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                />
                {loading && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-ping" />
                )}
            </motion.div>
        </motion.div>
    );
};

export default Mascot;

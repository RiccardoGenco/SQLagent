import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const ConfirmationModal = ({ confirmation, handleConfirm }) => {
    return (
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
    );
};

export default ConfirmationModal;

import React from 'react';
import { Shield, Terminal, History } from 'lucide-react';

const FeaturesGrid = () => {
    const features = [
        { icon: Shield, title: "Secure by Design", desc: "Read-only access by default. Strict SQL validation prevents dangerous operations." },
        { icon: Terminal, title: "Natural Language", desc: "No SQL knowledge required. Just ask questions in plain English or Italian." },
        { icon: History, title: "History & Export", desc: "Keep track of your queries and export results for analysis." }
    ];

    return (
        <div className="grid md:grid-cols-3 gap-8 mt-20">
            {features.map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                        <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
            ))}
        </div>
    );
};

export default FeaturesGrid;

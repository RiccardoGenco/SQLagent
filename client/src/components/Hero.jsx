import React from 'react';

const Hero = () => {
    return (
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Talk to your Database
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Convert natural language into secure SQL queries instantly.
                Powered by AI, protected by strict security protocols.
            </p>
        </div>
    );
};

export default Hero;

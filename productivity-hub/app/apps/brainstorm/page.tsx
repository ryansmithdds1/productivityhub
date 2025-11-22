'use client';

import { useState } from 'react';
import { Lightbulb, Wand2 } from 'lucide-react';
import { HookGenerator } from './components/HookGenerator';
import { ScriptOutline } from './components/ScriptOutline';

export default function BrainstormPage() {
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState('');

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <Lightbulb size={32} />
                            </div>
                            Content Brainstormer
                        </h1>
                        <p className="text-gray-400 mt-1">Generate viral hooks and script structures in seconds.</p>
                    </div>
                </div>

                {/* Input Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                What is your topic?
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Real Estate, Keto Diet, Coding"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                What is the desired result?
                            </label>
                            <input
                                type="text"
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                placeholder="e.g. Build Wealth, Lose Weight, Get Hired"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <HookGenerator topic={topic} result={result} />
                    </div>
                    <div>
                        <ScriptOutline topic={topic} result={result} />
                    </div>
                </div>
            </div>
        </div>
    );
}

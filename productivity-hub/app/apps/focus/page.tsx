'use client';

import { FocusTimer } from './components/FocusTimer';
import { AmbientSounds } from './components/AmbientSounds';
import { TaskFocus } from './components/TaskFocus';
import { Headphones } from 'lucide-react';

export default function DeepWorkPage() {
    return (
        <div className="min-h-screen bg-gray-950 p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Headphones size={32} />
                        </div>
                        Deep Work Station
                    </h1>
                    <p className="text-gray-400 mt-1">Enter the flow state. Eliminate distractions.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column: Timer */}
                <div className="flex flex-col items-center space-y-12">
                    <FocusTimer />
                    <TaskFocus />
                </div>

                {/* Right Column: Environment */}
                <div className="space-y-8">
                    <AmbientSounds />

                    {/* Tips Card */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Deep Work Rules
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>No email or social media checks.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Phone in another room or Do Not Disturb.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Focus on one single task at a time.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>Embrace boredom; don't switch tasks when stuck.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

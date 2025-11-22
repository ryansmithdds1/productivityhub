'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const MODES = {
    pomodoro: { label: 'Pomodoro', minutes: 25 },
    shortBreak: { label: 'Short Break', minutes: 5 },
    longBreak: { label: 'Long Break', minutes: 15 },
    deepWork: { label: 'Deep Work', minutes: 50 },
};

export function FocusTimer() {
    const [mode, setMode] = useState<keyof typeof MODES>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timer when mode changes
    useEffect(() => {
        setIsActive(false);
        setTimeLeft(MODES[mode].minutes * 60);
    }, [mode]);

    // Timer logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play alarm sound here if we had one
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].minutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((MODES[mode].minutes * 60 - timeLeft) / (MODES[mode].minutes * 60)) * 100;

    return (
        <div className="flex flex-col items-center">
            {/* Mode Selector */}
            <div className="flex gap-2 mb-8 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                {(Object.keys(MODES) as Array<keyof typeof MODES>).map((key) => (
                    <button
                        key={key}
                        onClick={() => setMode(key)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === key
                                ? 'bg-gray-800 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        {MODES[key].label}
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className="relative w-80 h-80 mb-8 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
                    <circle
                        cx="160"
                        cy="160"
                        r="150"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-800"
                    />
                    <circle
                        cx="160"
                        cy="160"
                        r="150"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 150}
                        strokeDashoffset={2 * Math.PI * 150 * (1 - (100 - progress) / 100)}
                        className={`text-blue-500 transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-50'}`}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Time Text */}
                <div className="text-center z-10">
                    <div className="text-7xl font-bold text-white font-mono tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-gray-500 mt-2 uppercase tracking-widest text-sm">
                        {isActive ? 'Focusing' : 'Paused'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTimer}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                        }`}
                >
                    {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white flex items-center justify-center transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
}

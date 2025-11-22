'use client';

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import Link from 'next/link';

interface HabitLog {
    date: string;
    completed: boolean;
}

interface Habit {
    id: string;
    name: string;
    color: string;
    logs: HabitLog[];
}

export function HabitStreaks() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const res = await fetch('/api/habits');
                if (res.ok) {
                    const data = await res.json();
                    setHabits(data);
                }
            } catch (error) {
                console.error('Failed to fetch habits', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHabits();
    }, []);

    const calculateStreak = (logs: HabitLog[]) => {
        const logsMap = new Set(logs.map(log => log.date));
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (!logsMap.has(today) && !logsMap.has(yesterday)) return 0;

        let streak = 0;
        let currentDate = new Date();
        if (!logsMap.has(today)) {
            currentDate.setDate(currentDate.getDate() - 1);
        }

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (logsMap.has(dateStr)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    const getColorClass = (color: string) => {
        switch (color) {
            case 'green': return 'text-green-500';
            case 'blue': return 'text-blue-500';
            case 'red': return 'text-red-500';
            case 'orange': return 'text-orange-500';
            case 'purple': return 'text-purple-500';
            default: return 'text-green-500';
        }
    };

    if (loading || habits.length === 0) return null;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-500" />
                    Habit Streaks
                </h3>
                <Link
                    href="/apps/habits"
                    className="text-[10px] text-gray-500 hover:text-blue-400 transition-colors"
                >
                    View All →
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {habits.map(habit => {
                    const streak = calculateStreak(habit.logs);
                    return (
                        <div
                            key={habit.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors flex-shrink-0"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${getColorClass(habit.color).replace('text-', 'bg-')}`} />
                            <span className="text-xs text-gray-300 whitespace-nowrap">{habit.name}</span>
                            <div className={`flex items-center gap-0.5 text-xs font-bold ${streak > 0 ? 'text-orange-400' : 'text-gray-600'} ml-1`}>
                                {streak > 0 && <Flame size={12} className="animate-pulse" />}
                                <span>{streak}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

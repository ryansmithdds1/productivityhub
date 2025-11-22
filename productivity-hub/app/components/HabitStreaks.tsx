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
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame size={16} className="text-orange-500" />
                    Habit Streaks
                </h3>
                <Link
                    href="/apps/habits"
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                >
                    View All →
                </Link>
            </div>

            <div className="space-y-2">
                {habits.map(habit => {
                    const streak = calculateStreak(habit.logs);
                    return (
                        <div key={habit.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`w-2 h-2 rounded-full ${getColorClass(habit.color).replace('text-', 'bg-')}`} />
                                <span className="text-sm text-gray-300 truncate">{habit.name}</span>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-bold ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`}>
                                {streak > 0 && <Flame size={14} className="animate-pulse" />}
                                <span>{streak}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

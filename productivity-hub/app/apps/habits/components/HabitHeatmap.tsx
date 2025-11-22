'use client';

import { useState, useMemo } from 'react';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface HabitLog {
    id: string;
    date: string;
    completed: boolean;
}

interface Habit {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    logs: HabitLog[];
}

interface HabitHeatmapProps {
    habit: Habit;
    onToggle: (date: string, completed: boolean) => void;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
}

export function HabitHeatmap({ habit, onToggle, onEdit, onDelete }: HabitHeatmapProps) {
    const [hoveredDate, setHoveredDate] = useState<{ date: string; count: number } | null>(null);

    // Generate last 365 days
    const days = useMemo(() => {
        const result = [];
        const today = new Date();
        // Start from 52 weeks ago (approx 1 year) to align weeks nicely
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);

        // Adjust to start on Sunday
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        const endDate = new Date(today);

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            result.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return result;
    }, []);

    // Create a map for O(1) lookup
    const logsMap = useMemo(() => {
        const map = new Set(habit.logs.map(log => log.date));
        return map;
    }, [habit.logs]);

    const getColorClass = (completed: boolean) => {
        if (!completed) return 'bg-gray-800/50 hover:bg-gray-700/50';

        switch (habit.color) {
            case 'green': return 'bg-green-500 hover:bg-green-400';
            case 'blue': return 'bg-blue-500 hover:bg-blue-400';
            case 'red': return 'bg-red-500 hover:bg-red-400';
            case 'orange': return 'bg-orange-500 hover:bg-orange-400';
            case 'purple': return 'bg-purple-500 hover:bg-purple-400';
            default: return 'bg-green-500 hover:bg-green-400';
        }
    };

    const getStreak = () => {
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if completed today or yesterday to keep streak alive
        if (!logsMap.has(today) && !logsMap.has(yesterday)) return 0;

        let currentDate = new Date();
        // If not done today, start checking from yesterday
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

    const streak = getStreak();
    const completionRate = Math.round((habit.logs.length / 365) * 100);

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-12 rounded-full ${getColorClass(true).split(' ')[0]}`} />
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {habit.name}
                            {streak > 0 && (
                                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full flex items-center gap-1">
                                    <span className="animate-pulse">🔥</span> {streak} day streak
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500">{habit.description || 'No description'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                        <div className="text-2xl font-bold text-white">{habit.logs.length}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Days</div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(habit)}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(habit.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Month labels */}
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 min-w-max mb-2 ml-8">
                    {Array.from({ length: 12 }).map((_, monthIndex) => {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return (
                            <div key={monthIndex} className="text-xs text-gray-500" style={{ width: '44px' }}>
                                {monthNames[monthIndex]}
                            </div>
                        );
                    })}
                </div>

                {/* Heatmap Grid */}
                <div className="flex gap-1 min-w-max">
                    {/* Day labels */}
                    <div className="flex flex-col gap-1 mr-1">
                        <div className="h-3 text-xs text-gray-500">Sun</div>
                        <div className="h-3"></div>
                        <div className="h-3 text-xs text-gray-500">Tue</div>
                        <div className="h-3"></div>
                        <div className="h-3 text-xs text-gray-500">Thu</div>
                        <div className="h-3"></div>
                        <div className="h-3 text-xs text-gray-500">Sat</div>
                    </div>

                    {/* Weeks */}
                    {Array.from({ length: 53 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {/* Days in week */}
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayIndexTotal = weekIndex * 7 + dayIndex;
                                if (dayIndexTotal >= days.length) return null;

                                const date = days[dayIndexTotal];
                                const dateStr = date.toISOString().split('T')[0];
                                const isCompleted = logsMap.has(dateStr);
                                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                                return (
                                    <div
                                        key={dateStr}
                                        onClick={() => onToggle(dateStr, !isCompleted)}
                                        onMouseEnter={() => setHoveredDate({ date: formattedDate, count: isCompleted ? 1 : 0 })}
                                        onMouseLeave={() => setHoveredDate(null)}
                                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all relative group ${isCompleted
                                                ? getColorClass(true) + ' border-2 border-white/20'
                                                : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                                            }`}
                                        title={`${formattedDate}: ${isCompleted ? '✓ Completed' : 'Not done'}`}
                                    >
                                        {/* Tooltip on hover */}
                                        {hoveredDate?.date === formattedDate && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-950 border border-gray-700 rounded text-xs text-white whitespace-nowrap z-50 pointer-events-none">
                                                {formattedDate}
                                                <div className={`text-[10px] ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {isCompleted ? '✓ Completed' : 'Not completed'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Click any square to toggle completion</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Not Done</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gray-800/50 border border-gray-700" />
                    </div>
                    <span className="mx-2">→</span>
                    <span>Completed</span>
                    <div className="flex gap-1">
                        <div className={`w-3 h-3 rounded-sm ${getColorClass(true).split(' ')[0]} border-2 border-white/20`} />
                    </div>
                </div>
            </div>
        </div>
    );
}

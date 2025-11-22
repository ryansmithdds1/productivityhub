'use client';

import { useState, useEffect } from 'react';
import { Plus, Flame } from 'lucide-react';
import { HabitHeatmap } from './components/HabitHeatmap';
import { HabitModal } from './components/HabitModal';

interface Habit {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    logs: any[];
}

export default function HabitTrackerPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleSaveHabit = async (habitData: Partial<Habit>) => {
        try {
            if (editingHabit) {
                // Update
                const res = await fetch(`/api/habits/${editingHabit.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(habitData),
                });
                if (res.ok) fetchHabits();
            } else {
                // Create
                const res = await fetch('/api/habits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(habitData),
                });
                if (res.ok) fetchHabits();
            }
        } catch (error) {
            console.error('Failed to save habit', error);
        }
    };

    const handleDeleteHabit = async (id: string) => {
        if (!confirm('Are you sure you want to delete this habit? History will be lost.')) return;

        try {
            const res = await fetch(`/api/habits/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchHabits();
        } catch (error) {
            console.error('Failed to delete habit', error);
        }
    };

    const handleToggleLog = async (habitId: string, date: string, completed: boolean) => {
        // Optimistic update
        setHabits(prev => prev.map(h => {
            if (h.id !== habitId) return h;
            const newLogs = completed
                ? [...h.logs, { id: 'temp', date, completed: true }]
                : h.logs.filter(l => l.date !== date);
            return { ...h, logs: newLogs };
        }));

        try {
            await fetch('/api/habits/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ habitId, date, completed }),
            });
            // Refresh to get real IDs and ensure sync
            fetchHabits();
        } catch (error) {
            console.error('Failed to toggle log', error);
            fetchHabits(); // Revert on error
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                            <Flame size={32} />
                        </div>
                        Habit Heatmap
                    </h1>
                    <p className="text-gray-400 mt-1">Visualise your consistency and build streaks.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingHabit(undefined);
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    New Habit
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading habits...</div>
            ) : habits.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <Flame size={48} className="mx-auto text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No habits yet</h3>
                    <p className="text-gray-400 mb-6">Start tracking your first habit to see your heatmap.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create First Habit
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {habits.map(habit => (
                        <HabitHeatmap
                            key={habit.id}
                            habit={habit}
                            onToggle={(date, completed) => handleToggleLog(habit.id, date, completed)}
                            onEdit={(h) => {
                                setEditingHabit(h);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDeleteHabit}
                        />
                    ))}
                </div>
            )}

            <HabitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHabit}
                initialData={editingHabit}
            />
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Target } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate: number;
}

export function TaskFocus() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) {
                const data = await res.json();
                // Filter for today's tasks
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayTimestamp = today.getTime();

                const todaysTasks = data.filter((t: Task) =>
                    t.dueDate === todayTimestamp && !t.completed
                );
                setTasks(todaysTasks);
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleComplete = async (taskId: string) => {
        try {
            const res = await fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, completed: true }),
            });

            if (res.ok) {
                setTasks(prev => prev.filter(t => t.id !== taskId));
                if (activeTaskId === taskId) setActiveTaskId(null);
            }
        } catch (error) {
            console.error('Failed to complete task', error);
        }
    };

    const activeTask = tasks.find(t => t.id === activeTaskId);

    return (
        <div className="w-full max-w-md mx-auto">
            {activeTask ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 mb-4">
                        <Target size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{activeTask.title}</h3>
                    <p className="text-blue-300/70 text-sm mb-6">Current Focus</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => handleComplete(activeTask.id)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <CheckCircle2 size={18} />
                            Complete Task
                        </button>
                        <button
                            onClick={() => setActiveTaskId(null)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                        >
                            Change
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target size={16} />
                        Select Focus Task
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No pending tasks for today. Great job!
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {tasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => setActiveTaskId(task.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 text-left group transition-colors"
                                >
                                    <Circle size={18} className="text-gray-600 group-hover:text-blue-400" />
                                    <span className="text-gray-300 group-hover:text-white truncate">
                                        {task.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

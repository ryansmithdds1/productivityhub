'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, Calendar, Repeat, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/app/apps/todo/lib/storage';
import { isTaskDueToday, isTaskDueThisWeek, formatTimeBlock, getCategoryColor, getPriorityColor, shouldShowRecurringTask, getNextRecurrence } from '@/app/apps/todo/lib/utils';
import type { Task } from '@/app/apps/todo/types';

export function TodoDashboardWidget() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        loadTasks();

        // Refresh every minute
        const interval = setInterval(() => {
            loadTasks();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const loadTasks = async () => {
        const loadedTasks = await storage.getTasks();
        setTasks(loadedTasks);
    };

    const todayTasks = tasks.filter(isTaskDueToday).slice(0, 5);
    const weekTasks = tasks.filter(isTaskDueThisWeek).filter(t => !isTaskDueToday(t)).slice(0, 5);
    const recurringTasks = tasks.filter(shouldShowRecurringTask).slice(0, 3);

    const handleToggleComplete = async (task: Task) => {
        if (task.completed) {
            await storage.uncompleteTask(task);
        } else {
            await storage.completeTask(task);
        }
        await loadTasks();
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-orange-400" />
                    Today's Focus
                </h2>
                <Link
                    href="/apps/todo"
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                    View All →
                </Link>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-3 mb-6">
                {todayTasks.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                        No tasks for today. You're all set! 🎉
                    </p>
                ) : (
                    todayTasks.map(task => (
                        <div
                            key={task.id}
                            className={`border rounded-lg p-3 transition-all ${getCategoryColor(task.category)} ${task.completed ? 'opacity-50' : ''
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <button
                                    onClick={() => handleToggleComplete(task)}
                                    className="mt-0.5 hover:scale-110 transition-transform"
                                >
                                    {task.completed ? (
                                        <CheckCircle2 size={18} className="text-green-400" />
                                    ) : (
                                        <Circle size={18} className="text-gray-500" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                            {task.title}
                                        </p>
                                        {task.priority === 'high' && !task.completed && (
                                            <AlertCircle size={14} className={getPriorityColor(task.priority)} />
                                        )}
                                    </div>

                                    {task.timeBlock && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Clock size={12} />
                                            {formatTimeBlock(task.timeBlock.startTime, task.timeBlock.duration)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* This Week */}
            {weekTasks.length > 0 && (
                <div className="border-t border-gray-800 pt-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        This Week ({weekTasks.length})
                    </h3>
                    <div className="space-y-2">
                        {weekTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 text-sm">
                                <Circle size={14} className="text-gray-600" />
                                <span className="text-gray-300 flex-1">{task.title}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recurring Tasks */}
            {recurringTasks.length > 0 && (
                <div className="border-t border-gray-800 pt-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <Repeat size={16} />
                        Recurring ({recurringTasks.length})
                    </h3>
                    <div className="space-y-2">
                        {recurringTasks.map(task => {
                            const nextDate = getNextRecurrence(task);
                            return (
                                <div key={task.id} className="flex items-center gap-2 text-sm">
                                    <Repeat size={14} className="text-gray-600" />
                                    <span className="text-gray-300 flex-1">{task.title}</span>
                                    {nextDate && (
                                        <span className="text-xs text-gray-500">
                                            {new Date(nextDate).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

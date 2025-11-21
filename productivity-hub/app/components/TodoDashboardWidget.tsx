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

    const todayTasks = tasks.filter(isTaskDueToday).slice(0, 10);
    const weekTasks = tasks.filter(isTaskDueThisWeek).filter(t => !isTaskDueToday(t)).slice(0, 10);
    const recurringTasks = tasks.filter(shouldShowRecurringTask).slice(0, 10);

    const handleToggleComplete = async (task: Task) => {
        if (task.completed) {
            await storage.uncompleteTask(task);
        } else {
            await storage.completeTask(task);
        }
        await loadTasks();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Today's Tasks */}
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

                <div className="space-y-3">
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
            </div>

            {/* Column 2: This Week */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar size={24} className="text-blue-400" />
                        Due This Week
                    </h2>
                    <span className="text-sm text-gray-500">{weekTasks.length} tasks</span>
                </div>

                <div className="space-y-3">
                    {weekTasks.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                            No upcoming tasks for this week.
                        </p>
                    ) : (
                        weekTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                                <Circle size={16} className="text-gray-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-300 text-sm font-medium truncate">{task.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.category).split(' ')[0].replace('/20', '')}`} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Column 3: Recurring */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Repeat size={24} className="text-purple-400" />
                        Recurring
                    </h2>
                    <span className="text-sm text-gray-500">{recurringTasks.length} active</span>
                </div>

                <div className="space-y-3">
                    {recurringTasks.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                            No recurring tasks scheduled.
                        </p>
                    ) : (
                        recurringTasks.map(task => {
                            const nextDate = getNextRecurrence(task);
                            return (
                                <div key={task.id} className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                                    <Repeat size={16} className="text-purple-500/50" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-300 text-sm font-medium truncate">{task.title}</p>
                                        {nextDate && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Next: {new Date(nextDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 capitalize">
                                        {task.recurring?.frequency}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

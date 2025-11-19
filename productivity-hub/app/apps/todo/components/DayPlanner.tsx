'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import type { Task } from '../types';
import { formatTime, getCategoryColor } from '../lib/utils';
import { TaskCard } from './TaskCard';

interface DayPlannerProps {
    date: number;
    tasks: Task[];
    onTaskUpdate: () => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5 AM to 10 PM

export function DayPlanner({ date, tasks, onTaskUpdate }: DayPlannerProps) {
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);

    // Filter tasks for this day
    const dayTasks = tasks.filter(t => t.dueDate === date && !t.completed);

    // Separate scheduled and unscheduled
    const scheduledTasks = dayTasks.filter(t => t.timeBlock);
    const unscheduledTasks = dayTasks.filter(t => !t.timeBlock);

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDrop = (hour: number, minute: number) => {
        if (!draggedTask) return;

        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Update task with time block (default 60 minutes if not set)
        const updatedTask = {
            ...draggedTask,
            timeBlock: {
                startTime: startTime,
                duration: draggedTask.timeBlock?.duration || 60
            }
        };

        // Save to storage
        const { storage: taskStorage } = require('../lib/storage');
        taskStorage.saveTask(updatedTask);

        setDraggedTask(null);
        onTaskUpdate();
    };

    const getTasksForHour = (hour: number): Task[] => {
        return scheduledTasks.filter(task => {
            if (!task.timeBlock) return false;
            const [taskHour] = task.timeBlock.startTime.split(':').map(Number);
            return taskHour === hour;
        });
    };

    return (
        <div className="grid grid-cols-[200px_1fr] gap-6">
            {/* Unscheduled Tasks Sidebar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
                    Unscheduled
                </h3>
                <div className="space-y-2">
                    {unscheduledTasks.length === 0 ? (
                        <p className="text-gray-600 text-sm text-center py-4">
                            All tasks scheduled!
                        </p>
                    ) : (
                        unscheduledTasks.map(task => (
                            <div
                                key={task.id}
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                className="cursor-move"
                            >
                                <TaskCard task={task} compact onUpdate={onTaskUpdate} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Time Grid */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-800">
                    {HOURS.map(hour => (
                        <div key={hour} className="grid grid-cols-[80px_1fr] hover:bg-gray-800/30 transition-colors">
                            {/* Hour Label */}
                            <div className="p-4 text-gray-400 text-sm font-medium flex items-start gap-2">
                                <Clock size={14} className="mt-0.5" />
                                {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                            </div>

                            {/* Time Slots */}
                            <div className="grid grid-cols-2 border-l border-gray-800">
                                {/* :00 slot */}
                                <div
                                    className="p-2 min-h-[80px] border-r border-gray-800"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(hour, 0)}
                                >
                                    {getTasksForHour(hour)
                                        .filter(t => t.timeBlock?.startTime.endsWith(':00'))
                                        .map(task => (
                                            <TaskCard key={task.id} task={task} onUpdate={onTaskUpdate} />
                                        ))
                                    }
                                </div>

                                {/* :30 slot */}
                                <div
                                    className="p-2 min-h-[80px]"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(hour, 30)}
                                >
                                    {getTasksForHour(hour)
                                        .filter(t => t.timeBlock?.startTime.endsWith(':30'))
                                        .map(task => (
                                            <TaskCard key={task.id} task={task} onUpdate={onTaskUpdate} />
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

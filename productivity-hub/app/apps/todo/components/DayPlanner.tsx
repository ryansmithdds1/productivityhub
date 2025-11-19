'use client';

import { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import type { Task } from '../types';
import { formatTime } from '../lib/utils';
import { TaskCard } from './TaskCard';

interface DayPlannerProps {
    date: number;
    tasks: Task[];
    onTaskUpdate: () => void;
}

const START_HOUR = 5;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const HOUR_HEIGHT = 80; // px

export function DayPlanner({ date, tasks, onTaskUpdate }: DayPlannerProps) {
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter tasks for this day
    const dayTasks = tasks.filter(t => t.dueDate === date && !t.completed);
    const scheduledTasks = dayTasks.filter(t => t.timeBlock);
    const unscheduledTasks = dayTasks.filter(t => !t.timeBlock);

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedTask || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const offsetY = e.clientY - rect.top + containerRef.current.scrollTop;

        // Calculate time from Y position
        const totalMinutes = Math.floor(offsetY / (HOUR_HEIGHT / 60));
        const hour = Math.floor(totalMinutes / 60) + START_HOUR;

        // Snap to 15 minute increments
        const rawMinute = totalMinutes % 60;
        const minute = Math.round(rawMinute / 15) * 15;

        // Handle hour overflow from rounding
        let finalHour = hour;
        let finalMinute = minute;
        if (finalMinute === 60) {
            finalHour += 1;
            finalMinute = 0;
        }

        // Ensure within bounds
        if (finalHour < START_HOUR) finalHour = START_HOUR;
        if (finalHour >= END_HOUR) finalHour = END_HOUR - 1;

        const startTime = `${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;

        const updatedTask = {
            ...draggedTask,
            timeBlock: {
                startTime: startTime,
                duration: draggedTask.timeBlock?.duration || 30
            }
        };

        const { storage: taskStorage } = require('../lib/storage');
        taskStorage.saveTask(updatedTask);

        setDraggedTask(null);
        onTaskUpdate();
    };

    const getTaskStyle = (task: Task) => {
        if (!task.timeBlock) return {};

        const [hourStr, minuteStr] = task.timeBlock.startTime.split(':');
        const hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);

        const startMinutesFromTop = (hour - START_HOUR) * 60 + minute;
        const top = (startMinutesFromTop / 60) * HOUR_HEIGHT;
        const height = (task.timeBlock.duration / 60) * HOUR_HEIGHT;

        return {
            top: `${top}px`,
            height: `${height}px`,
            position: 'absolute' as const,
            left: '60px', // Offset for time labels
            right: '10px',
            zIndex: 10
        };
    };

    return (
        <div className="grid grid-cols-[200px_1fr] gap-6 h-[calc(100vh-200px)]">
            {/* Unscheduled Tasks Sidebar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-y-auto">
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

            {/* Time Grid Container */}
            <div
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-y-auto relative select-none"
                ref={containerRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="relative min-h-full" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
                    {/* Grid Lines */}
                    {HOURS.map(hour => (
                        <div
                            key={hour}
                            className="absolute w-full border-b border-gray-800/50 flex items-start"
                            style={{
                                top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                                height: `${HOUR_HEIGHT}px`
                            }}
                        >
                            <div className="w-[60px] p-2 text-xs text-gray-500 font-medium text-right pr-4 sticky left-0">
                                {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                            </div>
                            {/* Half-hour marker */}
                            <div className="absolute top-1/2 left-[60px] right-0 border-t border-gray-800/30 border-dashed" />
                        </div>
                    ))}

                    {/* Scheduled Tasks Overlay */}
                    {scheduledTasks.map(task => (
                        <div
                            key={task.id}
                            style={getTaskStyle(task)}
                            className="absolute transition-all duration-200"
                        >
                            <TaskCard
                                task={task}
                                onUpdate={onTaskUpdate}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

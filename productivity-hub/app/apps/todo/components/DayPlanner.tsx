'use client';

import { useState, useRef } from 'react';
import { Clock, Layers, Filter, ChevronRight, ChevronDown } from 'lucide-react';
import type { Task } from '../types';
import { formatTime } from '../lib/utils';
import { TaskCard } from './TaskCard';

interface DayPlannerProps {
    date: number;
    tasks: Task[];
    onTaskUpdate: () => void;
    onEditTask: (task: Task) => void;
}

const START_HOUR = 5;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const HOUR_HEIGHT = 80; // px

export function DayPlanner({ date, tasks, onTaskUpdate, onEditTask }: DayPlannerProps) {
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [groupBy, setGroupBy] = useState<'none' | 'category' | 'priority'>('category');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Filter tasks for this day
    const dayTasks = tasks.filter(t => t.dueDate === date && !t.completed);
    const scheduledTasks = dayTasks.filter(t => t.timeBlock);
    const unscheduledTasks = dayTasks.filter(t => !t.timeBlock);

    // Group tasks
    const getGroupedTasks = () => {
        if (groupBy === 'none') return { 'All Tasks': unscheduledTasks };

        const groups: Record<string, Task[]> = {};

        unscheduledTasks.forEach(task => {
            const key = groupBy === 'category' ? task.category : task.priority;
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            if (!groups[label]) groups[label] = [];
            groups[label].push(task);
        });

        // Sort keys (e.g. High, Medium, Low for priority)
        if (groupBy === 'priority') {
            const order = ['High', 'Medium', 'Low'];
            const sortedGroups: Record<string, Task[]> = {};
            order.forEach(key => {
                if (groups[key]) sortedGroups[key] = groups[key];
            });
            return sortedGroups;
        }

        return groups;
    };

    const groupedTasks = getGroupedTasks();

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: prev[group] === undefined ? false : !prev[group]
        }));
    };

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
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

        const { storage: taskStorage } = await import('../lib/storage');
        await taskStorage.updateTask(updatedTask);

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
        <div className="grid grid-cols-[350px_1fr] gap-6 h-[calc(100vh-200px)]">
            {/* Unscheduled Tasks Sidebar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900 z-10">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                        Unscheduled
                    </h3>
                    <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setGroupBy('category')}
                            className={`p-1.5 rounded ${groupBy === 'category' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                            title="Group by Category"
                        >
                            <Layers size={14} />
                        </button>
                        <button
                            onClick={() => setGroupBy('priority')}
                            className={`p-1.5 rounded ${groupBy === 'priority' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                            title="Group by Priority"
                        >
                            <Filter size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {unscheduledTasks.length === 0 ? (
                        <p className="text-gray-600 text-sm text-center py-4">
                            All tasks scheduled!
                        </p>
                    ) : (
                        Object.entries(groupedTasks).map(([group, groupTasks]) => (
                            <div key={group} className="space-y-2">
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="flex items-center gap-2 w-full text-left text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {expandedGroups[group] === false ? (
                                        <ChevronRight size={14} />
                                    ) : (
                                        <ChevronDown size={14} />
                                    )}
                                    {group}
                                    <span className="ml-auto bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                                        {groupTasks.length}
                                    </span>
                                </button>

                                {expandedGroups[group] !== false && (
                                    <div className="space-y-2 pl-2 border-l border-gray-800 ml-1.5">
                                        {groupTasks.map(task => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={() => handleDragStart(task)}
                                                className="cursor-move hover:scale-[1.02] transition-transform"
                                            >
                                                <TaskCard
                                                    task={task}
                                                    compact
                                                    onUpdate={onTaskUpdate}
                                                    onEdit={() => onEditTask(task)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                            draggable
                            onDragStart={(e) => {
                                // Prevent drag if resizing
                                if ((e.target as HTMLElement).closest('.resize-handle')) {
                                    e.preventDefault();
                                    return;
                                }
                                handleDragStart(task);
                            }}
                            className="absolute transition-all duration-200 cursor-move hover:z-20"
                        >
                            <TaskCard
                                task={task}
                                onUpdate={onTaskUpdate}
                                onEdit={() => onEditTask(task)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

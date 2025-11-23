'use client';

import { useState, useRef } from 'react';
import { Clock, Layers, Filter, ChevronRight, ChevronDown, ChevronLeft, Plus } from 'lucide-react';
import type { Task } from '../types';
import { formatTime } from '../lib/utils';
import { TaskCard } from './TaskCard';
import { storage } from '../lib/storage';

interface DayPlannerProps {
    date: number;
    tasks: Task[];
    onTaskUpdate: () => void;
    onEditTask: (task: Task) => void;
    onDateChange: (newDate: number) => void;
    onToday: () => void;
}

const START_HOUR = 5;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const HOUR_HEIGHT = 80; // px

export function DayPlanner({ date, tasks, onTaskUpdate, onEditTask, onDateChange, onToday }: DayPlannerProps) {
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [groupBy, setGroupBy] = useState<'none' | 'category' | 'priority'>('category');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [quickAddValue, setQuickAddValue] = useState('');
    const quickAddInputRef = useRef<HTMLInputElement>(null);

    // Filter tasks for the timeline (only today's scheduled tasks)
    const dayTasks = tasks.filter(t => t.dueDate === date && !t.completed);
    const scheduledTasks = dayTasks.filter(t => t.timeBlock);

    // Get ALL uncompleted tasks for the sidebar
    const allUncompletedTasks = tasks.filter(t => !t.completed);

    // Separate today's unscheduled from all other tasks
    const todayUnscheduled = allUncompletedTasks.filter(t => t.dueDate === date && !t.timeBlock);
    const otherTasks = allUncompletedTasks.filter(t => !(t.dueDate === date && !t.timeBlock));

    // Group other tasks by date
    const tasksByDate = otherTasks.reduce((acc, task) => {
        const dateKey = task.dueDate;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(task);
        return acc;
    }, {} as Record<number, Task[]>);

    // Sort dates
    const sortedDates = Object.keys(tasksByDate)
        .map(Number)
        .sort((a, b) => a - b);

    // Group today's unscheduled tasks
    const getGroupedTasks = (taskList: Task[]) => {
        if (groupBy === 'none') return { 'All Tasks': taskList };

        const groups: Record<string, Task[]> = {};

        taskList.forEach(task => {
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

    const groupedTodayTasks = getGroupedTasks(todayUnscheduled);

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

    const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' || !quickAddValue.trim()) return;

        try {
            const newTask: Task = {
                id: crypto.randomUUID(),
                title: quickAddValue.trim(),
                dueDate: date,
                completed: false,
                category: 'personal',
                priority: 'medium',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await storage.saveTask(newTask);
            setQuickAddValue('');
            onTaskUpdate(); // Trigger parent component to reload tasks

            // Keep focus in the input for rapid entry
            setTimeout(() => quickAddInputRef.current?.focus(), 0);
        } catch (error) {
            console.error('Failed to create quick task:', error);
        }
    };

    const goToPreviousDay = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(newDate.setHours(0, 0, 0, 0));
    };

    const goToNextDay = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(newDate.setHours(0, 0, 0, 0));
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

                {/* Quick Add Input */}
                <div className="px-4 pt-3 pb-2">
                    <input
                        ref={quickAddInputRef}
                        type="text"
                        value={quickAddValue}
                        onChange={(e) => setQuickAddValue(e.target.value)}
                        onKeyDown={handleQuickAdd}
                        placeholder="Type task and press Enter..."
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Today's Unscheduled Tasks */}
                    {todayUnscheduled.length > 0 && (
                        <div className="space-y-4">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider sticky top-0 bg-gray-900 pb-2">
                                Today - Unscheduled
                            </div>
                            {Object.entries(groupedTodayTasks).map(([group, groupTasks]) => (
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
                                            {groupTasks.map((task: Task) => (
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
                            ))}
                        </div>
                    )}

                    {/* Other Tasks Grouped by Date */}
                    {sortedDates.length > 0 && (
                        <div className="space-y-4">
                            {sortedDates.map(dateKey => {
                                const dateTasks = tasksByDate[dateKey];
                                const dateObj = new Date(dateKey);
                                const isToday = dateKey === date;
                                const dayLabel = isToday
                                    ? 'Today - Scheduled'
                                    : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                                return (
                                    <div key={dateKey} className="space-y-2">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-900 pb-2">
                                            {dayLabel}
                                        </div>
                                        <div className="space-y-2">
                                            {dateTasks.map((task: Task) => (
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
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty state */}
                    {todayUnscheduled.length === 0 && sortedDates.length === 0 && (
                        <p className="text-gray-600 text-sm text-center py-4">
                            No uncompleted tasks!
                        </p>
                    )}
                </div>
            </div>

            {/* Timeline Section with Date Navigation */}
            <div className="flex flex-col gap-4">
                {/* Date Navigation */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={goToPreviousDay}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} className="text-gray-400" />
                            </button>
                            <div className="text-center">
                                <h2 className="text-lg font-semibold text-white">
                                    {new Date(date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </h2>
                            </div>
                            <button
                                onClick={goToNextDay}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <ChevronRight size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <button
                            onClick={onToday}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>

                {/* Time Grid Container */}
                <div
                    className="bg-gray-900 border border-gray-800 rounded-xl overflow-y-auto relative select-none flex-1"
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
        </div>
    );
}

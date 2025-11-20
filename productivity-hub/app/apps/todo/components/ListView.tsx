'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { getStartOfDay } from '../lib/utils';

interface ListViewProps {
    date: number;
    tasks: Task[];
    onTaskUpdate: () => void;
    onEditTask: (task: Task) => void;
}

export function ListView({ date, tasks, onTaskUpdate, onEditTask }: ListViewProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        overdue: true,
        scheduled: true,
        unscheduled: true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Filter tasks
    const dayTasks = tasks.filter(t => t.dueDate === date && !t.completed);

    // Overdue tasks (tasks from previous days that are not completed)
    // Note: This logic assumes 'tasks' contains all tasks, not just today's. 
    // If 'tasks' passed to this component is already filtered by day, we might need to adjust.
    // Based on page.tsx, 'tasks' is all tasks from storage.
    const overdueTasks = tasks.filter(t => t.dueDate < getStartOfDay() && !t.completed);

    const scheduledTasks = dayTasks.filter(t => t.timeBlock).sort((a, b) => {
        return (a.timeBlock?.startTime || '').localeCompare(b.timeBlock?.startTime || '');
    });

    const unscheduledTasks = dayTasks.filter(t => !t.timeBlock);

    const SectionHeader = ({ title, count, id }: { title: string, count: number, id: string }) => (
        <button
            onClick={() => toggleSection(id)}
            className="flex items-center gap-2 w-full text-left p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
        >
            {expandedSections[id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-semibold text-gray-300">{title}</span>
            <span className="ml-auto bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300">
                {count}
            </span>
        </button>
    );

    return (
        <div className="space-y-4 pb-20">
            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader title="Overdue" count={overdueTasks.length} id="overdue" />
                    {expandedSections.overdue && (
                        <div className="space-y-2 pl-2">
                            {overdueTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onUpdate={onTaskUpdate}
                                    onEdit={() => onEditTask(task)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Scheduled Section */}
            <div className="space-y-2">
                <SectionHeader title="Scheduled" count={scheduledTasks.length} id="scheduled" />
                {expandedSections.scheduled && (
                    <div className="space-y-2 pl-2">
                        {scheduledTasks.length === 0 ? (
                            <p className="text-gray-500 text-sm italic p-2">No scheduled tasks</p>
                        ) : (
                            scheduledTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onUpdate={onTaskUpdate}
                                    onEdit={() => onEditTask(task)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Unscheduled Section */}
            <div className="space-y-2">
                <SectionHeader title="Unscheduled" count={unscheduledTasks.length} id="unscheduled" />
                {expandedSections.unscheduled && (
                    <div className="space-y-2 pl-2">
                        {unscheduledTasks.length === 0 ? (
                            <p className="text-gray-500 text-sm italic p-2">No unscheduled tasks</p>
                        ) : (
                            unscheduledTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onUpdate={onTaskUpdate}
                                    onEdit={() => onEditTask(task)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

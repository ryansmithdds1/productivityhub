'use client';

import { useState } from 'react';
import { Calendar, Home, Sprout, Tractor, Plus } from 'lucide-react';
import type { Task, Category } from '../types';
import { getCategoryColor, getNextRecurrence, getLastCompletedText } from '../lib/utils';

interface MaintenancePlannerProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
}

type MaintenanceCategory = 'all' | 'home' | 'property' | 'farm';

export function MaintenancePlanner({ tasks, onEditTask }: MaintenancePlannerProps) {
    const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory>('all');

    // Filter for maintenance tasks (recurring tasks with maintenance patterns or categories)
    const maintenanceTasks = tasks.filter(task => {
        if (!task.recurring) return false;
        const isMaintenanceFrequency = ['quarterly', 'bi-annual', 'seasonal', 'annual'].includes(task.recurring.frequency);
        const isMaintenanceCategory = ['home', 'property', 'farm'].includes(task.category);
        return isMaintenanceFrequency || isMaintenanceCategory;
    });

    // Filter by selected category
    const filteredTasks = selectedCategory === 'all'
        ? maintenanceTasks
        : maintenanceTasks.filter(task => task.category === selectedCategory);

    // Group tasks by month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const groupTasksByMonth = () => {
        const groups: { [key: string]: Task[] } = {};

        filteredTasks.forEach(task => {
            const nextDate = getNextRecurrence(task);
            if (!nextDate) return;

            const date = new Date(nextDate);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(task);
        });

        return groups;
    };

    const taskGroups = groupTasksByMonth();

    // Get next 3 months
    const getMonthGroups = () => {
        const months = [];
        for (let i = 0; i < 3; i++) {
            const month = new Date(currentYear, currentMonth + i, 1);
            const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
            const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const label = i === 0 ? `This Month (${month.toLocaleDateString('en-US', { month: 'long' })})` :
                i === 1 ? `Next Month (${month.toLocaleDateString('en-US', { month: 'long' })})` :
                    monthName;

            months.push({
                key: monthKey,
                label,
                tasks: taskGroups[monthKey] || []
            });
        }
        return months;
    };

    const monthGroups = getMonthGroups();

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'home': return <Home size={16} />;
            case 'property': return <Sprout size={16} />;
            case 'farm': return <Tractor size={16} />;
            default: return <Calendar size={16} />;
        }
    };

    const formatRecurringPattern = (task: Task) => {
        if (!task.recurring) return '';

        const { frequency, seasonalMonths, specificMonth } = task.recurring;

        switch (frequency) {
            case 'quarterly':
                return 'Quarterly';
            case 'bi-annual':
                return seasonalMonths ?
                    `Bi-annual (${seasonalMonths.map(m => new Date(2000, m - 1).toLocaleDateString('en-US', { month: 'short' })).join(', ')})` :
                    'Bi-annual';
            case 'seasonal':
                return seasonalMonths ?
                    `Seasonal (${seasonalMonths.map(m => new Date(2000, m - 1).toLocaleDateString('en-US', { month: 'short' })).join(', ')})` :
                    'Seasonal';
            case 'annual':
                return specificMonth ?
                    `Annual (${new Date(2000, specificMonth - 1).toLocaleDateString('en-US', { month: 'long' })})` :
                    'Annual';
            default:
                return frequency.charAt(0).toUpperCase() + frequency.slice(1);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Calendar className="text-orange-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Maintenance Planner</h2>
                        <p className="text-sm text-gray-400">Manage your home, property, and farm maintenance</p>
                    </div>
                </div>
                <button
                    onClick={() => onEditTask(undefined as any)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span className="hidden md:inline">New Task</span>
                    <span className="md:hidden">New</span>
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setSelectedCategory('home')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'home'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    <Home size={16} />
                    Home
                </button>
                <button
                    onClick={() => setSelectedCategory('property')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'property'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    <Sprout size={16} />
                    Property
                </button>
                <button
                    onClick={() => setSelectedCategory('farm')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'farm'
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    <Tractor size={16} />
                    Farm
                </button>
            </div>

            {/* Month Groups */}
            <div className="space-y-6">
                {monthGroups.map(group => (
                    <div key={group.key}>
                        <h3 className="text-lg font-semibold text-white mb-3">{group.label}</h3>

                        {group.tasks.length === 0 ? (
                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 text-center">
                                <p className="text-gray-400">No maintenance scheduled for this month</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {group.tasks.map(task => {
                                    const nextDate = getNextRecurrence(task);
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => onEditTask(task)}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-gray-600 ${getCategoryColor(task.category)}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="mt-1">
                                                        {getCategoryIcon(task.category)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-white mb-1">{task.title}</h4>
                                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                                            <span>{formatRecurringPattern(task)}</span>
                                                            {nextDate && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Due {new Date(nextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                                </>
                                                            )}
                                                            {getLastCompletedText(task) && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-gray-500">
                                                                        Last done: {getLastCompletedText(task)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-500 mt-2">{task.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty state if no maintenance tasks at all */}
            {maintenanceTasks.length === 0 && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-8 text-center">
                    <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Maintenance Tasks Yet</h3>
                    <p className="text-gray-400 mb-4">
                        Create recurring tasks with Quarterly, Bi-annual, Seasonal, or Annual frequencies to manage your home and property maintenance.
                    </p>
                </div>
            )}
        </div>
    );
}

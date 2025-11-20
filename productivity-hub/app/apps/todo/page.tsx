'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, ListTodo as ListIcon, LayoutGrid, List } from 'lucide-react';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { DayPlanner } from './components/DayPlanner';
import { ListView } from './components/ListView';
import { TaskModal } from './components/TaskModal';
import { storage } from './lib/storage';
import { getStartOfDay } from './lib/utils';
import type { Task } from './types';

export default function TodoApp() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentDate, setCurrentDate] = useState(getStartOfDay());
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadTasks();

        // Auto-switch to list view on mobile
        if (window.innerWidth < 768) {
            setViewMode('list');
        }

        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode('list');
            } else {
                setViewMode('grid');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadTasks = async () => {
        const loadedTasks = await storage.getTasks();
        setTasks(loadedTasks);
    };

    const goToPreviousDay = () => {
        setCurrentDate(prev => prev - (24 * 60 * 60 * 1000));
    };

    const goToNextDay = () => {
        setCurrentDate(prev => prev + (24 * 60 * 60 * 1000));
    };

    const goToToday = () => {
        setCurrentDate(getStartOfDay());
    };

    const handleTaskUpdate = async () => {
        await loadTasks();
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setShowTaskModal(true);
    };

    const handleCloseModal = () => {
        setShowTaskModal(false);
        setEditingTask(undefined);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <ListIcon className="text-orange-400" size={24} />
                            <h1 className="text-2xl font-bold text-white">
                                To-Do List & Time Blocker
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Plan your day with time-blocking</p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-800 rounded-lg p-1 self-start md:self-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                        >
                            <LayoutGrid size={18} />
                            <span className="text-sm font-medium hidden md:inline">Grid</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                        >
                            <List size={18} />
                            <span className="text-sm font-medium hidden md:inline">List</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-8">
                {/* Date Navigation */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <button
                            onClick={goToPreviousDay}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-400" />
                        </button>
                        <div className="text-center">
                            <h2 className="text-lg md:text-xl font-semibold text-white">
                                {new Date(currentDate).toLocaleDateString('en-US', {
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

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={goToToday}
                            className="flex-1 md:flex-none px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="flex-1 md:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            <span className="hidden md:inline">New Task</span>
                            <span className="md:hidden">New</span>
                        </button>
                    </div>
                </div>

                {/* View Content */}
                {viewMode === 'grid' ? (
                    <div className="hidden md:block">
                        <DayPlanner
                            date={currentDate}
                            tasks={tasks}
                            onTaskUpdate={handleTaskUpdate}
                            onEditTask={handleEditTask}
                        />
                    </div>
                ) : (
                    <ListView
                        date={currentDate}
                        tasks={tasks}
                        onTaskUpdate={handleTaskUpdate}
                        onEditTask={handleEditTask}
                    />
                )}

                {/* Mobile fallback for grid view if forced */}
                {viewMode === 'grid' && (
                    <div className="md:hidden text-center py-10">
                        <p className="text-gray-400 mb-4">Grid view is optimized for desktop.</p>
                        <button
                            onClick={() => setViewMode('list')}
                            className="text-orange-500 hover:underline"
                        >
                            Switch to List View
                        </button>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={showTaskModal}
                onClose={handleCloseModal}
                onSaved={handleTaskUpdate}
                defaultDate={currentDate}
                task={editingTask}
            />
        </DashboardLayout>
    );
}

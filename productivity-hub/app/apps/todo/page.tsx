'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, ListTodo as ListIcon, LayoutGrid, List, Calendar } from 'lucide-react';

import { DayPlanner } from './components/DayPlanner';
import { ListView } from './components/ListView';
import { MaintenancePlanner } from './components/MaintenancePlanner';
import { TaskModal } from './components/TaskModal';
import { storage } from './lib/storage';
import { getStartOfDay, requestNotificationPermission, scheduleNotification } from './lib/utils';
import type { Task } from './types';

export default function TodoApp() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentDate, setCurrentDate] = useState(getStartOfDay());
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mainView, setMainView] = useState<'planner' | 'maintenance'>('planner');

    useEffect(() => {
        requestNotificationPermission();
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
        loadedTasks.forEach(scheduleNotification);
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
        <>
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
                    <div className="flex gap-2">
                        {/* Main View Toggle */}
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setMainView('planner')}
                                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${mainView === 'planner' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                            >
                                <ListIcon size={18} />
                                <span className="text-sm font-medium hidden md:inline">Day Planner</span>
                            </button>
                            <button
                                onClick={() => setMainView('maintenance')}
                                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${mainView === 'maintenance' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                            >
                                <Calendar size={18} />
                                <span className="text-sm font-medium hidden md:inline">Maintenance</span>
                            </button>
                        </div>

                        {/* Grid/List Toggle (only for Day Planner) */}
                        {mainView === 'planner' && (
                            <div className="flex bg-gray-800 rounded-lg p-1">
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
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-8">
                {mainView === 'maintenance' ? (
                    <MaintenancePlanner
                        tasks={tasks}
                        onEditTask={(task) => {
                            setEditingTask(task);
                            setShowTaskModal(true);
                        }}
                    />
                ) : (
                    <>
                        {/* View Content */}
                        {viewMode === 'grid' ? (
                            <div className="hidden md:block">
                                <DayPlanner
                                    date={currentDate}
                                    tasks={tasks}
                                    onTaskUpdate={handleTaskUpdate}
                                    onEditTask={handleEditTask}
                                    onDateChange={(newDate) => setCurrentDate(newDate)}
                                    onToday={goToToday}
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
                    </>
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
        </>
    );
}

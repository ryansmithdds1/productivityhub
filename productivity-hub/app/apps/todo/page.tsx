'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, ListTodo as ListIcon } from 'lucide-react';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { DayPlanner } from './components/DayPlanner';
import { TaskModal } from './components/TaskModal';
import { storage } from './lib/storage';
import { getStartOfDay } from './lib/utils';
import type { Task } from './types';

export default function TodoApp() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentDate, setCurrentDate] = useState(getStartOfDay());
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

    useEffect(() => {
        setTasks(storage.getTasks());
    }, []);

    const goToPreviousDay = () => {
        setCurrentDate(prev => prev - (24 * 60 * 60 * 1000));
    };

    const goToNextDay = () => {
        setCurrentDate(prev => prev + (24 * 60 * 60 * 1000));
    };

    const goToToday = () => {
        setCurrentDate(getStartOfDay());
    };

    const handleTaskUpdate = () => {
        setTasks(storage.getTasks());
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
                <div className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        <ListIcon className="text-orange-400" size={24} />
                        <h1 className="text-2xl font-bold text-white">
                            To-Do List & Time Blocker
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Plan your day with time-blocking</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
                {/* Date Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={goToPreviousDay}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-400" />
                        </button>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-white">
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

                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Day Planner */}
                <DayPlanner
                    date={currentDate}
                    tasks={tasks}
                    onTaskUpdate={handleTaskUpdate}
                    onEditTask={handleEditTask}
                />
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

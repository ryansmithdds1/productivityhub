'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskFormData, Priority, Category } from '../types';
import { storage } from '../lib/storage';
import { getStartOfDay } from '../lib/utils';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    task?: Task;
    defaultDate?: number;
}

export function TaskModal({ isOpen, onClose, onSaved, task, defaultDate }: TaskModalProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: task?.title || '',
        description: task?.description || '',
        dueDate: task?.dueDate || defaultDate || getStartOfDay(),
        priority: task?.priority || 'medium',
        category: task?.category || 'work',
        timeBlock: task?.timeBlock,
        recurring: task?.recurring,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTask: Task = {
            id: task?.id || crypto.randomUUID(),
            ...formData,
            completed: task?.completed || false,
            createdAt: task?.createdAt || Date.now(),
            updatedAt: Date.now(),
        };

        storage.saveTask(newTask);
        onSaved();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">
                        {task ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                            placeholder="e.g., Team meeting"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                            placeholder="Add notes..."
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Due Date *
                        </label>
                        <input
                            type="date"
                            required
                            value={new Date(formData.dueDate).toISOString().split('T')[0]}
                            onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value).getTime() })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    {/* Priority & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                            >
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                                <option value="content">Content</option>
                                <option value="health">Health</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Time Block */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                            <input
                                type="checkbox"
                                checked={!!formData.timeBlock}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormData({
                                            ...formData,
                                            timeBlock: { startTime: '09:00', duration: 60 }
                                        });
                                    } else {
                                        setFormData({ ...formData, timeBlock: undefined });
                                    }
                                }}
                                className="rounded"
                            />
                            Schedule Time Block
                        </label>

                        {formData.timeBlock && (
                            <div className="grid grid-cols-2 gap-4 ml-6">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={formData.timeBlock.startTime}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            timeBlock: { ...formData.timeBlock!, startTime: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        min="15"
                                        step="15"
                                        value={formData.timeBlock.duration}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            timeBlock: { ...formData.timeBlock!, duration: parseInt(e.target.value) }
                                        })}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                        >
                            {task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

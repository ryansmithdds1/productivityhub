'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface Habit {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
}

interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (habit: Partial<Habit>) => void;
    initialData?: Habit;
}

const COLORS = [
    { id: 'green', bg: 'bg-green-500' },
    { id: 'blue', bg: 'bg-blue-500' },
    { id: 'red', bg: 'bg-red-500' },
    { id: 'orange', bg: 'bg-orange-500' },
    { id: 'purple', bg: 'bg-purple-500' },
];

export function HabitModal({ isOpen, onClose, onSave, initialData }: HabitModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('green');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setColor(initialData.color);
        } else {
            setName('');
            setDescription('');
            setColor('green');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description, color });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
                    <h2 className="text-lg font-bold text-white">
                        {initialData ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Habit Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Read 30 mins"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                            placeholder="Why is this habit important?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">
                            Color Theme
                        </label>
                        <div className="flex gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setColor(c.id)}
                                    className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${color === c.id ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Habit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

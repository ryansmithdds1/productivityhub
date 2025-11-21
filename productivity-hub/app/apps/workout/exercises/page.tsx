'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { Plus, Pencil, Trash2, Save, X, ArrowLeft, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { storage } from '../lib/storage';
import type { Exercise } from '../types';

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Exercise>>({
        name: '',
        category: 'Push',
        defaultSets: 3,
        defaultReps: 10
    });

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        const data = await storage.getExercises();
        setExercises(data);
    };

    const handleEdit = (exercise: Exercise) => {
        setEditingId(exercise.id);
        setFormData(exercise);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({
            name: '',
            category: 'Push',
            defaultSets: 3,
            defaultReps: 10
        });
    };

    const handleSave = async () => {
        if (!formData.name) return;

        if (editingId) {
            await storage.updateExercise(editingId, formData);
        } else {
            await storage.createExercise(formData);
        }

        await loadExercises();
        handleCancel();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure? This will not affect past workouts.')) {
            await storage.deleteExercise(id);
            await loadExercises();
        }
    };

    const groupedExercises = exercises.reduce((acc, ex) => {
        if (!acc[ex.category]) acc[ex.category] = [];
        acc[ex.category].push(ex);
        return acc;
    }, {} as Record<string, Exercise[]>);

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/apps/workout" className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Exercise Library</h1>
                            <p className="text-gray-400 mt-1">Manage your available exercises</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        disabled={isAdding || editingId !== null}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={18} />
                        Add Exercise
                    </button>
                </div>

                {/* Editor Form */}
                {(isAdding || editingId) && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-lg font-bold text-white mb-4">
                            {isAdding ? 'New Exercise' : 'Edit Exercise'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g. Bench Press"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="Push">Push</option>
                                    <option value="Pull">Pull</option>
                                    <option value="Legs">Legs</option>
                                    <option value="Core">Core</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Default Sets</label>
                                <input
                                    type="number"
                                    value={formData.defaultSets}
                                    onChange={(e) => setFormData({ ...formData, defaultSets: Number(e.target.value) })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Default Reps</label>
                                <input
                                    type="number"
                                    value={formData.defaultReps}
                                    onChange={(e) => setFormData({ ...formData, defaultReps: Number(e.target.value) })}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
                            >
                                <Save size={18} />
                                Save Exercise
                            </button>
                        </div>
                    </div>
                )}

                {/* Exercise List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
                        <div key={category} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Dumbbell size={20} className="text-blue-400" />
                                {category}
                            </h2>
                            <div className="space-y-2">
                                {categoryExercises.map(exercise => (
                                    <div
                                        key={exercise.id}
                                        className="group flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-lg hover:border-gray-700 transition-all"
                                    >
                                        <div>
                                            <h3 className="font-medium text-white">{exercise.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {exercise.defaultSets} sets × {exercise.defaultReps} reps
                                            </p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(exercise)}
                                                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exercise.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

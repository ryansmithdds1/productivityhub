'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, CheckCircle2, Circle, Dumbbell } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Exercise, Workout, WorkoutExercise, Set } from '../types';

interface WorkoutLoggerProps {
    templateName: string;
    onComplete: () => void;
    onCancel: () => void;
}

export function WorkoutLogger({ templateName, onComplete, onCancel }: WorkoutLoggerProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
    const [startTime] = useState(Date.now());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        const allExercises = await storage.getExercises();
        setExercises(allExercises);

        // Pre-populate based on template (simple logic for now)
        if (activeExercises.length === 0 && allExercises.length > 0) {
            const category = templateName.split(' ')[0]; // "Push", "Pull", "Legs"
            const relevantExercises = allExercises.filter(e => e.category === category);

            const initialWorkout: WorkoutExercise[] = relevantExercises.map((ex, i) => ({
                exerciseId: ex.id,
                exercise: ex,
                order: i,
                sets: Array(ex.defaultSets).fill(null).map(() => ({
                    reps: ex.defaultReps,
                    weight: 0,
                    type: 'working',
                    completed: false
                }))
            }));
            setActiveExercises(initialWorkout);
        }
    };

    const handleSetUpdate = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
        const newExercises = [...activeExercises];
        newExercises[exerciseIndex].sets[setIndex] = {
            ...newExercises[exerciseIndex].sets[setIndex],
            [field]: value
        };
        setActiveExercises(newExercises);
    };

    const addSet = (exerciseIndex: number) => {
        const newExercises = [...activeExercises];
        const previousSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
        newExercises[exerciseIndex].sets.push({
            reps: previousSet?.reps || 10,
            weight: previousSet?.weight || 0,
            type: 'working',
            completed: false
        });
        setActiveExercises(newExercises);
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        const newExercises = [...activeExercises];
        newExercises[exerciseIndex].sets.splice(setIndex, 1);
        setActiveExercises(newExercises);
    };

    const handleFinish = async () => {
        setIsSaving(true);
        try {
            const workout: Partial<Workout> = {
                name: templateName,
                date: Date.now(),
                duration: Math.round((Date.now() - startTime) / 60000),
                exercises: activeExercises
            };
            await storage.saveWorkout(workout);
            onComplete();
        } catch (error) {
            alert('Failed to save workout');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{templateName} Workout</h2>
                    <p className="text-gray-400 text-sm">Started at {new Date(startTime).toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white">
                        Cancel
                    </button>
                    <button
                        onClick={handleFinish}
                        disabled={isSaving}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <Save size={18} />
                        Finish Workout
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {activeExercises.map((workoutExercise, exIndex) => (
                    <div key={workoutExercise.exerciseId} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Dumbbell size={20} className="text-blue-400" />
                            {workoutExercise.exercise?.name}
                        </h3>

                        <div className="space-y-2">
                            <div className="grid grid-cols-10 gap-4 text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                                <div className="col-span-1 text-center">Set</div>
                                <div className="col-span-3 text-center">lbs</div>
                                <div className="col-span-3 text-center">Reps</div>
                                <div className="col-span-2 text-center">Done</div>
                                <div className="col-span-1"></div>
                            </div>

                            {workoutExercise.sets.map((set, setIndex) => (
                                <div key={setIndex} className={`grid grid-cols-10 gap-4 items-center p-2 rounded-lg ${set.completed ? 'bg-green-900/20' : 'bg-gray-950'}`}>
                                    <div className="col-span-1 text-center text-gray-400 font-medium">
                                        {setIndex + 1}
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => handleSetUpdate(exIndex, setIndex, 'weight', Number(e.target.value))}
                                            className="w-full bg-transparent text-center text-white border-b border-gray-700 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => handleSetUpdate(exIndex, setIndex, 'reps', Number(e.target.value))}
                                            className="w-full bg-transparent text-center text-white border-b border-gray-700 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            onClick={() => handleSetUpdate(exIndex, setIndex, 'completed', !set.completed)}
                                            className={`transition-colors ${set.completed ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                                        >
                                            {set.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </button>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button
                                            onClick={() => removeSet(exIndex, setIndex)}
                                            className="text-gray-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => addSet(exIndex)}
                            className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all border border-dashed border-gray-700 hover:border-gray-600"
                        >
                            <Plus size={16} />
                            Add Set
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

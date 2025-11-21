'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { Dumbbell, History, Calendar, TrendingUp, Plus } from 'lucide-react';
import { WorkoutLogger } from './components/WorkoutLogger';
import { storage } from './lib/storage';
import type { Workout } from './types';

export default function WorkoutApp() {
    const [isLogging, setIsLogging] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState('');
    const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        const workouts = await storage.getWorkouts();
        setRecentWorkouts(workouts);
    };

    const startWorkout = (template: string) => {
        setActiveTemplate(template);
        setIsLogging(true);
    };

    const handleWorkoutComplete = () => {
        setIsLogging(false);
        loadWorkouts();
    };

    if (isLogging) {
        return (
            <DashboardLayout>
                <div className="p-8">
                    <WorkoutLogger
                        templateName={activeTemplate}
                        onComplete={handleWorkoutComplete}
                        onCancel={() => setIsLogging(false)}
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Workout Tracker</h1>
                        <p className="text-gray-400 mt-1">Track your Push / Pull / Legs split</p>
                    </div>
                    <Link
                        href="/apps/workout/exercises"
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Dumbbell size={18} />
                        Manage Exercises
                    </Link>
                </div>

                {/* Quick Start */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => startWorkout('Push Day')}
                        className="group bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 hover:border-blue-400 p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                            <Dumbbell className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Push Day</h3>
                        <p className="text-sm text-gray-400">Chest, Shoulders, Triceps</p>
                    </button>

                    <button
                        onClick={() => startWorkout('Pull Day')}
                        className="group bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 hover:border-purple-400 p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                            <TrendingUp className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Pull Day</h3>
                        <p className="text-sm text-gray-400">Back, Biceps, Rear Delts</p>
                    </button>

                    <button
                        onClick={() => startWorkout('Leg Day')}
                        className="group bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 hover:border-orange-400 p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                            <Calendar className="text-orange-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Leg Day</h3>
                        <p className="text-sm text-gray-400">Quads, Hamstrings, Calves</p>
                    </button>
                </div>

                {/* Recent History */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <History className="text-gray-400" size={20} />
                        <h2 className="text-xl font-bold text-white">Recent Workouts</h2>
                    </div>

                    <div className="space-y-4">
                        {recentWorkouts.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No workouts logged yet. Start one above!</p>
                        ) : (
                            recentWorkouts.map(workout => (
                                <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold">
                                            {workout.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{workout.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(workout.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                {workout.duration && ` • ${workout.duration} min`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">{workout.exercises.length} Exercises</p>
                                        <p className="text-xs text-gray-600">
                                            {workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} Sets
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { ArrowLeft, TrendingUp, Calendar, Award, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../lib/storage';
import type { Workout, Exercise } from '../types';

export default function ProgressPage() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedExercise && workouts.length > 0) {
            generateChartData();
        }
    }, [selectedExercise, workouts]);

    const loadData = async () => {
        const [workoutData, exerciseData] = await Promise.all([
            storage.getWorkouts(),
            storage.getExercises()
        ]);
        setWorkouts(workoutData);
        setExercises(exerciseData);

        // Auto-select first exercise if available
        if (exerciseData.length > 0 && !selectedExercise) {
            setSelectedExercise(exerciseData[0].id);
        }
    };

    const generateChartData = () => {
        const data: { date: string; maxWeight: number; volume: number }[] = [];

        workouts.forEach(workout => {
            const exerciseInWorkout = workout.exercises.find(
                ex => ex.exerciseId === selectedExercise
            );

            if (exerciseInWorkout && exerciseInWorkout.sets.length > 0) {
                const maxWeight = Math.max(...exerciseInWorkout.sets.map(s => s.weight));
                const volume = exerciseInWorkout.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);

                data.push({
                    date: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    maxWeight,
                    volume
                });
            }
        });

        setChartData(data.reverse()); // Most recent last
    };

    const getExerciseStats = () => {
        if (!selectedExercise || chartData.length === 0) return null;

        const maxWeight = Math.max(...chartData.map(d => d.maxWeight));
        const totalSets = workouts.reduce((sum, w) => {
            const ex = w.exercises.find(e => e.exerciseId === selectedExercise);
            return sum + (ex?.sets.length || 0);
        }, 0);

        return { maxWeight, totalSets, sessions: chartData.length };
    };

    const stats = getExerciseStats();
    const selectedExerciseName = exercises.find(e => e.id === selectedExercise)?.name || '';

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/apps/workout" className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Progress & History</h1>
                        <p className="text-gray-400 mt-1">Track your strength gains over time</p>
                    </div>
                </div>

                {/* Progress Chart Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-blue-400" size={20} />
                            Exercise Progress
                        </h2>
                        <select
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                        >
                            {exercises.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <Award size={16} />
                                    Personal Record
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.maxWeight} lbs</div>
                            </div>
                            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <Activity size={16} />
                                    Total Sets
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalSets}</div>
                            </div>
                            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                    <Calendar size={16} />
                                    Sessions
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.sessions}</div>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    {chartData.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9CA3AF"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#9CA3AF"
                                        style={{ fontSize: '12px' }}
                                        label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="maxWeight"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-500">
                            No data available for {selectedExerciseName}. Complete a workout to see your progress!
                        </div>
                    )}
                </div>

                {/* Workout History */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar className="text-blue-400" size={20} />
                        Workout History
                    </h2>

                    <div className="space-y-4">
                        {workouts.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No workouts logged yet.</p>
                        ) : (
                            workouts.map(workout => (
                                <div key={workout.id} className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{workout.name}</h3>
                                            <p className="text-sm text-gray-400">
                                                {new Date(workout.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                                {workout.duration && ` • ${workout.duration} min`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">{workout.exercises.length} Exercises</p>
                                            <p className="text-xs text-gray-600">
                                                {workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} Sets
                                            </p>
                                        </div>
                                    </div>

                                    {/* Exercise Details */}
                                    <div className="space-y-2">
                                        {workout.exercises.map(workoutEx => {
                                            const exercise = exercises.find(e => e.id === workoutEx.exerciseId);
                                            const completedSets = workoutEx.sets.filter(s => s.completed).length;

                                            return (
                                                <div key={workoutEx.id} className="flex items-center justify-between text-sm bg-gray-900 rounded p-2">
                                                    <span className="text-gray-300">{exercise?.name || 'Unknown'}</span>
                                                    <span className="text-gray-500">
                                                        {completedSets}/{workoutEx.sets.length} sets
                                                    </span>
                                                </div>
                                            );
                                        })}
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

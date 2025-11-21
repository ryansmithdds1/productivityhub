import { Exercise, Workout } from './types';

export const storage = {
    async getExercises(): Promise<Exercise[]> {
        const res = await fetch('/api/exercises');
        if (!res.ok) return [];
        return res.json();
    },

    async createExercise(exercise: Partial<Exercise>): Promise<Exercise> {
        const res = await fetch('/api/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exercise),
        });
        return res.json();
    },

    async getWorkouts(): Promise<Workout[]> {
        const res = await fetch('/api/workouts');
        if (!res.ok) return [];
        return res.json();
    },

    async saveWorkout(workout: Partial<Workout>): Promise<Workout> {
        const res = await fetch('/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout),
        });
        return res.json();
    }
};

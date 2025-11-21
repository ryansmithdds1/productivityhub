export interface Exercise {
    id: string;
    name: string;
    category: 'Push' | 'Pull' | 'Legs' | 'Core' | 'Other';
    defaultSets: number;
    defaultReps: number;
}

export interface Set {
    id?: string;
    reps: number;
    weight: number;
    type: 'warmup' | 'working' | 'failure';
    completed: boolean;
}

export interface WorkoutExercise {
    id?: string;
    exerciseId: string;
    exercise?: Exercise;
    sets: Set[];
    order: number;
}

export interface Workout {
    id: string;
    name: string;
    date: number;
    duration?: number;
    notes?: string;
    exercises: WorkoutExercise[];
}

export interface WorkoutTemplate {
    name: string;
    exercises: {
        exerciseId: string;
        defaultSets: number;
        defaultReps: number;
    }[];
}

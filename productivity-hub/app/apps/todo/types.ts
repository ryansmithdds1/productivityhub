export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'personal' | 'content' | 'health' | 'other';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

export interface TimeBlock {
    startTime: string; // HH:mm format
    duration: number;  // minutes
}

export interface RecurringPattern {
    frequency: RecurringFrequency;
    interval: number; // e.g., every 2 days
    daysOfWeek?: number[]; // 0-6 for weekly (0=Sunday)
    endDate?: number; // optional end timestamp
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: number; // timestamp (start of day)
    completed: boolean;
    completedAt?: number;
    priority: Priority;
    category: Category;
    timeBlock?: TimeBlock;
    recurring?: RecurringPattern;
    createdAt: number;
    updatedAt: number;
}

export interface TaskFormData {
    title: string;
    description?: string;
    dueDate: number;
    priority: Priority;
    category: Category;
    timeBlock?: TimeBlock;
    recurring?: RecurringPattern;
}

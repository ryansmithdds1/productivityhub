import type { Task } from '../types';

const STORAGE_KEY = 'todo_tasks';

export const storage = {
    getTasks(): Task[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveTask(task: Task): void {
        const tasks = this.getTasks();
        const existingIndex = tasks.findIndex(t => t.id === task.id);

        if (existingIndex >= 0) {
            tasks[existingIndex] = { ...task, updatedAt: Date.now() };
        } else {
            tasks.push(task);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },

    deleteTask(id: string): void {
        const tasks = this.getTasks().filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },

    updateTask(id: string, updates: Partial<Task>): void {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);

        if (index >= 0) {
            tasks[index] = { ...tasks[index], ...updates, updatedAt: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        }
    },

    completeTask(id: string): void {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);

        if (!task) return;

        // 1. Mark current task as completed
        this.updateTask(id, { completed: true, completedAt: Date.now() });

        // 2. If recurring, create next instance
        if (task.recurring && !task.completed) { // Check !completed to avoid double generation
            const { frequency, interval } = task.recurring;
            const currentDueDate = new Date(task.dueDate);
            let nextDueDate = new Date(currentDueDate);

            if (frequency === 'daily') {
                nextDueDate.setDate(currentDueDate.getDate() + interval);
            } else if (frequency === 'weekly') {
                nextDueDate.setDate(currentDueDate.getDate() + (interval * 7));
            } else if (frequency === 'monthly') {
                nextDueDate.setMonth(currentDueDate.getMonth() + interval);
            }

            const newTask: Task = {
                ...task,
                id: crypto.randomUUID(),
                dueDate: nextDueDate.getTime(),
                completed: false,
                completedAt: undefined,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                // Keep the same time block if it exists
                timeBlock: task.timeBlock,
                recurring: task.recurring
            };

            this.saveTask(newTask);
        }
    },

    uncompleteTask(id: string): void {
        this.updateTask(id, { completed: false, completedAt: undefined });
    },
};

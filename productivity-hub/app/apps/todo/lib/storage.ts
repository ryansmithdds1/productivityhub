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
        this.updateTask(id, { completed: true, completedAt: Date.now() });
    },

    uncompleteTask(id: string): void {
        this.updateTask(id, { completed: false, completedAt: undefined });
    },
};

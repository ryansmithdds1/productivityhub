import type { Task } from '../types';

const STORAGE_KEY = 'todo_tasks';

export const storage = {
    async getTasks(): Promise<Task[]> {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    },

    async saveTask(task: Task): Promise<Task | null> {
        try {
            // Check if task exists to decide between POST and PUT
            // However, our API design separates creation (POST) and update (PUT) more strictly
            // For simplicity in migration, we'll try to update first, if it fails (404/500), we might create?
            // Actually, let's check if the ID is a temporary one or if we know it's new.
            // But the current UI generates IDs on the client. 
            // Prisma generates CUIDs. 
            // Strategy: 
            // If we are creating a NEW task, we should let the server generate the ID or pass it.
            // The current app generates IDs using crypto.randomUUID().
            // Our API supports receiving an ID.
            // Let's use PUT if we think it exists, or POST if new.
            // But simpler: The API route for POST creates, PUT updates.
            // We need to know if it's an update or create.
            // In the current app, `saveTask` handles both.

            // Let's check if the task is already in the DB? No, that's too many requests.
            // We'll assume if it has a `createdAt` that matches `updatedAt` it might be new? No.

            // Better approach: Split `saveTask` into `createTask` and `updateTask` in the UI?
            // Or, try to PUT, if 404/error, then POST?
            // Or, just use POST for everything and let the server handle upsert? 
            // Prisma `upsert` requires a unique constraint. ID is unique.

            // Let's try to fetch the task first? No.

            // Let's look at how `saveTask` is used.
            // In TaskModal: if (task) { ... update ... } else { ... create ... }
            // So we can split this method.

            // For now, I'll keep `saveTask` but internally decide.
            // Actually, I'll change the signature to `saveTask(task: Task, isNew: boolean = false)`.
            // But that requires changing call sites.

            // Let's just try to update (PUT). If it fails, we assume it's new (POST)? 
            // No, that's risky.

            // Let's assume if the task comes from `TaskModal`'s "New Task" flow, it's new.
            // But `saveTask` is generic.

            // Let's use a heuristic: We will add a `createTask` method and `updateTask` method to `storage`,
            // and deprecate `saveTask`. I'll update the call sites to use the correct one.

            // Wait, `saveTask` in the old storage checked `findIndex`.
            // I'll implement `createTask` and `updateTask` and remove `saveTask`.
            // Then I'll update the call sites.
            return null;
        } catch (error) {
            console.error('Error saving task:', error);
            return null;
        }
    },

    async createTask(task: Task): Promise<Task | null> {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            if (!response.ok) throw new Error('Failed to create task');
            return await response.json();
        } catch (error) {
            console.error('Error creating task:', error);
            return null;
        }
    },

    async updateTask(task: Task): Promise<Task | null> {
        try {
            const response = await fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            if (!response.ok) throw new Error('Failed to update task');
            return await response.json();
        } catch (error) {
            console.error('Error updating task:', error);
            return null;
        }
    },

    async deleteTask(id: string): Promise<void> {
        try {
            await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    },

    async completeTask(task: Task): Promise<void> {
        // 1. Mark current task as completed
        const updatedTask = { ...task, completed: true, completedAt: Date.now() };
        await this.updateTask(updatedTask);

        // 2. If recurring, create next instance with completion history
        if (task.recurring && !task.completed) {
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

            // Add current completion to history
            const completionHistory = task.completionHistory || [];
            completionHistory.unshift(Date.now()); // Add to beginning
            const trimmedHistory = completionHistory.slice(0, 10); // Keep last 10

            const newTask: Task = {
                ...task,
                id: crypto.randomUUID(), // Generate new ID for the next instance
                dueDate: nextDueDate.getTime(),
                completed: false,
                completedAt: undefined,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                timeBlock: task.timeBlock,
                recurring: task.recurring,
                completionHistory: trimmedHistory
            };

            await this.createTask(newTask);
        }
    },

    async uncompleteTask(task: Task): Promise<void> {
        const updatedTask = { ...task, completed: false, completedAt: undefined };
        await this.updateTask(updatedTask);
    },
};

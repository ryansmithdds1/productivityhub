import { WeeklyPlan } from '../types';

export const storage = {
    async getPlans(): Promise<WeeklyPlan[]> {
        const res = await fetch('/api/weekly-plans');
        if (!res.ok) return [];
        return res.json();
    },

    async createPlan(plan: Partial<WeeklyPlan>): Promise<WeeklyPlan> {
        const res = await fetch('/api/weekly-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plan),
        });
        return res.json();
    },

    async updatePlan(id: string, plan: Partial<WeeklyPlan>): Promise<WeeklyPlan> {
        const res = await fetch('/api/weekly-plans', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...plan }),
        });
        return res.json();
    }
};

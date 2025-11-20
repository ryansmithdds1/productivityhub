import type { Script, AppSettings } from '../types';

export const storage = {
    // Scripts
    async getScripts(): Promise<Script[]> {
        try {
            const response = await fetch('/api/hookpoint');
            if (!response.ok) throw new Error('Failed to fetch scripts');
            return await response.json();
        } catch (error) {
            console.error('Error fetching scripts:', error);
            return [];
        }
    },

    async saveScript(script: Script): Promise<Script | null> {
        try {
            // Check if script exists to decide between POST and PUT
            const allScripts = await this.getScripts();
            const exists = allScripts.some(s => s.id === script.id);

            const response = await fetch('/api/hookpoint', {
                method: exists ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(script),
            });

            if (!response.ok) throw new Error('Failed to save script');
            return await response.json();
        } catch (error) {
            console.error('Error saving script:', error);
            return null;
        }
    },

    async deleteScript(id: string): Promise<void> {
        try {
            await fetch(`/api/hookpoint?id=${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting script:', error);
        }
    },

    // Settings (keep in localStorage for now - not critical data)
    getSettings(): AppSettings {
        if (typeof window === 'undefined') return {};
        try {
            const data = localStorage.getItem('hookpoint_settings');
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    },

    saveSettings(settings: AppSettings): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('hookpoint_settings', JSON.stringify(settings));
    },

    getApiKey(): string | undefined {
        return this.getSettings().apiKey;
    },

    saveApiKey(apiKey: string): void {
        this.saveSettings({ ...this.getSettings(), apiKey });
    },
};

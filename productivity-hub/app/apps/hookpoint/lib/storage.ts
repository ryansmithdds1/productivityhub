import type { Script, AppSettings } from '../types';

const STORAGE_KEYS = {
    SCRIPTS: 'hookpoint_scripts',
    SETTINGS: 'hookpoint_settings',
};

export const storage = {
    // Scripts
    getScripts(): Script[] {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    saveScript(script: Script): void {
        const scripts = this.getScripts();
        const index = scripts.findIndex(s => s.id === script.id);

        if (index !== -1) {
            scripts[index] = script;
        } else {
            scripts.push(script);
        }

        localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
    },

    deleteScript(id: string): void {
        const scripts = this.getScripts().filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
    },

    // Settings
    getSettings(): AppSettings {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    },

    saveSettings(settings: AppSettings): void {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    getApiKey(): string | undefined {
        return this.getSettings().apiKey;
    },

    saveApiKey(apiKey: string): void {
        this.saveSettings({ ...this.getSettings(), apiKey });
    },
};

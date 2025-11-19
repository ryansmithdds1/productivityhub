// Helper to access HookPoint scripts from localStorage
export interface HookPointScript {
    id: string;
    title: string;
    hook: string;
    category: string;
    updatedAt: number;
}

export function getHookPointScripts(): HookPointScript[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem('hookpoint_scripts');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function getHookPointScriptById(id: string): HookPointScript | undefined {
    const scripts = getHookPointScripts();
    return scripts.find(s => s.id === id);
}

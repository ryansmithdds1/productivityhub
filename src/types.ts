export interface Script {
    id: string;
    title: string;
    topic: string;
    category: ScriptCategory;
    hook: string;
    body: string;
    cta: string;
    visuals: string;
    createdAt: number;
    updatedAt: number;
}

export type ScriptCategory = 'clinical' | 'research' | 'business' | 'patient' | 'universal';

export interface HookTemplate {
    id: string;
    text: string;
    category: ScriptCategory[];
    explanation: string;
}

export interface AIScriptSuggestion {
    hook: string;
    body: string;
    cta: string;
    visuals: string;
}

export interface AppSettings {
    apiKey?: string;
}

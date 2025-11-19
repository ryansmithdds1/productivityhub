import { LucideIcon, Video, Calendar, Brain, Building2, Lightbulb } from 'lucide-react';

export interface App {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    route: string;
    category: 'content' | 'practice' | 'productivity' | 'other';
    color: string;
    gradient: string;
}

export const apps: App[] = [
    {
        id: 'hookpoint',
        name: 'HookPoint',
        description: 'Plan viral short-form video scripts with AI-powered hooks',
        icon: Video,
        route: '/apps/hookpoint',
        category: 'content',
        color: 'text-purple-400',
        gradient: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    },
    {
        id: 'content-calendar',
        name: 'Content Calendar',
        description: 'Manage your social media content schedule',
        icon: Calendar,
        route: '/apps/content-calendar',
        category: 'content',
        color: 'text-blue-400',
        gradient: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    },
    {
        id: 'brainstorm',
        name: 'Idea Brainstorm',
        description: 'Capture and organize content ideas',
        icon: Lightbulb,
        route: '/apps/brainstorm',
        category: 'productivity',
        color: 'text-yellow-400',
        gradient: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20',
    },
    {
        id: 'practice-manager',
        name: 'Practice Manager',
        description: 'Manage dental practice workflows and operations',
        icon: Building2,
        route: '/apps/practice-manager',
        category: 'practice',
        color: 'text-green-400',
        gradient: 'from-green-500/10 to-green-600/5 border-green-500/20',
    },
    {
        id: 'ai-assistant',
        name: 'AI Assistant',
        description: 'General purpose AI assistant for any task',
        icon: Brain,
        route: '/apps/ai-assistant',
        category: 'productivity',
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
    },
];

export function getAppById(id: string): App | undefined {
    return apps.find(app => app.id === id);
}

export function getAppsByCategory(category: App['category']): App[] {
    return apps.filter(app => app.category === category);
}

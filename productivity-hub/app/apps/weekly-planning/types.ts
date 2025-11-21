export interface WeeklyPlan {
    id: string;
    weekOf: number;
    status: 'in-progress' | 'completed';
    reflections?: {
        wins: string[];
        challenges: string[];
    };
    goals?: {
        spiritual?: string[];
        personal?: string[];
        business?: string[];
        content?: string[];
    };
    roadblocks?: string;
    commitment?: string;
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
}

export interface PlanningStep {
    id: number;
    title: string;
    description: string;
    suggestedMinutes: number;
    category: 'prep' | 'reflection' | 'goals' | 'execution' | 'review';
}

export const PLANNING_STEPS: PlanningStep[] = [
    {
        id: 1,
        title: 'Prep & Brain Dump',
        description: 'Jot down lingering ideas, wins, or challenges. Review last week\'s plan.',
        suggestedMinutes: 5,
        category: 'prep'
    },
    {
        id: 2,
        title: 'Opening Reflection & Check-In',
        description: 'Note 1-2 wins and 1 challenge. Scan calendar for upcoming fixed events.',
        suggestedMinutes: 5,
        category: 'reflection'
    },
    {
        id: 3,
        title: 'Spiritual & Service Goals',
        description: 'Plan temple/fasting, ministering acts, and calling work.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 4,
        title: 'Personal & Family Goals',
        description: 'Discuss family objectives, add personal items, create shared tasks.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 5,
        title: 'Business & Professional Goals',
        description: 'Weekly CE, clinical help, profitability focuses. Break into tasks.',
        suggestedMinutes: 15,
        category: 'goals'
    },
    {
        id: 6,
        title: 'Content Creation Goals',
        description: '2 YouTube videos, 5 shorts. Schedule in your daily content slots.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 7,
        title: 'Anticipate Roadblocks & Optimize',
        description: 'Review full week, spot overloads, add buffers or backups.',
        suggestedMinutes: 5,
        category: 'review'
    },
    {
        id: 8,
        title: 'Close & Commit',
        description: 'Summarize actions/deadlines. Set mid-week check-in.',
        suggestedMinutes: 5,
        category: 'execution'
    }
];

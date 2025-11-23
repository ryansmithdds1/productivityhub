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
        dentalPractices?: string[];
        ryanSmithDDS?: string[];
        assistingSchool?: string[];
        equityDental?: string[];
        courses?: string[];
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
        title: 'Dental Practices',
        description: 'Practice management, clinical protocols, growth initiatives.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 6,
        title: 'Ryan Smith DDS',
        description: 'Personal CE, clinical development, networking.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 7,
        title: 'Assisting School',
        description: 'Curriculum development, student coordination, teaching prep.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 8,
        title: 'Equity Dental',
        description: 'Strategic initiatives, partnerships, business development.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 9,
        title: 'Courses',
        description: 'Content creation, platform maintenance, student support.',
        suggestedMinutes: 10,
        category: 'goals'
    },
    {
        id: 10,
        title: 'Anticipate Roadblocks & Optimize',
        description: 'Review full week, spot overloads, add buffers or backups.',
        suggestedMinutes: 5,
        category: 'review'
    },
    {
        id: 11,
        title: 'Close & Commit',
        description: 'Summarize actions/deadlines. Set mid-week check-in.',
        suggestedMinutes: 5,
        category: 'execution'
    }
];

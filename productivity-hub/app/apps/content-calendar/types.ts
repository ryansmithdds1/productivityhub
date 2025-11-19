export type ContentType = 'short' | 'youtube' | 'newsletter';
export type Platform = 'tiktok' | 'instagram' | 'youtube-shorts' | 'youtube';
export type Status = 'idea' | 'scripted' | 'filmed' | 'edited' | 'ready' | 'posted';
export type NewsletterSectionName = 'below-gumline' | 'news' | 'research' | 'business' | 'efficiency' | 'meme';

export interface ProductionChecklist {
    scriptCreated: boolean;
    filmed: boolean;
    edited: boolean;
    thumbnailCreated: boolean;
    descriptionWritten: boolean;
    scheduled: boolean;
}

export interface BaseContent {
    id: string;
    type: ContentType;
    title: string;
    dueDate: number; // timestamp
    status: Status;
    createdAt: number;
    updatedAt: number;
    notes?: string;
}

export interface Short extends BaseContent {
    type: 'short';
    platform: Platform;
    hookpointScriptId?: string; // Link to HookPoint script
    checklist?: ProductionChecklist;
}

export interface YouTubeVideo extends BaseContent {
    type: 'youtube';
    category?: string;
    thumbnailStatus?: 'none' | 'designed' | 'uploaded';
    seoNotes?: string;
    checklist?: ProductionChecklist;
}

export interface NewsletterSection {
    name: NewsletterSectionName;
    label: string;
    completed: boolean;
    notes?: string;
    content?: string; // The actual content/topic for this section
}

export interface Newsletter extends BaseContent {
    type: 'newsletter';
    weekOf: number; // timestamp for week start
    sections: NewsletterSection[];
    sendDate?: number;
}

export type Content = Short | YouTubeVideo | Newsletter;

export interface WeeklyGoals {
    shorts: number; // 7
    videos: number; // 3
    newsletter: boolean; // true = need one
}

// YouTube API Response Types
export interface YouTubeSearchResult {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
    };
}

export interface YouTubeVideoStatistics {
    id: string;
    snippet: {
        title: string;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
    contentDetails: {
        duration: string;
    };
}

// App Types
export interface YouTubeVideo {
    id: string;
    title: string;
    channelId: string;
    channelTitle: string;
    channelSubscribers?: number;
    publishedAt: string;
    thumbnailUrl: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    duration: string;
    url: string;
}

export interface VideoMetrics {
    engagementRate: number; // (likes + comments) / views
    viewsPerDay: number;
    likeRatio: number; // likes / views
    daysOld: number;
}

export interface SavedVideo extends YouTubeVideo {
    savedAt: number;
    notes?: string;
    tags?: string[];
}

export type SortOption =
    | 'relevance'
    | 'viewCount'
    | 'engagementRate'
    | 'viewsPerDay'
    | 'date';

export type DurationFilter = 'any' | 'short' | 'medium' | 'long' | 'over4min';

export interface SearchFilters {
    sortBy: SortOption;
    duration: DurationFilter;
    minViews?: number;
    maxResults: number;
}

export interface AppSettings {
    apiKey: string;
    defaultMaxResults: number;
    defaultSort: SortOption;
}

export interface SearchHistoryItem {
    query: string;
    timestamp: number;
    filters: SearchFilters;
}

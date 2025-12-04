import type { YouTubeVideo, VideoMetrics } from '../types';

/**
 * Calculate engagement rate for a video
 * @param likes Number of likes
 * @param comments Number of comments
 * @param views Number of views
 * @returns Engagement rate as a percentage
 */
export function calculateEngagementRate(
    likes: number,
    comments: number,
    views: number
): number {
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
}

/**
 * Calculate views per day since publish
 * @param views Total view count
 * @param publishedAt ISO date string
 * @returns Average views per day
 */
export function calculateViewsPerDay(views: number, publishedAt: string): number {
    const publishDate = new Date(publishedAt);
    const now = new Date();
    const daysOld = Math.max(1, Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)));
    return Math.round(views / daysOld);
}

/**
 * Calculate like ratio
 * @param likes Number of likes
 * @param views Number of views
 * @returns Like ratio as a percentage
 */
export function calculateLikeRatio(likes: number, views: number): number {
    if (views === 0) return 0;
    return (likes / views) * 100;
}

/**
 * Get days old for a video
 * @param publishedAt ISO date string
 * @returns Number of days since publish
 */
export function getDaysOld(publishedAt: string): number {
    const publishDate = new Date(publishedAt);
    const now = new Date();
    return Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate all metrics for a video
 * @param video YouTube video data
 * @returns Calculated metrics
 */
export function calculateMetrics(video: YouTubeVideo): VideoMetrics {
    return {
        engagementRate: calculateEngagementRate(
            video.likeCount,
            video.commentCount,
            video.viewCount
        ),
        viewsPerDay: calculateViewsPerDay(video.viewCount, video.publishedAt),
        likeRatio: calculateLikeRatio(video.likeCount, video.viewCount),
        daysOld: getDaysOld(video.publishedAt),
    };
}

/**
 * Format large numbers with K, M, B suffixes
 * @param num Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1) + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Convert ISO 8601 duration to readable format
 * @param duration ISO 8601 duration string (e.g., PT1H2M10S)
 * @returns Formatted duration string (e.g., "1:02:10" or "2:10")
 */
export function formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Extract video ID from various YouTube URL formats
 * @param url YouTube URL or video ID
 * @returns Video ID or null
 */
export function parseVideoId(url: string): string | null {
    // Already a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }

    // Standard watch URL
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];

    // Short URL
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // Embed URL
    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return null;
}

/**
 * Format relative time (e.g., "2 days ago", "3 months ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Utility function for className merging (similar to clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

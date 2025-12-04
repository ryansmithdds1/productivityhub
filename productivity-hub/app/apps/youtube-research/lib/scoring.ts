import type { YouTubeVideo } from '../types';
import { calculateMetrics } from './utils';

/**
 * Scoring weights for replicability calculation
 */
const WEIGHTS = {
    engagement: 0.30,      // High engagement = quality content
    viewsPerDay: 0.30,     // Trending = currently relevant
    recency: 0.20,         // Recent = still relevant topic
    reachability: 0.20,    // Not from mega-channels = easier to compete
};

/**
 * Calculate a replicability score for a video (0-100)
 * Higher score = better video to replicate
 */
export function calculateReplicabilityScore(video: YouTubeVideo): number {
    const metrics = calculateMetrics(video);

    // 1. Engagement Score (0-100)
    // Excellent engagement = 5%+, good = 2-5%, average = <2%
    const engagementScore = Math.min(100, (metrics.engagementRate / 5) * 100);

    // 2. Views Per Day Score (0-100)
    // Normalize views/day - videos with 10k+ views/day get max score
    const viewsPerDayScore = Math.min(100, (metrics.viewsPerDay / 10000) * 100);

    // 3. Recency Score (0-100)
    // Prefer videos from last 90 days, penalize older videos
    const daysOld = metrics.daysOld;
    const recencyScore = Math.max(0, 100 - (daysOld / 90) * 100);

    // 4. Reachability Score (0-100)
    // Penalize mega-channels (harder to compete with)
    // Sweet spot: channels with 10k - 1M subscribers
    const subs = video.channelSubscribers || 100000; // Default to 100k if unknown
    let reachabilityScore = 100;

    if (subs < 10000) {
        // Too small - might not be proven
        reachabilityScore = (subs / 10000) * 80;
    } else if (subs > 1000000) {
        // Too large - harder to compete
        reachabilityScore = Math.max(20, 100 - ((subs - 1000000) / 10000000) * 80);
    }

    // Calculate weighted composite score
    const compositeScore =
        (engagementScore * WEIGHTS.engagement) +
        (viewsPerDayScore * WEIGHTS.viewsPerDay) +
        (recencyScore * WEIGHTS.recency) +
        (reachabilityScore * WEIGHTS.reachability);

    return Math.round(compositeScore);
}

/**
 * Calculate breakdown of score components for display
 */
export function getScoreBreakdown(video: YouTubeVideo) {
    const metrics = calculateMetrics(video);
    const subs = video.channelSubscribers || 100000;
    const daysOld = metrics.daysOld;

    // Calculate individual component scores
    const engagement = Math.min(100, (metrics.engagementRate / 5) * 100);
    const viewsPerDay = Math.min(100, (metrics.viewsPerDay / 10000) * 100);
    const recency = Math.max(0, 100 - (daysOld / 90) * 100);

    let reachability = 100;
    if (subs < 10000) {
        reachability = (subs / 10000) * 80;
    } else if (subs > 1000000) {
        reachability = Math.max(20, 100 - ((subs - 1000000) / 10000000) * 80);
    }

    return {
        engagement: Math.round(engagement),
        viewsPerDay: Math.round(viewsPerDay),
        recency: Math.round(recency),
        reachability: Math.round(reachability),
        total: calculateReplicabilityScore(video),
    };
}

/**
 * Filter and sort videos by replicability score
 */
export function getTopVideosToReplicate(videos: YouTubeVideo[], count: number = 5): YouTubeVideo[] {
    return [...videos]
        .sort((a, b) => calculateReplicabilityScore(b) - calculateReplicabilityScore(a))
        .slice(0, count);
}

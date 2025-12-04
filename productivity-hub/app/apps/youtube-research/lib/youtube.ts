import type {
    YouTubeSearchResult,
    YouTubeVideoStatistics,
    YouTubeVideo,
    SearchFilters,
} from '../types';

export class YouTubeAPI {
    private apiKey: string;
    private baseUrl = 'https://www.googleapis.com/youtube/v3';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Search for videos by query
     */
    async searchVideos(
        query: string,
        filters: SearchFilters
    ): Promise<YouTubeVideo[]> {
        if (!this.apiKey) {
            throw new Error('YouTube API key is required');
        }

        // Map duration filter to YouTube API format
        const durationMap: Record<string, string> = {
            short: 'short', // < 4 minutes
            medium: 'medium', // 4-20 minutes
            long: 'long', // > 20 minutes
        };

        // Build search query parameters
        // If filtering for "Over 4 min", we need to fetch more results (max 50)
        // because many results will be filtered out client-side (shorts)
        const fetchLimit = filters.duration === 'over4min' ? 50 : filters.maxResults;

        let allFilteredVideos: YouTubeVideo[] = [];
        let nextPageToken: string | undefined = undefined;
        let pageCount = 0;
        const MAX_PAGES = 5; // Safety limit to prevent infinite loops and quota drain

        // Loop until we have enough videos or reach safety limit
        while (allFilteredVideos.length < filters.maxResults && pageCount < MAX_PAGES) {
            const params = new URLSearchParams({
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: fetchLimit.toString(),
                key: this.apiKey,
            });

            if (nextPageToken) {
                params.append('pageToken', nextPageToken);
            }

            // Add duration filter if not 'any' or 'over4min'
            if (filters.duration !== 'any' && filters.duration !== 'over4min') {
                params.append('videoDuration', durationMap[filters.duration]);
            }

            // Add order parameter
            if (filters.sortBy === 'viewCount') {
                params.append('order', 'viewCount');
            } else if (filters.sortBy === 'date') {
                params.append('order', 'date');
            }

            try {
                const response = await fetch(`${this.baseUrl}/search?${params}`);

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'Search failed');
                }

                const data = await response.json();
                const results: YouTubeSearchResult[] = data.items || [];
                nextPageToken = data.nextPageToken;

                if (results.length === 0) {
                    break; // No more results
                }

                // Get video IDs
                const videoIds = results.map(r => r.id.videoId);

                // Fetch detailed statistics
                const videos = await this.getVideoStatistics(videoIds);

                // Client-side filtering
                let pageFilteredVideos = videos;

                // Filter by min views
                if (filters.minViews && filters.minViews > 0) {
                    pageFilteredVideos = pageFilteredVideos.filter(v => v.viewCount >= filters.minViews!);
                }

                // Filter for "Over 4 min" (exclude shorts)
                if (filters.duration === 'over4min') {
                    pageFilteredVideos = pageFilteredVideos.filter(v => {
                        const match = v.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                        if (!match) return false;
                        const hours = parseInt(match[1] || '0');
                        const minutes = parseInt(match[2] || '0');
                        const seconds = parseInt(match[3] || '0');
                        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                        return totalSeconds >= 240; // 4 minutes = 240 seconds
                    });
                }

                // Add to total list
                allFilteredVideos = [...allFilteredVideos, ...pageFilteredVideos];
                pageCount++;

                // If no next page, stop
                if (!nextPageToken) {
                    break;
                }
            } catch (error: any) {
                console.error('YouTube search error:', error);
                throw error;
            }
        }

        // Return requested number of results
        return allFilteredVideos.slice(0, filters.maxResults);
    }

    /**
     * Get detailed statistics for multiple videos
     */
    async getVideoStatistics(videoIds: string[]): Promise<YouTubeVideo[]> {
        if (!this.apiKey) {
            throw new Error('YouTube API key is required');
        }

        if (videoIds.length === 0) {
            return [];
        }

        const params = new URLSearchParams({
            part: 'snippet,statistics,contentDetails',
            id: videoIds.join(','),
            key: this.apiKey,
        });

        try {
            const response = await fetch(`${this.baseUrl}/videos?${params}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to fetch video statistics');
            }

            const data = await response.json();
            const items: YouTubeVideoStatistics[] = data.items || [];

            return items.map(item => ({
                id: item.id,
                title: item.snippet.title,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                viewCount: parseInt(item.statistics.viewCount || '0'),
                likeCount: parseInt(item.statistics.likeCount || '0'),
                commentCount: parseInt(item.statistics.commentCount || '0'),
                duration: item.contentDetails.duration,
                url: `https://www.youtube.com/watch?v=${item.id}`,
            }));
        } catch (error: any) {
            console.error('YouTube statistics error:', error);
            throw error;
        }
    }

    /**
     * Get channel information including subscriber count
     */
    async getChannelInfo(channelId: string): Promise<{ subscriberCount: number } | null> {
        if (!this.apiKey) {
            throw new Error('YouTube API key is required');
        }

        const params = new URLSearchParams({
            part: 'statistics',
            id: channelId,
            key: this.apiKey,
        });

        try {
            const response = await fetch(`${this.baseUrl}/channels?${params}`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            const channel = data.items?.[0];

            if (!channel) {
                return null;
            }

            return {
                subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
            };
        } catch (error) {
            console.error('Channel info error:', error);
            return null;
        }
    }

    /**
     * Validate API key by making a simple request
     */
    async validateApiKey(): Promise<boolean> {
        if (!this.apiKey) {
            return false;
        }

        try {
            const params = new URLSearchParams({
                part: 'snippet',
                q: 'test',
                maxResults: '1',
                type: 'video',
                key: this.apiKey,
            });

            const response = await fetch(`${this.baseUrl}/search?${params}`);
            return response.ok;
        } catch {
            return false;
        }
    }
}

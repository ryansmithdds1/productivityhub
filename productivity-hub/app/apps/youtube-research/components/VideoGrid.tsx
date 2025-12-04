import { useState, useEffect } from 'react';
import { ArrowUpDown, Sparkles, Grid3X3, List } from 'lucide-react';
import type { YouTubeVideo, SortOption } from '../types';
import { VideoCard } from './VideoCard';
import { VideoListItem } from './VideoListItem';
import { calculateMetrics, formatDuration } from '../lib/utils';
import { getTopVideosToReplicate, calculateReplicabilityScore } from '../lib/scoring';

type VideoFormatFilter = 'all' | 'shorts' | 'long';
type ViewMode = 'grid' | 'list';

interface VideoGridProps {
    videos: YouTubeVideo[];
    isLoading: boolean;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    bookmarkedIds: Set<string>;
    onToggleBookmark: (video: YouTubeVideo) => void;
    onFormatFilterChange?: (filter: VideoFormatFilter) => void;
}

export function VideoGrid({
    videos,
    isLoading,
    sortBy,
    onSortChange,
    bookmarkedIds,
    onToggleBookmark,
    onFormatFilterChange,
}: VideoGridProps) {
    const [showTopOnly, setShowTopOnly] = useState(false);
    const [formatFilter, setFormatFilter] = useState<VideoFormatFilter>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Handle format filter changes
    const handleFormatFilterChange = (filter: VideoFormatFilter) => {
        setFormatFilter(filter);
        if (onFormatFilterChange) {
            onFormatFilterChange(filter);
        }
    };

    // Helper to determine if a video is a short (under 60 seconds)
    const isShort = (video: YouTubeVideo): boolean => {
        const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return false;

        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        return totalSeconds < 60;
    };

    // Apply format filter
    const formatFilteredVideos = videos.filter(video => {
        if (formatFilter === 'shorts') return isShort(video);
        if (formatFilter === 'long') return !isShort(video);
        return true; // 'all'
    });

    // Client-side sorting
    const sortedVideos = [...formatFilteredVideos].sort((a, b) => {
        if (sortBy === 'engagementRate') {
            const metricsA = calculateMetrics(a);
            const metricsB = calculateMetrics(b);
            return metricsB.engagementRate - metricsA.engagementRate;
        }
        if (sortBy === 'viewsPerDay') {
            const metricsA = calculateMetrics(a);
            const metricsB = calculateMetrics(b);
            return metricsB.viewsPerDay - metricsA.viewsPerDay;
        }
        if (sortBy === 'viewCount') {
            return b.viewCount - a.viewCount;
        }
        if (sortBy === 'date') {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        // For relevance, keep API order
        return 0;
    });

    // Get top 5 or all videos based on filter (from format-filtered set)
    const topVideos = getTopVideosToReplicate(formatFilteredVideos, 5);
    const topVideoIds = new Set(topVideos.map(v => v.id));
    const displayVideos = showTopOnly ? topVideos : sortedVideos;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-100">
                        Searching...
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse"
                        >
                            <div className="aspect-video bg-gray-800" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-800 rounded w-3/4" />
                                <div className="h-3 bg-gray-800 rounded w-1/2" />
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-12 bg-gray-800 rounded" />
                                    <div className="h-12 bg-gray-800 rounded" />
                                    <div className="h-12 bg-gray-800 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-gray-400 text-lg">No videos found</p>
                <p className="text-gray-600 text-sm mt-2">
                    Try adjusting your search query or filters
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Sort */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-gray-100">
                    {showTopOnly ? 'Top 5 to Replicate' : `${formatFilteredVideos.length} ${formatFilteredVideos.length === 1 ? 'Result' : 'Results'}`}
                    {formatFilter !== 'all' && (
                        <span className="text-sm text-gray-500 ml-2">
                            ({formatFilter === 'shorts' ? 'Shorts' : 'Long-form'})
                        </span>
                    )}
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Format Filter Buttons */}
                    {!showTopOnly && (
                        <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => handleFormatFilterChange('all')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${formatFilter === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFormatFilterChange('shorts')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${formatFilter === 'shorts'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Shorts
                            </button>
                            <button
                                onClick={() => handleFormatFilterChange('long')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${formatFilter === 'long'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Long-form
                            </button>
                        </div>
                    )}

                    {/* View Mode Toggle */}
                    {!showTopOnly && (
                        <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                                title="Grid view"
                            >
                                <Grid3X3 size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                                title="List view"
                            >
                                <List size={16} />
                            </button>
                        </div>
                    )}

                    {/* Top 5 Filter Toggle */}
                    <button
                        onClick={() => setShowTopOnly(!showTopOnly)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${showTopOnly
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                            }`}
                    >
                        <Sparkles size={16} />
                        {showTopOnly ? 'Show All' : 'Top 5 to Replicate'}
                    </button>

                    {/* Sort Dropdown */}
                    {!showTopOnly && (
                        <>
                            <ArrowUpDown className="text-gray-500" size={16} />
                            <select
                                value={sortBy}
                                onChange={(e) => onSortChange(e.target.value as SortOption)}
                                className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="viewCount">Most Views</option>
                                <option value="engagementRate">Highest Engagement</option>
                                <option value="viewsPerDay">Most Views/Day</option>
                                <option value="date">Most Recent</option>
                            </select>
                        </>
                    )}
                </div>
            </div>

            {/* Info Banner for Top 5 */}
            {showTopOnly && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Sparkles className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-purple-400 font-semibold mb-1">Smart AI Recommendations</h3>
                            <p className="text-sm text-gray-400">
                                These videos are ranked by a composite score considering engagement rate (30%),
                                views/day (30%), recency (20%), and channel reachability (20%).
                                The best videos to replicate balance high performance with achievability.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayVideos.map((video, index) => {
                        const isTopVideo = topVideoIds.has(video.id);
                        const rank = showTopOnly ? index + 1 : undefined;

                        return (
                            <div key={video.id} className="relative">
                                {/* Top Video Badge */}
                                {isTopVideo && !showTopOnly && (
                                    <div className="absolute -top-2 -right-2 z-10">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Sparkles size={12} />
                                            Top 5
                                        </div>
                                    </div>
                                )}
                                {/* Rank Badge for Top 5 View */}
                                {showTopOnly && rank && (
                                    <div className="absolute -top-2 -left-2 z-10">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold w-8 h-8 rounded-full shadow-lg flex items-center justify-center">
                                            {rank}
                                        </div>
                                    </div>
                                )}
                                <VideoCard
                                    video={video}
                                    isBookmarked={bookmarkedIds.has(video.id)}
                                    onToggleBookmark={onToggleBookmark}
                                    showScore={showTopOnly}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-3">
                    {displayVideos.map((video, index) => {
                        const isTopVideo = topVideoIds.has(video.id);
                        const rank = showTopOnly ? index + 1 : undefined;

                        return (
                            <VideoListItem
                                key={video.id}
                                video={video}
                                isBookmarked={bookmarkedIds.has(video.id)}
                                onToggleBookmark={onToggleBookmark}
                                showScore={showTopOnly}
                                rank={rank}
                                isTopVideo={isTopVideo}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

import { ExternalLink, Bookmark, BookmarkCheck, TrendingUp, Target } from 'lucide-react';
import type { YouTubeVideo } from '../types';
import { calculateMetrics, formatNumber, formatRelativeTime } from '../lib/utils';
import { calculateReplicabilityScore, getScoreBreakdown } from '../lib/scoring';

interface VideoListItemProps {
    video: YouTubeVideo;
    isBookmarked: boolean;
    onToggleBookmark: (video: YouTubeVideo) => void;
    showScore?: boolean;
    rank?: number;
    isTopVideo?: boolean;
}

export function VideoListItem({
    video,
    isBookmarked,
    onToggleBookmark,
    showScore = false,
    rank,
    isTopVideo = false,
}: VideoListItemProps) {
    const metrics = calculateMetrics(video);
    const score = showScore ? calculateReplicabilityScore(video) : null;

    return (
        <div className="relative bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all group">
            {/* Top Video Badge */}
            {isTopVideo && !showScore && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Target size={10} />
                        Top 5
                    </div>
                </div>
            )}

            {/* Rank Badge */}
            {showScore && rank && (
                <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold w-7 h-7 rounded-full shadow-lg flex items-center justify-center">
                        {rank}
                    </div>
                </div>
            )}

            <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    <div className="relative w-48 aspect-video bg-gray-950 rounded-lg overflow-hidden">
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    {/* Title & Channel */}
                    <div>
                        <h3 className="font-semibold text-gray-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors mb-1">
                            {video.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{video.channelTitle}</span>
                            {video.channelSubscribers && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span>{formatNumber(video.channelSubscribers)} subs</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                        <span>{formatNumber(video.viewCount)} views</span>
                        <span>•</span>
                        <span>{formatNumber(video.likeCount)} likes</span>
                        <span>•</span>
                        <span>{formatRelativeTime(video.publishedAt)}</span>
                        <span>•</span>
                        <span className="text-gray-500">{formatNumber(metrics.viewsPerDay)}/day</span>
                    </div>
                </div>

                {/* Metrics Column */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2 min-w-[160px]">
                    {/* Engagement Badge */}
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${metrics.engagementRate >= 5
                            ? 'bg-green-500/10 text-green-400'
                            : metrics.engagementRate >= 2
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-gray-500/10 text-gray-400'
                        }`}>
                        {metrics.engagementRate.toFixed(2)}% Engagement
                    </div>

                    {/* Score Badge */}
                    {showScore && score !== null && (
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-3 py-1 rounded-lg">
                            <div className="text-xs text-purple-400 font-semibold">
                                Score: {score}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                        <button
                            onClick={() => onToggleBookmark(video)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
                            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                            {isBookmarked ? (
                                <BookmarkCheck className="text-yellow-400" size={16} />
                            ) : (
                                <Bookmark className="text-gray-400" size={16} />
                            )}
                        </button>
                        <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                            title="Watch on YouTube"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

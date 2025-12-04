import { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import type { YouTubeVideo } from '../types';
import { calculateMetrics, formatNumber, formatDuration, formatRelativeTime } from '../lib/utils';
import { calculateReplicabilityScore, getScoreBreakdown } from '../lib/scoring';
import { MetricsDisplay } from './MetricsDisplay';

interface VideoCardProps {
    video: YouTubeVideo;
    isBookmarked: boolean;
    onToggleBookmark: (video: YouTubeVideo) => void;
    showScore?: boolean;
}

export function VideoCard({ video, isBookmarked, onToggleBookmark, showScore = false }: VideoCardProps) {
    const metrics = calculateMetrics(video);
    const [imageError, setImageError] = useState(false);
    const score = showScore ? calculateReplicabilityScore(video) : null;
    const scoreBreakdown = showScore ? getScoreBreakdown(video) : null;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-950">
                {!imageError ? (
                    <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No thumbnail
                    </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
                    {formatDuration(video.duration)}
                </div>

                {/* Bookmark Button */}
                <button
                    onClick={() => onToggleBookmark(video)}
                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-all"
                    title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                    {isBookmarked ? (
                        <BookmarkCheck className="text-yellow-400" size={18} />
                    ) : (
                        <Bookmark className="text-white" size={18} />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-semibold text-gray-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                    {video.title}
                </h3>

                {/* Channel */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{video.channelTitle}</span>
                    {video.channelSubscribers && (
                        <span className="text-gray-600">•</span>
                    )}
                    {video.channelSubscribers && (
                        <span>{formatNumber(video.channelSubscribers)} subs</span>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-950 rounded-lg px-2 py-1.5 text-center">
                        <div className="text-gray-500 mb-0.5">Views</div>
                        <div className="font-semibold text-gray-200">{formatNumber(video.viewCount)}</div>
                    </div>
                    <div className="bg-gray-950 rounded-lg px-2 py-1.5 text-center">
                        <div className="text-gray-500 mb-0.5">Likes</div>
                        <div className="font-semibold text-gray-200">{formatNumber(video.likeCount)}</div>
                    </div>
                    <div className="bg-gray-950 rounded-lg px-2 py-1.5 text-center">
                        <div className="text-gray-500 mb-0.5">Comments</div>
                        <div className="font-semibold text-gray-200">{formatNumber(video.commentCount)}</div>
                    </div>
                </div>

                {/* Metrics */}
                <MetricsDisplay metrics={metrics} />

                {/* Replicability Score (only shown in Top 5 mode) */}
                {showScore && score !== null && scoreBreakdown && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Target className="text-purple-400" size={16} />
                                <span className="text-xs font-semibold text-purple-400">Replicability Score</span>
                            </div>
                            <span className="text-lg font-bold text-purple-400">{score}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Engagement:</span>
                                <span className="text-gray-300 font-medium">{scoreBreakdown.engagement}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Trending:</span>
                                <span className="text-gray-300 font-medium">{scoreBreakdown.viewsPerDay}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Recency:</span>
                                <span className="text-gray-300 font-medium">{scoreBreakdown.recency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Reachable:</span>
                                <span className="text-gray-300 font-medium">{scoreBreakdown.reachability}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatRelativeTime(video.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        {formatNumber(metrics.viewsPerDay)}/day
                    </div>
                </div>

                {/* Action Button */}
                <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all text-center inline-flex items-center justify-center gap-2"
                >
                    <ExternalLink size={16} />
                    Watch on YouTube
                </a>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Play, ThumbsUp, MessageCircle, Eye, AlertCircle } from 'lucide-react';

interface Video {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
}

export function YouTubeLatestVideos({ channelId, apiKey }: { channelId: string; apiKey: string }) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // 1. Get Uploads Playlist ID
                const channelRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
                );
                const channelData = await channelRes.json();

                if (!channelData.items?.[0]) throw new Error('Channel not found');

                const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

                // 2. Get Latest Videos from Playlist
                const playlistRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${apiKey}`
                );
                const playlistData = await playlistRes.json();

                if (!playlistData.items) throw new Error('No videos found');

                // 3. Get Video Stats (Views, Likes)
                const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
                const videoRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`
                );
                const videoData = await videoRes.json();

                // 4. Merge Data
                const mergedVideos = playlistData.items.map((item: any, index: number) => {
                    const stats = videoData.items[index].statistics;
                    return {
                        id: item.snippet.resourceId.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.medium.url,
                        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
                        viewCount: stats.viewCount,
                        likeCount: stats.likeCount,
                        commentCount: stats.commentCount,
                    };
                });

                setVideos(mergedVideos);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load videos');
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [channelId, apiKey]);

    const formatNumber = (num: string) => {
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(parseInt(num));
    };

    if (loading) return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-800 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
                ))}
            </div>
        </div>
    );

    if (error) return null;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <Play className="text-red-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Latest Videos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videos.map(video => (
                    <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-gray-800/30 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all hover:-translate-y-1"
                    >
                        <div className="aspect-video relative">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="text-white fill-white" size={32} />
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-medium line-clamp-2 mb-3 h-12">
                                {video.title}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {formatNumber(video.viewCount)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThumbsUp size={14} />
                                    {formatNumber(video.likeCount)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle size={14} />
                                    {formatNumber(video.commentCount)}
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                {video.publishedAt}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

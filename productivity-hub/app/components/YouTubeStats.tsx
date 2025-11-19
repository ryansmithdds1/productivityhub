'use client';

import { useState, useEffect } from 'react';
import { Users, Eye, Video, TrendingUp, AlertCircle } from 'lucide-react';

interface ChannelStats {
    subscriberCount: string;
    viewCount: string;
    videoCount: string;
    hiddenSubscriberCount: boolean;
}

export function YouTubeStats({ channelId, apiKey: initialApiKey }: { channelId: string; apiKey?: string }) {
    const [stats, setStats] = useState<ChannelStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string>(initialApiKey || '');
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        if (initialApiKey) {
            setApiKey(initialApiKey);
            return;
        }

        const storedKey = localStorage.getItem('youtube_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            setShowInput(true);
            setLoading(false);
        }
    }, [initialApiKey]);

    useEffect(() => {
        if (!apiKey) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
                );
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error.message);
                }

                if (data.items && data.items.length > 0) {
                    setStats(data.items[0].statistics);
                    setError(null);
                    localStorage.setItem('youtube_api_key', apiKey);
                    setShowInput(false);
                } else {
                    setError('Channel not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [channelId, apiKey]);

    if (showInput) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <TrendingUp className="text-red-400" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">YouTube Stats</h2>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Enter your YouTube Data API Key to see live stats.</p>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            placeholder="Paste API Key (AIza...)"
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-800 rounded mb-6"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-gray-800 rounded-lg"></div>
                    <div className="h-24 bg-gray-800 rounded-lg"></div>
                    <div className="h-24 bg-gray-800 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle size={20} />
                        <span className="font-medium">Error loading stats</span>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('youtube_api_key');
                            setApiKey('');
                            setShowInput(true);
                        }}
                        className="text-xs text-gray-500 hover:text-white underline"
                    >
                        Reset Key
                    </button>
                </div>
                <p className="text-sm text-gray-500">{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const formatNumber = (num: string) => {
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(parseInt(num));
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <TrendingUp className="text-red-400" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Channel Stats</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Reset API Key?')) {
                                localStorage.removeItem('youtube_api_key');
                                setApiKey('');
                                setShowInput(true);
                            }
                        }}
                        className="text-xs text-gray-600 hover:text-gray-400"
                    >
                        Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Subscribers */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Users size={16} />
                        <span className="text-sm font-medium">Subscribers</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {formatNumber(stats.subscriberCount)}
                    </div>
                </div>

                {/* Views */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Eye size={16} />
                        <span className="text-sm font-medium">Total Views</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {formatNumber(stats.viewCount)}
                    </div>
                </div>

                {/* Videos */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Video size={16} />
                        <span className="text-sm font-medium">Videos</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {formatNumber(stats.videoCount)}
                    </div>
                </div>
            </div>
        </div>
    );
}

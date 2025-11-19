'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Edit2, Check, X, Instagram, Music2 } from 'lucide-react';

interface SocialStatCardProps {
    platform: 'tiktok' | 'instagram';
    username: string;
    initialFollowers: string;
    color: string;
}

export function SocialStatCard({ platform, username, initialFollowers, color }: SocialStatCardProps) {
    const Icon = platform === 'instagram' ? Instagram : Music2;
    const [followers, setFollowers] = useState(initialFollowers);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem(`social_stats_${platform}`);
        if (stored) {
            setFollowers(stored);
        }
    }, [platform]);

    const handleSave = () => {
        setFollowers(editValue);
        localStorage.setItem(`social_stats_${platform}`, editValue);
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${color} bg-opacity-10 rounded-lg`}>
                        <Icon className={color.replace('bg-', 'text-')} size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white capitalize">{platform}</h2>
                        <p className="text-xs text-gray-500">@{username}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                        Manual
                    </div>
                    <button
                        onClick={() => {
                            setEditValue(followers);
                            setIsEditing(!isEditing);
                        }}
                        className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <TrendingUp size={16} />
                    <span className="text-sm font-medium">Followers</span>
                </div>

                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-lg font-bold w-full focus:outline-none focus:border-blue-500"
                            autoFocus
                        />
                        <button onClick={handleSave} className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                            <Check size={18} />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="text-2xl font-bold text-white">
                        {followers}
                    </div>
                )}
            </div>
        </div>
    );
}

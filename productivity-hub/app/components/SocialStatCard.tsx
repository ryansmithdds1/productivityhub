import { LucideIcon, TrendingUp } from 'lucide-react';

interface SocialStatCardProps {
    platform: 'tiktok' | 'instagram';
    username: string;
    followers: string;
    color: string;
    icon: LucideIcon;
}

export function SocialStatCard({ platform, username, followers, color, icon: Icon }: SocialStatCardProps) {
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
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                    Manual
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <TrendingUp size={16} />
                    <span className="text-sm font-medium">Followers</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    {followers}
                </div>
            </div>
        </div>
    );
}

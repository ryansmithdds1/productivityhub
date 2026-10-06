import { Play } from 'lucide-react';

export function YouTubeLatestVideos() {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <Play className="text-red-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Latest Videos</h2>
            </div>
            <p className="text-sm text-gray-400">
                YouTube data is unavailable until a secure server connection is configured.
            </p>
        </div>
    );
}

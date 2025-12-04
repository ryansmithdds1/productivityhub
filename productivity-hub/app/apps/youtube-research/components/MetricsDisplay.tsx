import type { VideoMetrics } from '../types';

interface MetricsDisplayProps {
    metrics: VideoMetrics;
}

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
    // Determine engagement rate quality (color coding)
    const getEngagementColor = (rate: number) => {
        if (rate >= 5) return 'text-green-400 bg-green-500/10';
        if (rate >= 2) return 'text-yellow-400 bg-yellow-500/10';
        return 'text-gray-400 bg-gray-500/10';
    };

    const getLikeRatioColor = (ratio: number) => {
        if (ratio >= 3) return 'text-green-400 bg-green-500/10';
        if (ratio >= 1) return 'text-yellow-400 bg-yellow-500/10';
        return 'text-gray-400 bg-gray-500/10';
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            {/* Engagement Rate */}
            <div className={`rounded-lg px-3 py-2 ${getEngagementColor(metrics.engagementRate)}`}>
                <div className="text-xs opacity-80 mb-1">Engagement</div>
                <div className="font-bold text-sm">
                    {metrics.engagementRate.toFixed(2)}%
                </div>
            </div>

            {/* Like Ratio */}
            <div className={`rounded-lg px-3 py-2 ${getLikeRatioColor(metrics.likeRatio)}`}>
                <div className="text-xs opacity-80 mb-1">Like Ratio</div>
                <div className="font-bold text-sm">
                    {metrics.likeRatio.toFixed(2)}%
                </div>
            </div>
        </div>
    );
}

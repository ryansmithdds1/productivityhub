import { CheckCircle2, Circle } from 'lucide-react';
import type { Content } from '../types';

interface ProgressBarsProps {
    content: Content[];
    weekStart: number;
}

export function ProgressBars({ content, weekStart }: ProgressBarsProps) {
    const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);

    // Filter content for this week
    const weekContent = content.filter(c => c.dueDate >= weekStart && c.dueDate < weekEnd);

    // Count by type
    const shorts = weekContent.filter(c => c.type === 'short');
    const videos = weekContent.filter(c => c.type === 'youtube');
    const newsletters = weekContent.filter(c => c.type === 'newsletter');

    // Calculate completion
    const shortsComplete = shorts.filter(c => c.status === 'posted').length;
    const videosComplete = videos.filter(c => c.status === 'posted').length;

    const newsletter = newsletters[0];
    const newsletterSectionsComplete = newsletter
        ? newsletter.sections.filter(s => s.completed).length
        : 0;

    const GOALS = {
        shorts: 7,
        videos: 3,
        newsletterSections: 6,
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shorts Progress */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-purple-400">Shorts</h3>
                    <span className="text-2xl font-bold text-purple-300">
                        {shorts.length}/{GOALS.shorts}
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(shorts.length / GOALS.shorts) * 100}%` }}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle2 size={14} className="text-green-400" />
                    <span>{shortsComplete} posted</span>
                </div>
            </div>

            {/* YouTube Videos Progress */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-red-400">YouTube Videos</h3>
                    <span className="text-2xl font-bold text-red-300">
                        {videos.length}/{GOALS.videos}
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${(videos.length / GOALS.videos) * 100}%` }}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle2 size={14} className="text-green-400" />
                    <span>{videosComplete} posted</span>
                </div>
            </div>

            {/* Newsletter Progress */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-blue-400">Newsletter</h3>
                    <span className="text-2xl font-bold text-blue-300">
                        {newsletterSectionsComplete}/{GOALS.newsletterSections}
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(newsletterSectionsComplete / GOALS.newsletterSections) * 100}%` }}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {newsletter ? (
                        <>
                            <CheckCircle2 size={14} className="text-green-400" />
                            <span>{newsletterSectionsComplete} sections done</span>
                        </>
                    ) : (
                        <>
                            <Circle size={14} className="text-gray-600" />
                            <span>Not started</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

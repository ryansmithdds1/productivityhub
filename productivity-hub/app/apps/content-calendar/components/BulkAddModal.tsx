import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { storage, createDefaultNewsletter } from '../lib/storage';
import type { Short, YouTubeVideo, Newsletter, NewsletterSection } from '../types';

interface BulkAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    weekStart: number;
}

interface BulkShortEntry {
    title: string;
    day: number; // 0-6 for Mon-Sun
}

interface BulkVideoEntry {
    title: string;
    day: number;
}

interface BulkNewsletterEntry {
    sections: NewsletterSection[];
}

export function BulkAddModal({ isOpen, onClose, onSaved, weekStart }: BulkAddModalProps) {
    const [numWeeks, setNumWeeks] = useState(1);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

    const createDefaultSections = (): NewsletterSection[] => [
        { name: 'below-gumline', label: 'Below the Gumline', completed: false, content: '' },
        { name: 'news', label: 'News Articles', completed: false, content: '' },
        { name: 'research', label: 'The Research Says', completed: false, content: '' },
        { name: 'business', label: 'Business Topic', completed: false, content: '' },
        { name: 'efficiency', label: 'Efficiency Topic', completed: false, content: '' },
        { name: 'meme', label: 'Meme', completed: false, content: '' },
    ];

    // Initialize with 7 shorts, 3 videos, and newsletter per week
    const [weeksData, setWeeksData] = useState<{
        shorts: BulkShortEntry[][];
        videos: BulkVideoEntry[][];
        newsletters: BulkNewsletterEntry[];
    }>({
        shorts: [Array(7).fill(null).map(() => ({ title: '', day: 0 }))],
        videos: [Array(3).fill(null).map(() => ({ title: '', day: 0 }))],
        newsletters: [{ sections: createDefaultSections() }],
    });

    if (!isOpen) return null;

    const addWeek = () => {
        setNumWeeks(prev => prev + 1);
        setWeeksData(prev => ({
            shorts: [...prev.shorts, Array(7).fill(null).map(() => ({ title: '', day: 0 }))],
            videos: [...prev.videos, Array(3).fill(null).map(() => ({ title: '', day: 0 }))],
            newsletters: [...prev.newsletters, { sections: createDefaultSections() }],
        }));
    };

    const updateShort = (weekIdx: number, shortIdx: number, field: keyof BulkShortEntry, value: any) => {
        setWeeksData(prev => {
            const newShorts = [...prev.shorts];
            newShorts[weekIdx] = [...newShorts[weekIdx]];
            newShorts[weekIdx][shortIdx] = { ...newShorts[weekIdx][shortIdx], [field]: value };
            return { ...prev, shorts: newShorts };
        });
    };

    const updateVideo = (weekIdx: number, videoIdx: number, field: keyof BulkVideoEntry, value: any) => {
        setWeeksData(prev => {
            const newVideos = [...prev.videos];
            newVideos[weekIdx] = [...newVideos[weekIdx]];
            newVideos[weekIdx][videoIdx] = { ...newVideos[weekIdx][videoIdx], [field]: value };
            return { ...prev, videos: newVideos };
        });
    };

    const updateNewsletterSection = (weekIdx: number, sectionIdx: number, content: string) => {
        setWeeksData(prev => {
            const newNewsletters = [...prev.newsletters];
            newNewsletters[weekIdx] = {
                sections: [...newNewsletters[weekIdx].sections],
            };
            newNewsletters[weekIdx].sections[sectionIdx] = {
                ...newNewsletters[weekIdx].sections[sectionIdx],
                content,
                completed: content.trim().length > 0, // Auto-mark as complete if content is entered
            };
            return { ...prev, newsletters: newNewsletters };
        });
    };

    const handleSave = () => {
        const currentTime = Date.now();

        weeksData.shorts.forEach((weekShorts, weekIdx) => {
            const currentWeekStart = weekStart + (weekIdx * 7 * 24 * 60 * 60 * 1000);

            weekShorts.forEach((short, idx) => {
                if (short.title.trim()) {
                    const dueDate = currentWeekStart + (short.day * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000); // noon
                    const newShort: Short = {
                        id: `short-${currentTime}-${weekIdx}-${idx}`,
                        type: 'short',
                        title: short.title,
                        platform: 'tiktok', // Default to tiktok since they post to all platforms
                        status: 'idea',
                        dueDate,
                        createdAt: currentTime,
                        updatedAt: currentTime,
                    };
                    storage.saveContent(newShort);
                }
            });
        });

        weeksData.videos.forEach((weekVideos, weekIdx) => {
            const currentWeekStart = weekStart + (weekIdx * 7 * 24 * 60 * 60 * 1000);

            weekVideos.forEach((video, idx) => {
                if (video.title.trim()) {
                    const dueDate = currentWeekStart + (video.day * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000);
                    const newVideo: YouTubeVideo = {
                        id: `youtube-${currentTime}-${weekIdx}-${idx}`,
                        type: 'youtube',
                        title: video.title,
                        status: 'idea',
                        dueDate,
                        thumbnailStatus: 'none',
                        createdAt: currentTime,
                        updatedAt: currentTime,
                    };
                    storage.saveContent(newVideo);
                }
            });
        });

        weeksData.newsletters.forEach((newsletter, weekIdx) => {
            const currentWeekStart = weekStart + (weekIdx * 7 * 24 * 60 * 60 * 1000);
            const dueDate = currentWeekStart + (6 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000); // Sunday noon

            const newNewsletter: Newsletter = {
                id: `newsletter-${currentTime}-${weekIdx}`,
                type: 'newsletter',
                title: 'Weekly Newsletter',
                status: 'idea',
                dueDate,
                weekOf: currentWeekStart,
                sections: newsletter.sections,
                createdAt: currentTime,
                updatedAt: currentTime,
            };
            storage.saveContent(newNewsletter);
        });

        onSaved();
        onClose();
    };

    const getWeekLabel = (weekIdx: number) => {
        const ws = weekStart + (weekIdx * 7 * 24 * 60 * 60 * 1000);
        const date = new Date(ws);
        return `Week ${weekIdx + 1} (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    };

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-100">Bulk Planning Mode</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Week Tabs */}
                <div className="flex items-center gap-2 px-6 pt-4 border-b border-gray-800 pb-3 overflow-x-auto">
                    {Array.from({ length: numWeeks }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentWeekIndex(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentWeekIndex === idx
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {getWeekLabel(idx)}
                        </button>
                    ))}
                    <button
                        onClick={addWeek}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        Add Week
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Shorts Table */}
                    <div>
                        <h3 className="text-lg font-semibold text-purple-400 mb-3">Shorts (7 per week)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left text-sm font-medium text-gray-400 pb-2 pr-4">#</th>
                                        <th className="text-left text-sm font-medium text-gray-400 pb-2 pr-4">Title</th>
                                        <th className="text-left text-sm font-medium text-gray-400 pb-2">Day</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeksData.shorts[currentWeekIndex]?.map((short, idx) => (
                                        <tr key={idx} className="border-b border-gray-800/50">
                                            <td className="py-3 pr-4 text-gray-500">{idx + 1}</td>
                                            <td className="py-3 pr-4">
                                                <input
                                                    type="text"
                                                    value={short.title}
                                                    onChange={(e) => updateShort(currentWeekIndex, idx, 'title', e.target.value)}
                                                    placeholder={`Short ${idx + 1} title...`}
                                                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </td>
                                            <td className="py-3">
                                                <select
                                                    value={short.day}
                                                    onChange={(e) => updateShort(currentWeekIndex, idx, 'day', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    {days.map((day, dayIdx) => (
                                                        <option key={dayIdx} value={dayIdx}>{day}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* YouTube Videos Table */}
                    <div>
                        <h3 className="text-lg font-semibold text-red-400 mb-3">YouTube Videos (3 per week)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left text-sm font-medium text-gray-400 pb-2 pr-4">#</th>
                                        <th className="text-left text-sm font-medium text-gray-400 pb-2 pr-4">Title</th>
                                        <th className="text-left text-sm font-medium text-gray-400 pb-2">Day</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeksData.videos[currentWeekIndex]?.map((video, idx) => (
                                        <tr key={idx} className="border-b border-gray-800/50">
                                            <td className="py-3 pr-4 text-gray-500">{idx + 1}</td>
                                            <td className="py-3 pr-4">
                                                <input
                                                    type="text"
                                                    value={video.title}
                                                    onChange={(e) => updateVideo(currentWeekIndex, idx, 'title', e.target.value)}
                                                    placeholder={`Video ${idx + 1} title...`}
                                                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                            </td>
                                            <td className="py-3">
                                                <select
                                                    value={video.day}
                                                    onChange={(e) => updateVideo(currentWeekIndex, idx, 'day', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    {days.map((day, dayIdx) => (
                                                        <option key={dayIdx} value={dayIdx}>{day}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Newsletter Sections */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-3">Newsletter Sections</h3>
                        <div className="space-y-3">
                            {weeksData.newsletters[currentWeekIndex]?.sections.map((section, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <label className="w-40 text-sm font-medium text-gray-400 flex-shrink-0">
                                        {section.label}:
                                    </label>
                                    <input
                                        type="text"
                                        value={section.content || ''}
                                        onChange={(e) => updateNewsletterSection(currentWeekIndex, idx, e.target.value)}
                                        placeholder={`Topic or title for ${section.label}...`}
                                        className="flex-1 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-800">
                    <p className="text-sm text-gray-500">
                        Planning {numWeeks} week{numWeeks > 1 ? 's' : ''} of content
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
                        >
                            Save All Content
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

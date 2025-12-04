import { useState } from 'react';
import { Trash2, ExternalLink, FileText, Tag } from 'lucide-react';
import type { SavedVideo } from '../types';
import { formatNumber, formatRelativeTime, formatDuration, calculateMetrics } from '../lib/utils';
import { MetricsDisplay } from './MetricsDisplay';

interface SavedVideosProps {
    videos: SavedVideo[];
    onDelete: (videoId: string) => void;
    onUpdateNotes: (videoId: string, notes: string) => void;
    onUpdateTags: (videoId: string, tags: string[]) => void;
}

export function SavedVideos({ videos, onDelete, onUpdateNotes, onUpdateTags }: SavedVideosProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
    const [notesText, setNotesText] = useState('');

    const handleSaveNotes = (videoId: string) => {
        onUpdateNotes(videoId, notesText);
        setEditingNotesId(null);
    };

    const handleEditNotes = (video: SavedVideo) => {
        setEditingNotesId(video.id);
        setNotesText(video.notes || '');
    };

    if (videos.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-gray-400 text-lg">No saved videos yet</p>
                <p className="text-gray-600 text-sm mt-2">
                    Bookmark videos from search results to save them here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100">
                    Saved Videos ({videos.length})
                </h2>
            </div>

            <div className="space-y-4">
                {videos.map((video) => {
                    const metrics = calculateMetrics(video);
                    const isExpanded = expandedId === video.id;
                    const isEditingNotes = editingNotesId === video.id;

                    return (
                        <div
                            key={video.id}
                            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all"
                        >
                            <div className="p-4">
                                <div className="flex gap-4">
                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0">
                                        <div className="relative w-40 aspect-video bg-gray-950 rounded-lg overflow-hidden">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
                                                {formatDuration(video.duration)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        {/* Title & Channel */}
                                        <div>
                                            <h3 className="font-semibold text-gray-100 line-clamp-2 leading-snug">
                                                {video.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {video.channelTitle}
                                            </p>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>{formatNumber(video.viewCount)} views</span>
                                            <span>•</span>
                                            <span>{formatRelativeTime(video.publishedAt)}</span>
                                            <span>•</span>
                                            <span>Saved {formatRelativeTime(new Date(video.savedAt).toISOString())}</span>
                                        </div>

                                        {/* Metrics */}
                                        <div className="max-w-xs">
                                            <MetricsDisplay metrics={metrics} />
                                        </div>

                                        {/* Notes Preview */}
                                        {video.notes && !isExpanded && (
                                            <p className="text-sm text-gray-400 line-clamp-2 italic">
                                                "{video.notes}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex flex-col gap-2">
                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                                            title="Watch on YouTube"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : video.id)}
                                            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
                                            title="View details"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(video.id)}
                                            className="p-2 bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-400 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                                        {/* Notes Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-gray-300">Notes</label>
                                                {!isEditingNotes && (
                                                    <button
                                                        onClick={() => handleEditNotes(video)}
                                                        className="text-sm text-red-400 hover:text-red-300"
                                                    >
                                                        {video.notes ? 'Edit' : 'Add notes'}
                                                    </button>
                                                )}
                                            </div>
                                            {isEditingNotes ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={notesText}
                                                        onChange={(e) => setNotesText(e.target.value)}
                                                        placeholder="Add your notes about this video..."
                                                        rows={4}
                                                        className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSaveNotes(video.id)}
                                                            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingNotesId(null)}
                                                            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">
                                                    {video.notes || 'No notes yet'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Full Stats */}
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="bg-gray-950 rounded-lg px-3 py-2">
                                                <div className="text-xs text-gray-500 mb-1">Views</div>
                                                <div className="font-semibold text-gray-200">{formatNumber(video.viewCount)}</div>
                                            </div>
                                            <div className="bg-gray-950 rounded-lg px-3 py-2">
                                                <div className="text-xs text-gray-500 mb-1">Likes</div>
                                                <div className="font-semibold text-gray-200">{formatNumber(video.likeCount)}</div>
                                            </div>
                                            <div className="bg-gray-950 rounded-lg px-3 py-2">
                                                <div className="text-xs text-gray-500 mb-1">Comments</div>
                                                <div className="font-semibold text-gray-200">{formatNumber(video.commentCount)}</div>
                                            </div>
                                            <div className="bg-gray-950 rounded-lg px-3 py-2">
                                                <div className="text-xs text-gray-500 mb-1">Views/Day</div>
                                                <div className="font-semibold text-gray-200">{formatNumber(metrics.viewsPerDay)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

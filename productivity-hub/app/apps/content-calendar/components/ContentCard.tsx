import { Trash2, Edit2, CheckCircle, Link as LinkIcon } from 'lucide-react';
import type { Content, Status } from '../types';
import { formatDate } from '../lib/utils';
import { cn } from '@/lib/utils';
import { getHookPointScriptById } from '../lib/hookpoint';

interface ContentCardProps {
    content: Content;
    onUpdate: (content: Content) => void;
    onDelete: (id: string) => void;
}

export function ContentCard({ content, onUpdate, onDelete }: ContentCardProps) {
    const statusColors: Record<Status, string> = {
        idea: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        scripted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        filmed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        edited: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        ready: 'bg-green-500/10 text-green-400 border-green-500/20',
        posted: 'bg-green-600/10 text-green-300 border-green-600/20',
    };

    const typeColors = {
        short: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
        youtube: 'from-red-500/10 to-red-600/5 border-red-500/20',
        newsletter: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    };

    const handleStatusChange = (newStatus: Status) => {
        onUpdate({
            ...content,
            status: newStatus,
            updatedAt: Date.now(),
        });
    };

    const typeLabel = {
        short: content.type === 'short' ? `${content.platform} Short` : '',
        youtube: 'YouTube Video',
        newsletter: 'Newsletter',
    }[content.type];

    return (
        <div className={cn(
            "bg-gradient-to-br border rounded-xl p-4 hover:shadow-lg transition-all",
            typeColors[content.type]
        )}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {typeLabel}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-100 mt-1 line-clamp-2">
                        {content.title}
                    </h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const statuses: Status[] = ['idea', 'scripted', 'filmed', 'edited', 'ready', 'posted'];
                            const currentIndex = statuses.indexOf(content.status);
                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                            handleStatusChange(nextStatus);
                        }}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title={`Current status: ${content.status}. Click to advance.`}
                    >
                        <CheckCircle
                            size={18}
                            className={content.status === 'posted' ? 'text-green-400' : 'text-gray-600'}
                        />
                    </button>
                    <button
                        onClick={() => onDelete(content.id)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full border",
                        statusColors[content.status]
                    )}>
                        {content.status}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatDate(content.dueDate)}
                    </span>
                </div>

                {content.type === 'newsletter' && (
                    <div className="mt-2">
                        <div className="text-xs text-gray-400 mb-1">
                            {content.sections.filter(s => s.completed).length}/{content.sections.length} sections
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            {content.sections.map(section => (
                                <div
                                    key={section.name}
                                    className={cn(
                                        "h-1.5 rounded-full",
                                        section.completed ? "bg-green-500" : "bg-gray-700"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {content.type === 'short' && content.hookpointScriptId && (
                    <div className="mt-2 flex items-center gap-2 text-xs bg-purple-500/10 border border-purple-500/20 rounded-lg px-2 py-1.5">
                        <LinkIcon size={14} className="text-purple-400" />
                        <span className="text-purple-300">
                            Linked to HookPoint script
                        </span>
                    </div>
                )}

                {(content.type === 'short' || content.type === 'youtube') && content.checklist && (
                    <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">Production Checklist:</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    const newChecklist = { ...content.checklist!, scriptCreated: !content.checklist!.scriptCreated };
                                    let newStatus = content.status;
                                    if (newChecklist.scriptCreated && content.status === 'idea') newStatus = 'scripted';
                                    onUpdate({ ...content, checklist: newChecklist, status: newStatus });
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors border",
                                    content.checklist.scriptCreated
                                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                                )}
                            >
                                <div className={cn("w-3 h-3 rounded-full border", content.checklist.scriptCreated ? "bg-green-400 border-green-400" : "border-gray-500")} />
                                Script
                            </button>

                            <button
                                onClick={() => {
                                    const newChecklist = { ...content.checklist!, filmed: !content.checklist!.filmed };
                                    let newStatus = content.status;
                                    if (newChecklist.filmed && (content.status === 'idea' || content.status === 'scripted')) newStatus = 'filmed';
                                    onUpdate({ ...content, checklist: newChecklist, status: newStatus });
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors border",
                                    content.checklist.filmed
                                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                                )}
                            >
                                <div className={cn("w-3 h-3 rounded-full border", content.checklist.filmed ? "bg-green-400 border-green-400" : "border-gray-500")} />
                                Filmed
                            </button>

                            <button
                                onClick={() => {
                                    const newChecklist = { ...content.checklist!, edited: !content.checklist!.edited };
                                    let newStatus = content.status;
                                    if (newChecklist.edited && ['idea', 'scripted', 'filmed'].includes(content.status)) newStatus = 'edited';
                                    onUpdate({ ...content, checklist: newChecklist, status: newStatus });
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors border",
                                    content.checklist.edited
                                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                                )}
                            >
                                <div className={cn("w-3 h-3 rounded-full border", content.checklist.edited ? "bg-green-400 border-green-400" : "border-gray-500")} />
                                Edited
                            </button>

                            <button
                                onClick={() => {
                                    const newChecklist = { ...content.checklist!, thumbnailCreated: !content.checklist!.thumbnailCreated };
                                    let newStatus = content.status;
                                    if (newChecklist.thumbnailCreated && newChecklist.descriptionWritten && ['idea', 'scripted', 'filmed', 'edited'].includes(content.status)) newStatus = 'ready';
                                    onUpdate({ ...content, checklist: newChecklist, status: newStatus });
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors border",
                                    content.checklist.thumbnailCreated
                                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                                )}
                            >
                                <div className={cn("w-3 h-3 rounded-full border", content.checklist.thumbnailCreated ? "bg-green-400 border-green-400" : "border-gray-500")} />
                                Thumb
                            </button>

                            <button
                                onClick={() => {
                                    const newChecklist = { ...content.checklist!, descriptionWritten: !content.checklist!.descriptionWritten };
                                    let newStatus = content.status;
                                    if (newChecklist.thumbnailCreated && newChecklist.descriptionWritten && ['idea', 'scripted', 'filmed', 'edited'].includes(content.status)) newStatus = 'ready';
                                    onUpdate({ ...content, checklist: newChecklist, status: newStatus });
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors border",
                                    content.checklist.descriptionWritten
                                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                                )}
                            >
                                <div className={cn("w-3 h-3 rounded-full border", content.checklist.descriptionWritten ? "bg-green-400 border-green-400" : "border-gray-500")} />
                                Desc
                            </button>

                            <button
                                onClick={() => {
                                    const newChecklist = { ...content.checklist!, scheduled: !content.checklist!.scheduled };
                                    let newStatus = content.status;
                                    if (newChecklist.scheduled) newStatus = 'posted';
                                    onUpdate({ ...content, checklist: newChecklist, status: newStatus });
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors border",
                                    content.checklist.scheduled
                                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                                )}
                            >
                                <div className={cn("w-3 h-3 rounded-full border", content.checklist.scheduled ? "bg-green-400 border-green-400" : "border-gray-500")} />
                                Posted
                            </button>
                        </div>
                    </div>
                )}

                {content.notes && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                        {content.notes}
                    </p>
                )}
            </div>
        </div>
    );
}

import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import type { Content, Status } from '../types';
import { ContentCard } from './ContentCard';
import { isPast } from '../lib/utils';

interface NextUpViewProps {
    content: Content[];
    onUpdate: (content: Content) => void;
    onDelete: (id: string) => void;
}

export function NextUpView({ content, onUpdate, onDelete }: NextUpViewProps) {
    // Group content by status
    const byStatus: Record<Status, Content[]> = {
        idea: [],
        scripted: [],
        filmed: [],
        edited: [],
        ready: [],
        posted: [],
    };

    content.forEach(item => {
        byStatus[item.status].push(item);
    });

    // Get overdue items (not posted and past due date)
    const overdue = content.filter(item =>
        item.status !== 'posted' && isPast(item.dueDate)
    );

    // Get today's items (due today, not posted)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = content.filter(item => {
        const dueDate = new Date(item.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return item.status !== 'posted' &&
            dueDate.getTime() >= today.getTime() &&
            dueDate.getTime() < tomorrow.getTime();
    });

    const statusInfo: Record<Status, { label: string; color: string; nextAction: string; icon: any }> = {
        idea: {
            label: 'Needs Scripting',
            color: 'text-gray-400 border-gray-700',
            nextAction: 'Write script',
            icon: Circle,
        },
        scripted: {
            label: 'Ready to Film',
            color: 'text-yellow-400 border-yellow-700',
            nextAction: 'Record video',
            icon: Clock,
        },
        filmed: {
            label: 'In Editing',
            color: 'text-orange-400 border-orange-700',
            nextAction: 'Edit video',
            icon: Clock,
        },
        edited: {
            label: 'Needs Final Touches',
            color: 'text-blue-400 border-blue-700',
            nextAction: 'Create thumbnail & description',
            icon: Clock,
        },
        ready: {
            label: 'Ready to Post',
            color: 'text-green-400 border-green-700',
            nextAction: 'Schedule/post',
            icon: CheckCircle,
        },
        posted: {
            label: 'Posted',
            color: 'text-green-600 border-green-800',
            nextAction: 'Done!',
            icon: CheckCircle,
        },
    };

    return (
        <div className="space-y-6">
            {/* Overdue Items */}
            {overdue.length > 0 && (
                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-red-400" size={24} />
                        <h2 className="text-xl font-bold text-red-300">Overdue ({overdue.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {overdue.map(item => (
                            <ContentCard
                                key={item.id}
                                content={item}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Due Today */}
            {dueToday.length > 0 && (
                <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="text-blue-400" size={24} />
                        <h2 className="text-xl font-bold text-blue-300">Due Today ({dueToday.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dueToday.map(item => (
                            <ContentCard
                                key={item.id}
                                content={item}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* By Status */}
            <div className="space-y-6">
                {(['idea', 'scripted', 'filmed', 'edited', 'ready'] as Status[]).map(status => {
                    const items = byStatus[status];
                    if (items.length === 0) return null;

                    const info = statusInfo[status];
                    const Icon = info.icon;

                    return (
                        <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Icon className={info.color.split(' ')[0]} size={24} />
                                    <h2 className="text-xl font-bold text-gray-100">{info.label} ({items.length})</h2>
                                </div>
                                <span className="text-sm text-gray-500 italic">→ {info.nextAction}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map(item => (
                                    <ContentCard
                                        key={item.id}
                                        content={item}
                                        onUpdate={onUpdate}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {content.length === 0 && (
                <div className="text-center py-16">
                    <CheckCircle size={64} className="mx-auto text-gray-700 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">No content to work on right now.</p>
                </div>
            )}

            {/* All Posted */}
            {content.length > 0 && content.every(c => c.status === 'posted') && (
                <div className="text-center py-16">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">Everything's Posted! 🎉</h3>
                    <p className="text-gray-500">Great job staying on top of your content!</p>
                </div>
            )}
        </div>
    );
}

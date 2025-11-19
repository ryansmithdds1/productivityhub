import { useEffect, useState } from 'react';
import { Plus, FileText, TrendingUp } from 'lucide-react';
import { storage } from '../lib/storage';
import { formatDate } from '../lib/utils';
import type { Script } from '../types';

interface DashboardProps {
    onNewScript: () => void;
    onEditScript: (script: Script) => void;
    onNavigate: (page: 'dashboard' | 'library' | 'editor') => void;
}

export function Dashboard({ onNewScript, onEditScript, onNavigate }: DashboardProps) {
    const [scripts, setScripts] = useState<Script[]>([]);

    useEffect(() => {
        setScripts(storage.getScripts());
    }, []);

    const categoryColors = {
        clinical: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        research: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        business: 'bg-green-500/10 text-green-400 border-green-500/20',
        patient: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        universal: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    const stats = {
        total: scripts.length,
        recent: scripts.filter(s => Date.now() - s.updatedAt < 7 * 24 * 60 * 60 * 1000).length,
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">Dashboard</h1>
                        <p className="text-gray-400">Your viral content command center</p>
                    </div>
                    <button
                        onClick={() => onNavigate('library')}
                        className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg font-medium transition-all"
                    >
                        📚 Hook Library
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-brand-400" size={24} />
                        <h3 className="text-gray-400 text-sm font-medium">Total Scripts</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{stats.total}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-green-400" size={24} />
                        <h3 className="text-gray-400 text-sm font-medium">This Week</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{stats.recent}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl font-semibold text-purple-400">🎯 Retention Master</p>
                        <p className="text-xs text-gray-500 mt-1">Keep crafting viral hooks!</p>
                    </div>
                </div>
            </div>

            {/* CTA / Scripts List */}
            {scripts.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="text-brand-400" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">
                            Ready to create your first viral script?
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Start with a proven hook template or let AI generate ideas for you.
                        </p>
                        <button
                            onClick={onNewScript}
                            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Create First Script
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-100">Recent Scripts</h2>
                        <button
                            onClick={onNewScript}
                            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            New Script
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scripts.map((script) => (
                            <button
                                key={script.id}
                                onClick={() => onEditScript(script)}
                                className="bg-gray-900 border border-gray-800 hover:border-brand-500/50 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-brand-500/10 group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${categoryColors[script.category]}`}>
                                        {script.category}
                                    </span>
                                    <span className="text-xs text-gray-500">{formatDate(script.updatedAt)}</span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-brand-400 transition-colors line-clamp-1">
                                    {script.title || 'Untitled Script'}
                                </h3>

                                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                    {script.hook || 'No hook yet...'}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <FileText size={14} />
                                    <span>{script.topic || 'No topic'}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

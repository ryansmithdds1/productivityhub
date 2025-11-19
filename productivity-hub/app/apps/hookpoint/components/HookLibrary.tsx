import { useState } from 'react';
import { Filter, Sparkles } from 'lucide-react';
import { hookTemplates } from '../data/hooks';
import type { ScriptCategory } from '../types';
import { cn } from '../lib/utils';

interface HookLibraryProps {
    onSelectHook: (hookText: string, category: ScriptCategory) => void;
    onBack: () => void;
}

export function HookLibrary({ onSelectHook, onBack }: HookLibraryProps) {
    const [selectedCategory, setSelectedCategory] = useState<ScriptCategory | 'all'>('all');

    const categories: { value: ScriptCategory | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'clinical', label: 'Clinical' },
        { value: 'research', label: 'Research' },
        { value: 'business', label: 'Business' },
        { value: 'patient', label: 'Patient' },
        { value: 'universal', label: 'Universal' },
    ];

    const filteredHooks = selectedCategory === 'all'
        ? hookTemplates
        : hookTemplates.filter(hook => hook.category.includes(selectedCategory));

    const highlightBrackets = (text: string) => {
        const parts = text.split(/(\[.*?\])/g);
        return parts.map((part, i) => {
            if (part.startsWith('[') && part.endsWith(']')) {
                return (
                    <span key={i} className="text-brand-400 font-semibold">
                        {part}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="text-brand-400" size={32} />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Hook Library</h1>
                </div>
                <p className="text-gray-400">
                    Proven psychological patterns to grab attention in the first 3 seconds
                </p>
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-gray-400">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filter:</span>
                </div>
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            selectedCategory === cat.value
                                ? 'bg-brand-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Hook Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHooks.map((hook) => (
                    <div
                        key={hook.id}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-brand-500/50 transition-all group"
                    >
                        <div className="mb-4">
                            <p className="text-lg text-gray-100 leading-relaxed">
                                {highlightBrackets(hook.text)}
                            </p>
                        </div>

                        <div className="mb-4 p-4 bg-gray-950/50 border border-gray-800 rounded-lg">
                            <p className="text-sm text-gray-400 leading-relaxed">
                                <span className="text-brand-400 font-semibold">Why it works:</span> {hook.explanation}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {hook.category.map((cat) => (
                                    <span
                                        key={cat}
                                        className="px-2 py-1 text-xs font-medium bg-gray-800 text-gray-400 rounded-full"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>

                            <button
                                onClick={() => onSelectHook(hook.text, hook.category[0])}
                                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                Use this Hook
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredHooks.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No hooks found for this category.</p>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Sparkles } from 'lucide-react';

const TEMPLATES = [
    // Negative / Warning
    { id: 'neg1', text: "Stop doing {topic} if you want to {result}", type: 'Negative' },
    { id: 'neg2', text: "The biggest mistake people make with {topic}...", type: 'Negative' },
    { id: 'neg3', text: "Why your {topic} is failing (and how to fix it)", type: 'Negative' },
    { id: 'neg4', text: "Don't buy {topic} until you watch this", type: 'Negative' },

    // Listicle
    { id: 'list1', text: "3 secrets to master {topic} in 2024", type: 'Listicle' },
    { id: 'list2', text: "5 tools for {topic} you didn't know existed", type: 'Listicle' },
    { id: 'list3', text: "The top 1% of people do this with {topic}...", type: 'Listicle' },
    { id: 'list4', text: "7 {topic} hacks that feel illegal to know", type: 'Listicle' },

    // Story / Personal
    { id: 'story1', text: "How I mastered {topic} in just 30 days", type: 'Story' },
    { id: 'story2', text: "I tried {topic} for a week, here's what happened", type: 'Story' },
    { id: 'story3', text: "The truth about {topic} no one tells you", type: 'Story' },

    // How-to / Educational
    { id: 'edu1', text: "The ultimate guide to {topic} for beginners", type: 'Educational' },
    { id: 'edu2', text: "How to {result} using {topic}", type: 'Educational' },
    { id: 'edu3', text: "What is {topic} and why does it matter?", type: 'Educational' },
];

interface HookGeneratorProps {
    topic: string;
    result: string;
}

export function HookGenerator({ topic, result }: HookGeneratorProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('All');

    const generateHook = (template: string) => {
        return template
            .replace(/{topic}/g, topic || '[Topic]')
            .replace(/{result}/g, result || '[Result]');
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredTemplates = filter === 'All'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.type === filter);

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-500" />
                    Viral Hooks
                </h3>
                <div className="flex gap-2">
                    {['All', 'Negative', 'Listicle', 'Story', 'Educational'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredTemplates.map(template => {
                    const hook = generateHook(template.text);
                    return (
                        <div
                            key={template.id}
                            className="group flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800 rounded-lg hover:border-blue-500/50 hover:bg-gray-800/50 transition-all"
                        >
                            <p className="text-gray-200 font-medium">{hook}</p>
                            <button
                                onClick={() => handleCopy(hook, template.id)}
                                className="p-2 text-gray-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Copy to clipboard"
                            >
                                {copiedId === template.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

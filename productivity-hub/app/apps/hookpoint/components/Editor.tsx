import { useState } from 'react';
import { Save, Sparkles, Wand2, ArrowLeft, Trash2, Play, Check, Loader2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { GeminiService } from '../lib/gemini';
import { estimateDuration, cn } from '../lib/utils';
import type { Script, ScriptCategory, AIScriptSuggestion } from '../types';

interface EditorProps {
    script?: Script;
    initialHook?: string;
    initialCategory?: ScriptCategory;
    onBack: () => void;
    onSaved: () => void;
}

const bestPractices = [
    'Start mid-sentence or with a bold statement',
    'Trim all unnecessary intros',
    'Use first-person perspective',
    'Include a curiosity gap',
    'Add visual variety every 2-3 seconds',
    'End with a specific, actionable CTA',
];

export function Editor({ script, initialHook, initialCategory, onBack, onSaved }: EditorProps) {
    const [title, setTitle] = useState(script?.title || '');
    const [topic, setTopic] = useState(script?.topic || '');
    const [category, setCategory] = useState<ScriptCategory>(script?.category || initialCategory || 'universal');
    const [hook, setHook] = useState(script?.hook || initialHook || '');
    const [body, setBody] = useState(script?.body || '');
    const [cta, setCta] = useState(script?.cta || '');
    const [visuals, setVisuals] = useState(script?.visuals || '');
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
    const [teleprompterMode, setTeleprompterMode] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AIScriptSuggestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);
    const [saved, setSaved] = useState(false);

    const geminiService = new GeminiService(storage.getApiKey());

    const handleSave = async () => {
        const scriptData: Script = {
            id: script?.id || `script-${Date.now()}`,
            title,
            topic,
            category,
            hook,
            body,
            cta,
            visuals,
            createdAt: script?.createdAt || Date.now(),
            updatedAt: Date.now(),
        };

        await storage.saveScript(scriptData);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onSaved();
        }, 1500);
    };

    const handleDelete = async () => {
        if (script && confirm('Delete this script?')) {
            await storage.deleteScript(script.id);
            onBack();
        }
    };

    const handleGenerateIdeas = async () => {
        if (!topic.trim()) {
            alert('Please enter a topic first');
            return;
        }

        if (!geminiService.isReady()) {
            alert('Please add your API key in Settings first');
            return;
        }

        setIsGenerating(true);
        try {
            const suggestions = await geminiService.generateScriptIdeas(topic, category);
            setAiSuggestions(suggestions);
        } catch (error: any) {
            alert(error.message || 'Failed to generate ideas');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectSuggestion = (suggestion: AIScriptSuggestion) => {
        setHook(suggestion.hook);
        setBody(suggestion.body);
        setCta(suggestion.cta);
        setVisuals(suggestion.visuals);
        setAiSuggestions([]);
    };

    const handlePolishBody = async () => {
        if (!body.trim()) {
            alert('Please write some body content first');
            return;
        }

        if (!geminiService.isReady()) {
            alert('Please add your API key in Settings first');
            return;
        }

        setIsPolishing(true);
        try {
            const polished = await geminiService.polishScript(body);
            setBody(polished);
        } catch (error: any) {
            alert(error.message || 'Failed to polish script');
        } finally {
            setIsPolishing(false);
        }
    };

    const toggleChecklist = (index: number) => {
        const newSet = new Set(checkedItems);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setCheckedItems(newSet);
    };

    const hookDuration = estimateDuration(hook);
    const totalWords = [hook, body, cta].join(' ').trim().split(/\s+/).filter(Boolean).length;
    const estimatedTotalDuration = Math.round(totalWords / 2.5);

    if (teleprompterMode) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8">
                <button
                    onClick={() => setTeleprompterMode(false)}
                    className="absolute top-4 right-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    Exit Teleprompter
                </button>

                <div className="max-w-4xl w-full space-y-12 text-center overflow-y-auto scrollbar-hide">
                    {hook && (
                        <div className="animate-fade-in">
                            <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Hook (0-3s)</p>
                            <p className="text-4xl md:text-5xl leading-relaxed text-white font-medium">
                                {hook}
                            </p>
                        </div>
                    )}

                    {body && (
                        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Body</p>
                            <p className="text-3xl md:text-4xl leading-relaxed text-gray-100">
                                {body}
                            </p>
                        </div>
                    )}

                    {cta && (
                        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Call to Action</p>
                            <p className="text-4xl md:text-5xl leading-relaxed text-white font-semibold">
                                {cta}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-3">
                    {script && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setTeleprompterMode(true)}
                        className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg font-medium transition-all inline-flex items-center gap-2"
                    >
                        <Play size={18} />
                        Teleprompter
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saved}
                        className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2 disabled:bg-green-600"
                    >
                        {saved ? (
                            <>
                                <Check size={18} />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Metadata */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-100 mb-4">Script Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="My Viral Script"
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Topic</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Root Canals, Productivity Hacks"
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ScriptCategory)}
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                >
                                    <option value="clinical">Clinical</option>
                                    <option value="research">Research</option>
                                    <option value="business">Business</option>
                                    <option value="patient">Patient</option>
                                    <option value="universal">Universal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* AI Generation */}
                    <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-brand-400" size={24} />
                            <h2 className="text-lg font-semibold text-gray-100">AI Script Generator</h2>
                        </div>

                        <p className="text-sm text-gray-400 mb-4">
                            Enter a topic above, then click to get 3 AI-generated script concepts
                        </p>

                        <button
                            onClick={handleGenerateIdeas}
                            disabled={isGenerating || !topic.trim()}
                            className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Generating Ideas...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Ask AI for Ideas
                                </>
                            )}
                        </button>

                        {aiSuggestions.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {aiSuggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectSuggestion(suggestion)}
                                        className="w-full text-left p-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-brand-500 rounded-lg transition-all"
                                    >
                                        <p className="text-sm font-semibold text-brand-400 mb-1">Option {idx + 1}</p>
                                        <p className="text-sm text-gray-300 line-clamp-2">{suggestion.hook}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Script Sections */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-100 mb-4">The Script</h2>

                        <div className="space-y-6">
                            {/* Hook */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        The Hook <span className="text-brand-400">(0-3 seconds)</span>
                                    </label>
                                    <span className={cn(
                                        "text-xs font-mono px-2 py-1 rounded",
                                        hookDuration <= 3 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                    )}>
                                        ~{hookDuration}s
                                    </span>
                                </div>
                                <textarea
                                    value={hook}
                                    onChange={(e) => setHook(e.target.value)}
                                    placeholder="Most people don't realize..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-300">
                                        The Body <span className="text-gray-500">(Value Delivery)</span>
                                    </label>
                                    <button
                                        onClick={handlePolishBody}
                                        disabled={isPolishing || !body.trim()}
                                        className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 disabled:bg-gray-800 text-purple-400 disabled:text-gray-600 text-xs rounded-lg transition-all inline-flex items-center gap-1"
                                    >
                                        {isPolishing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={12} />
                                                Polishing...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={12} />
                                                Polish with AI
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Share your insights here..."
                                    rows={8}
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* CTA */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Call to Action
                                </label>
                                <input
                                    type="text"
                                    value={cta}
                                    onChange={(e) => setCta(e.target.value)}
                                    placeholder="Follow for more tips like this!"
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                />
                            </div>

                            {/* Visuals */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Visual Notes
                                </label>
                                <textarea
                                    value={visuals}
                                    onChange={(e) => setVisuals(e.target.value)}
                                    placeholder="B-roll ideas, camera angles, text overlays..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                            <span>Total Words: {totalWords}</span>
                            <span>Estimated Duration: ~{estimatedTotalDuration}s</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Best Practices Checklist */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">Best Practices</h3>
                        <div className="space-y-3">
                            {bestPractices.map((practice, idx) => (
                                <label
                                    key={idx}
                                    className="flex items-start gap-3 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checkedItems.has(idx)}
                                        onChange={() => toggleChecklist(idx)}
                                        className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-950 text-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className={cn(
                                        "text-sm transition-colors",
                                        checkedItems.has(idx) ? "text-gray-500 line-through" : "text-gray-300 group-hover:text-gray-100"
                                    )}>
                                        {practice}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Script Health</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Hook Length</span>
                                <span className={hookDuration <= 3 ? "text-green-400" : "text-red-400"}>
                                    {hookDuration <= 3 ? '✓ Good' : '✗ Too Long'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Has CTA</span>
                                <span className={cta.trim() ? "text-green-400" : "text-gray-600"}>
                                    {cta.trim() ? '✓ Yes' : '✗ No'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Visuals Noted</span>
                                <span className={visuals.trim() ? "text-green-400" : "text-gray-600"}>
                                    {visuals.trim() ? '✓ Yes' : '✗ No'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

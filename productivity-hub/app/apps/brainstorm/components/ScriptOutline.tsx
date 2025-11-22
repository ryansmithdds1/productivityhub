'use client';

import { FileText, ArrowRight } from 'lucide-react';

interface ScriptOutlineProps {
    topic: string;
    result: string;
}

export function ScriptOutline({ topic, result }: ScriptOutlineProps) {
    const t = topic || '[Topic]';
    const r = result || '[Result]';

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 h-full">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <FileText size={20} className="text-purple-500" />
                Script Structure
            </h3>

            <div className="space-y-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-gray-800" />

                {/* Step 1: The Hook */}
                <div className="relative flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0 z-10 border border-gray-900">
                        1
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-1">The Hook</h4>
                        <p className="text-gray-300 text-sm">
                            State the problem or bold claim immediately.
                            <br />
                            <span className="text-gray-500 italic">"Stop doing {t} if you want {r}..."</span>
                        </p>
                    </div>
                </div>

                {/* Step 2: The Value */}
                <div className="relative flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0 z-10 border border-gray-900">
                        2
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-1">The Value</h4>
                        <p className="text-gray-300 text-sm">
                            Explain WHY this is true. Give 3 quick tips or a story.
                            <br />
                            <span className="text-gray-500 italic">"Here are 3 reasons why {t} is holding you back..."</span>
                        </p>
                    </div>
                </div>

                {/* Step 3: The CTA */}
                <div className="relative flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold shrink-0 z-10 border border-gray-900">
                        3
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-1">The CTA</h4>
                        <p className="text-gray-300 text-sm">
                            Tell them exactly what to do next.
                            <br />
                            <span className="text-gray-500 italic">"Comment '{t}' below and I'll send you my free guide."</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                    <ArrowRight className="text-blue-400 mt-1 shrink-0" size={18} />
                    <p className="text-sm text-blue-200">
                        <strong>Pro Tip:</strong> Keep the middle section under 45 seconds for maximum retention on Shorts/Reels.
                    </p>
                </div>
            </div>
        </div>
    );
}

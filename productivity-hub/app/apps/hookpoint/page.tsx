'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Dashboard } from './components/Dashboard';
import { HookLibrary } from './components/HookLibrary';
import { Editor } from './components/Editor';
import { SettingsModal } from './components/shared/SettingsModal';
import type { Script, ScriptCategory } from './types';

type Page = 'dashboard' | 'library' | 'editor';

export default function HookPointApp() {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [currentScript, setCurrentScript] = useState<Script | undefined>();
    const [initialHook, setInitialHook] = useState<string | undefined>();
    const [initialCategory, setInitialCategory] = useState<ScriptCategory | undefined>();

    const handleNewScript = () => {
        setCurrentScript(undefined);
        setInitialHook(undefined);
        setInitialCategory(undefined);
        setCurrentPage('editor');
    };

    const handleEditScript = (script: Script) => {
        setCurrentScript(script);
        setInitialHook(undefined);
        setInitialCategory(undefined);
        setCurrentPage('editor');
    };

    const handleSelectHook = (hookText: string, category: ScriptCategory) => {
        setCurrentScript(undefined);
        setInitialHook(hookText);
        setInitialCategory(category);
        setCurrentPage('editor');
    };

    const handleBackFromEditor = () => {
        setCurrentScript(undefined);
        setInitialHook(undefined);
        setInitialCategory(undefined);
        setCurrentPage('dashboard');
    };

    const handleSaved = () => {
        // Refresh happens automatically when navigating back
    };

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header with back to hub */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to Hub</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-700" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                            HookPoint
                        </h1>
                    </div>

                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        Settings
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div>
                {currentPage === 'dashboard' && (
                    <Dashboard
                        onNewScript={handleNewScript}
                        onEditScript={handleEditScript}
                        onNavigate={setCurrentPage}
                    />
                )}

                {currentPage === 'library' && (
                    <HookLibrary
                        onSelectHook={handleSelectHook}
                        onBack={() => setCurrentPage('dashboard')}
                    />
                )}

                {currentPage === 'editor' && (
                    <Editor
                        script={currentScript}
                        initialHook={initialHook}
                        initialCategory={initialCategory}
                        onBack={handleBackFromEditor}
                        onSaved={handleSaved}
                    />
                )}
            </div>

            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </div>
    );
}

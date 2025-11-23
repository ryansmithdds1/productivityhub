'use client';

import { useState } from 'react';

import { Zap } from 'lucide-react';
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
        <>
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Zap className="text-purple-400" size={24} />
                            <h1 className="text-2xl font-bold text-white">
                                Short Video Creator
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">AI-powered viral script creator</p>
                    </div>

                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
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
        </>
    );
}

import { useState } from 'react';
import { Layout } from './components/Layout';
import { SettingsModal } from './components/SettingsModal';
import { Dashboard } from './pages/Dashboard';
import { HookLibrary } from './pages/HookLibrary';
import { Editor } from './pages/Editor';
import type { Script, ScriptCategory } from './types';

type Page = 'dashboard' | 'library' | 'editor';

function App() {
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
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenSettings={() => setSettingsOpen(true)}
      >
        {currentPage === 'dashboard' && (
          <Dashboard
            onNewScript={handleNewScript}
            onEditScript={handleEditScript}
          />
        )}

        {currentPage === 'library' && (
          <HookLibrary onSelectHook={handleSelectHook} />
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
      </Layout>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

export default App;

import { useState } from 'react';
import { Key, Check, AlertCircle, Download, Upload, Trash2, Loader2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { YouTubeAPI } from '../lib/youtube';

interface SettingsProps {
    onApiKeyChange: (apiKey: string) => void;
}

export function Settings({ onApiKeyChange }: SettingsProps) {
    const [apiKey, setApiKey] = useState(storage.getApiKey());
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [showKey, setShowKey] = useState(false);

    const handleValidate = async () => {
        if (!apiKey.trim()) return;

        setIsValidating(true);
        setValidationStatus('idle');

        try {
            const api = new YouTubeAPI(apiKey.trim());
            const isValid = await api.validateApiKey();

            if (isValid) {
                setValidationStatus('valid');
                storage.saveApiKey(apiKey.trim());
                onApiKeyChange(apiKey.trim());
            } else {
                setValidationStatus('invalid');
            }
        } catch {
            setValidationStatus('invalid');
        } finally {
            setIsValidating(false);
        }
    };

    const handleClearHistory = async () => {
        if (confirm('Clear all search history?')) {
            await storage.clearSearchHistory();
            alert('Search history cleared');
        }
    };

    const handleExportBookmarks = async () => {
        const json = await storage.exportBookmarks();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube-research-bookmarks-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportBookmarks = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            await storage.importBookmarks(text);
            alert('Bookmarks imported successfully');
        } catch {
            alert('Failed to import bookmarks. Please check the file format.');
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            {/* API Key Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Key className="text-red-400" size={24} />
                    <h2 className="text-lg font-semibold text-gray-100">YouTube API Key</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            API Key
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        setValidationStatus('idle');
                                    }}
                                    placeholder="AIzaSy..."
                                    className="w-full px-4 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                {validationStatus !== 'idle' && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {validationStatus === 'valid' ? (
                                            <Check className="text-green-400" size={20} />
                                        ) : (
                                            <AlertCircle className="text-red-400" size={20} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-all"
                            >
                                {showKey ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {validationStatus === 'invalid' && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-400">
                                Invalid API key. Please check your key and try again.
                            </p>
                        </div>
                    )}

                    {validationStatus === 'valid' && (
                        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <Check className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-green-400">
                                API key validated successfully!
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleValidate}
                        disabled={isValidating || !apiKey.trim()}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Validating...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Validate API Key
                            </>
                        )}
                    </button>

                    <div className="pt-4 border-t border-gray-800">
                        <p className="text-sm text-gray-400 mb-2">
                            <strong>How to get an API key:</strong>
                        </p>
                        <ol className="text-sm text-gray-500 space-y-1 list-decimal list-inside">
                            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Google Cloud Console</a></li>
                            <li>Create a new project or select an existing one</li>
                            <li>Enable the YouTube Data API v3</li>
                            <li>Create credentials (API key)</li>
                            <li>Copy and paste the key above</li>
                        </ol>
                        <p className="text-xs text-gray-600 mt-2">
                            Free tier: 10,000 quota units/day (sufficient for hundreds of searches)
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Data Management</h2>

                <div className="space-y-3">
                    {/* Export Bookmarks */}
                    <button
                        onClick={handleExportBookmarks}
                        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-all inline-flex items-center gap-3"
                    >
                        <Download size={18} />
                        <span className="flex-1 text-left">Export Bookmarks</span>
                    </button>

                    {/* Import Bookmarks */}
                    <label className="block">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportBookmarks}
                            className="hidden"
                        />
                        <div className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-all inline-flex items-center gap-3 cursor-pointer">
                            <Upload size={18} />
                            <span className="flex-1 text-left">Import Bookmarks</span>
                        </div>
                    </label>

                    {/* Clear Search History */}
                    <button
                        onClick={handleClearHistory}
                        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-all inline-flex items-center gap-3"
                    >
                        <Trash2 size={18} />
                        <span className="flex-1 text-left">Clear Search History</span>
                    </button>
                </div>
            </div>

            {/* Quota Information */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">API Quota Information</h3>
                <p className="text-sm text-gray-400">
                    Each search uses approximately 100 quota units. With the free tier limit of 10,000 units/day,
                    you can perform about 100 searches per day. The quota resets at midnight Pacific Time.
                </p>
            </div>
        </div>
    );
}

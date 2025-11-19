import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { storage } from '../lib/storage';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [apiKey, setApiKey] = useState(storage.getApiKey() || '');
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        storage.saveApiKey(apiKey);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-lg w-full shadow-2xl animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-100">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Google Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key..."
                            className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Get your API key from{' '}
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-400 hover:text-brand-300 underline"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>

                    <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Privacy Notice</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Your API key is stored locally in your browser and never sent to any third-party servers
                            except Google's Gemini API when you use AI features.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saved}
                        className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:bg-green-600"
                    >
                        {saved ? (
                            <>✓ Saved</>
                        ) : (
                            <>
                                <Save size={16} />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

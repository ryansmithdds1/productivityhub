'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, Bookmark, Settings as SettingsIcon, Youtube, TrendingUp, AlertCircle } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { VideoGrid } from './components/VideoGrid';
import { SavedVideos } from './components/SavedVideos';
import { Settings } from './components/Settings';
import { YouTubeAPI } from './lib/youtube';
import { storage } from './lib/storage';
import type { YouTubeVideo, SavedVideo, SearchFilters, SortOption } from './types';

type Tab = 'search' | 'saved' | 'settings';

export default function YouTubeResearchApp() {
    const [activeTab, setActiveTab] = useState<Tab>('search');
    const [apiKey, setApiKey] = useState('');
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [currentSort, setCurrentSort] = useState<SortOption>('viewsPerDay');
    const [lastQuery, setLastQuery] = useState('');
    const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const key = storage.getApiKey();
        setApiKey(key);

        const bookmarks = await storage.getBookmarks();
        setSavedVideos(bookmarks);
        setBookmarkedIds(new Set(bookmarks.map(v => v.id)));

        const history = await storage.getSearchHistory();
        setRecentSearches(history.map(h => h.query));

        // If no API key, show settings
        if (!key) {
            setActiveTab('settings');
        }
    };

    const handleSearch = async (query: string, filters: SearchFilters) => {
        if (!apiKey) {
            setError('Please add your YouTube API key in Settings first');
            setActiveTab('settings');
            return;
        }

        setIsLoading(true);
        setError(null);
        setLastQuery(query);
        setLastFilters(filters);

        try {
            const api = new YouTubeAPI(apiKey);
            const results = await api.searchVideos(query, filters);
            setVideos(results);
            setCurrentSort(filters.sortBy);

            // Save to search history
            await storage.saveSearchHistory({
                query,
                timestamp: Date.now(),
                filters,
            });

            // Update recent searches
            const history = await storage.getSearchHistory();
            setRecentSearches(history.map(h => h.query));

            // Switch to search tab if on another tab
            if (activeTab !== 'search') {
                setActiveTab('search');
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.message || 'Failed to search videos. Please check your API key and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle format filter changes - auto-fetch more results
    const handleFormatFilterChange = async (filter: 'all' | 'shorts' | 'long') => {
        if (!lastQuery || !lastFilters || filter === 'all') return;

        // When filtering by format, fetch 2x maxResults to get enough videos after filtering
        const increasedFilters = {
            ...lastFilters,
            maxResults: Math.min(lastFilters.maxResults * 2, 50), // Cap at 50 (YouTube API limit)
        };

        await handleSearch(lastQuery, increasedFilters);
    };

    const handleToggleBookmark = async (video: YouTubeVideo) => {
        const isCurrentlyBookmarked = bookmarkedIds.has(video.id);

        if (isCurrentlyBookmarked) {
            // Remove bookmark
            await storage.deleteBookmark(video.id);
            const updated = savedVideos.filter(v => v.id !== video.id);
            setSavedVideos(updated);
            setBookmarkedIds(new Set(updated.map(v => v.id)));
        } else {
            // Add bookmark
            const savedVideo: SavedVideo = {
                ...video,
                savedAt: Date.now(),
            };
            await storage.saveBookmark(savedVideo);
            const updated = [savedVideo, ...savedVideos];
            setSavedVideos(updated);
            setBookmarkedIds(new Set(updated.map(v => v.id)));
        }
    };

    const handleDeleteBookmark = async (videoId: string) => {
        await storage.deleteBookmark(videoId);
        const updated = savedVideos.filter(v => v.id !== videoId);
        setSavedVideos(updated);
        setBookmarkedIds(new Set(updated.map(v => v.id)));
    };

    const handleUpdateNotes = async (videoId: string, notes: string) => {
        await storage.updateBookmarkNotes(videoId, notes);
        const updated = savedVideos.map(v =>
            v.id === videoId ? { ...v, notes } : v
        );
        setSavedVideos(updated);
    };

    const handleUpdateTags = async (videoId: string, tags: string[]) => {
        await storage.updateBookmarkTags(videoId, tags);
        const updated = savedVideos.map(v =>
            v.id === videoId ? { ...v, tags } : v
        );
        setSavedVideos(updated);
    };

    const handleApiKeyChange = (newApiKey: string) => {
        setApiKey(newApiKey);
    };

    return (
        <>
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        <Youtube className="text-red-400" size={24} />
                        <h1 className="text-2xl font-bold text-white">
                            YouTube Research
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                        Find high-performing videos to replicate and improve
                    </p>
                </div>

                {/* Tabs */}
                <div className="px-8 flex gap-1 border-t border-gray-800">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-4 py-3 font-medium transition-all relative ${activeTab === 'search'
                            ? 'text-red-400'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <SearchIcon size={18} />
                            Search
                        </div>
                        {activeTab === 'search' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-3 font-medium transition-all relative ${activeTab === 'saved'
                            ? 'text-red-400'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Bookmark size={18} />
                            Saved ({savedVideos.length})
                        </div>
                        {activeTab === 'saved' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-3 font-medium transition-all relative ${activeTab === 'settings'
                            ? 'text-red-400'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <SettingsIcon size={18} />
                            Settings
                        </div>
                        {activeTab === 'settings' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
                {/* API Key Warning */}
                {!apiKey && activeTab !== 'settings' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-red-400 font-medium">YouTube API Key Required</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Please add your YouTube API key in Settings to start searching.
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all"
                        >
                            Go to Settings
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-red-400">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-300"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <div className="space-y-6">
                        <SearchBar
                            onSearch={handleSearch}
                            isLoading={isLoading}
                            recentSearches={recentSearches}
                        />

                        {videos.length > 0 && (
                            <VideoGrid
                                videos={videos}
                                isLoading={isLoading}
                                sortBy={currentSort}
                                onSortChange={setCurrentSort}
                                bookmarkedIds={bookmarkedIds}
                                onToggleBookmark={handleToggleBookmark}
                                onFormatFilterChange={handleFormatFilterChange}
                            />
                        )}

                        {!isLoading && videos.length === 0 && lastQuery && (
                            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
                                <TrendingUp className="mx-auto text-gray-600 mb-4" size={48} />
                                <p className="text-gray-400 text-lg">No results found for "{lastQuery}"</p>
                                <p className="text-gray-600 text-sm mt-2">
                                    Try different keywords or adjust your filters
                                </p>
                            </div>
                        )}

                        {!isLoading && videos.length === 0 && !lastQuery && (
                            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
                                <SearchIcon className="mx-auto text-gray-600 mb-4" size={48} />
                                <p className="text-gray-400 text-lg">Search for videos to get started</p>
                                <p className="text-gray-600 text-sm mt-2">
                                    Enter keywords or topics to find high-performing videos
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Saved Tab */}
                {activeTab === 'saved' && (
                    <SavedVideos
                        videos={savedVideos}
                        onDelete={handleDeleteBookmark}
                        onUpdateNotes={handleUpdateNotes}
                        onUpdateTags={handleUpdateTags}
                    />
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <Settings onApiKeyChange={handleApiKeyChange} />
                )}
            </div>
        </>
    );
}

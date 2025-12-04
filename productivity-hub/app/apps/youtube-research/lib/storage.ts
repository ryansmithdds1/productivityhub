import type { SavedVideo, SearchHistoryItem, AppSettings } from '../types';

const STORAGE_KEYS = {
    API_KEY: 'youtube-research-api-key',
    BOOKMARKS: 'youtube-research-bookmarks',
    SEARCH_HISTORY: 'youtube-research-search-history',
    SETTINGS: 'youtube-research-settings',
} as const;

// Simple encoding (not encryption, just obfuscation)
function encode(str: string): string {
    return btoa(str);
}

function decode(str: string): string {
    try {
        return atob(str);
    } catch {
        return '';
    }
}

class Storage {
    // API Key Management
    saveApiKey(apiKey: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.API_KEY, encode(apiKey));
    }

    getApiKey(): string {
        if (typeof window === 'undefined') return '';
        const encoded = localStorage.getItem(STORAGE_KEYS.API_KEY);
        return encoded ? decode(encoded) : '';
    }

    clearApiKey(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }

    // Bookmarks Management
    async saveBookmark(video: SavedVideo): Promise<void> {
        if (typeof window === 'undefined') return;
        const bookmarks = await this.getBookmarks();
        const existingIndex = bookmarks.findIndex(b => b.id === video.id);

        if (existingIndex >= 0) {
            bookmarks[existingIndex] = video;
        } else {
            bookmarks.unshift(video);
        }

        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    }

    async getBookmarks(): Promise<SavedVideo[]> {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        return data ? JSON.parse(data) : [];
    }

    async deleteBookmark(videoId: string): Promise<void> {
        if (typeof window === 'undefined') return;
        const bookmarks = await this.getBookmarks();
        const filtered = bookmarks.filter(b => b.id !== videoId);
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
    }

    async isBookmarked(videoId: string): Promise<boolean> {
        const bookmarks = await this.getBookmarks();
        return bookmarks.some(b => b.id === videoId);
    }

    async updateBookmarkNotes(videoId: string, notes: string): Promise<void> {
        if (typeof window === 'undefined') return;
        const bookmarks = await this.getBookmarks();
        const bookmark = bookmarks.find(b => b.id === videoId);
        if (bookmark) {
            bookmark.notes = notes;
            localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        }
    }

    async updateBookmarkTags(videoId: string, tags: string[]): Promise<void> {
        if (typeof window === 'undefined') return;
        const bookmarks = await this.getBookmarks();
        const bookmark = bookmarks.find(b => b.id === videoId);
        if (bookmark) {
            bookmark.tags = tags;
            localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        }
    }

    // Search History Management
    async saveSearchHistory(item: SearchHistoryItem): Promise<void> {
        if (typeof window === 'undefined') return;
        const history = await this.getSearchHistory();

        // Remove duplicate queries
        const filtered = history.filter(h => h.query.toLowerCase() !== item.query.toLowerCase());

        // Add new item at the start
        filtered.unshift(item);

        // Keep only last 50 searches
        const trimmed = filtered.slice(0, 50);

        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(trimmed));
    }

    async getSearchHistory(): Promise<SearchHistoryItem[]> {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        return data ? JSON.parse(data) : [];
    }

    async clearSearchHistory(): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    }

    // Settings Management
    saveSettings(settings: AppSettings): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    getSettings(): AppSettings | null {
        if (typeof window === 'undefined') return null;
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
    }

    // Export/Import
    async exportBookmarks(): Promise<string> {
        const bookmarks = await this.getBookmarks();
        return JSON.stringify(bookmarks, null, 2);
    }

    async importBookmarks(jsonString: string): Promise<void> {
        if (typeof window === 'undefined') return;
        try {
            const imported = JSON.parse(jsonString) as SavedVideo[];
            const existing = await this.getBookmarks();

            // Merge, preferring imported data for duplicates
            const merged = [...imported];
            existing.forEach(video => {
                if (!merged.some(v => v.id === video.id)) {
                    merged.push(video);
                }
            });

            localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(merged));
        } catch (error) {
            throw new Error('Invalid bookmark data');
        }
    }

    // Clear all data
    clearAll(): void {
        if (typeof window === 'undefined') return;
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

export const storage = new Storage();

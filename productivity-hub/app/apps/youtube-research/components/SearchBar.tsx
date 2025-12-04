import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { SearchFilters, DurationFilter, SortOption } from '../types';

interface SearchBarProps {
    onSearch: (query: string, filters: SearchFilters) => void;
    isLoading: boolean;
    recentSearches: string[];
}

export function SearchBar({ onSearch, isLoading, recentSearches }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [filters, setFilters] = useState<SearchFilters>({
        sortBy: 'relevance',
        duration: 'any',
        maxResults: 25,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim(), filters);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        onSearch(suggestion, filters);
    };

    const filteredSuggestions = recentSearches.filter(s =>
        s.toLowerCase().includes(query.toLowerCase()) && s !== query
    ).slice(0, 5);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Search for video topics or keywords..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Search Suggestions */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowSuggestions(false)}
                            />
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                {filteredSuggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors"
                                    >
                                        <Search className="inline mr-2" size={14} />
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                    >
                        <Search size={18} />
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 ${showFilters
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                            }`}
                    >
                        <SlidersHorizontal size={18} />
                        Filters
                    </button>

                    <div className="flex-1" />

                    <div className="text-sm text-gray-500">
                        Max results: {filters.maxResults}
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SortOption })}
                                className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="viewCount">View Count</option>
                                <option value="date">Upload Date</option>
                            </select>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Duration
                            </label>
                            <select
                                value={filters.duration}
                                onChange={(e) => setFilters({ ...filters, duration: e.target.value as DurationFilter })}
                                className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="any">Any Duration</option>
                                <option value="short">Under 4 min</option>
                                <option value="medium">Over 4 min</option>
                            </select>
                        </div>

                        {/* Min Views */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Min Views
                            </label>
                            <input
                                type="number"
                                value={filters.minViews || ''}
                                onChange={(e) => setFilters({ ...filters, minViews: e.target.value ? parseInt(e.target.value) : undefined })}
                                placeholder="Any"
                                min="0"
                                className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        {/* Max Results */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Max Results
                            </label>
                            <select
                                value={filters.maxResults}
                                onChange={(e) => setFilters({ ...filters, maxResults: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        {/* Reset Filters */}
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => setFilters({
                                    sortBy: 'relevance',
                                    duration: 'any',
                                    maxResults: 25,
                                })}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                            >
                                <X size={16} />
                                Reset
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

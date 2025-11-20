'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Table, Grid3x3, ListTodo } from 'lucide-react';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { storage, createDefaultNewsletter } from './lib/storage';
import { getWeekStart, formatWeekRange } from './lib/utils';
import { ProgressBars } from './components/ProgressBars';
import { ContentCard } from './components/ContentCard';
import { BulkAddModal } from './components/BulkAddModal';
import { MonthView } from './components/MonthView';
import { NextUpView } from './components/NextUpView';
import type { Content, Short, YouTubeVideo, Newsletter } from './types';

export default function ContentCalendarApp() {
    const [content, setContent] = useState<Content[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart());
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showBulkAdd, setShowBulkAdd] = useState(false);
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'next-up'>('week');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        const loadedContent = await storage.getContent();
        setContent(loadedContent);
    };

    const weekContent = content.filter(c => {
        const weekEnd = currentWeekStart + (7 * 24 * 60 * 60 * 1000);
        return c.dueDate >= currentWeekStart && c.dueDate < weekEnd;
    });

    const handleUpdate = async (updatedContent: Content) => {
        await storage.saveContent(updatedContent);
        await loadContent();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this content?')) {
            await storage.deleteContent(id);
            await loadContent();
        }
    };

    const handleQuickAdd = async (type: 'short' | 'youtube' | 'newsletter') => {
        let newContent: Content;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);

        switch (type) {
            case 'short':
                newContent = {
                    id: crypto.randomUUID(),
                    type: 'short',
                    title: '',
                    platform: 'tiktok',
                    dueDate: tomorrow.getTime(),
                    status: 'idea',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    checklist: {
                        scriptCreated: false,
                        filmed: false,
                        edited: false,
                        thumbnailCreated: false,
                        descriptionWritten: false,
                        scheduled: false,
                    },
                };
                break;
            case 'youtube':
                newContent = {
                    id: crypto.randomUUID(),
                    type: 'youtube',
                    title: '',
                    dueDate: tomorrow.getTime(),
                    status: 'idea',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    checklist: {
                        scriptCreated: false,
                        filmed: false,
                        edited: false,
                        thumbnailCreated: false,
                        descriptionWritten: false,
                        scheduled: false,
                    },
                };
                break;
            case 'newsletter':
                newContent = createDefaultNewsletter(tomorrow.getTime());
                break;
        }

        await storage.saveContent(newContent);
        await loadContent();
        setShowAddMenu(false);
    };

    const goToPreviousWeek = () => {
        setCurrentWeekStart(prev => prev - (7 * 24 * 60 * 60 * 1000));
    };

    const goToNextWeek = () => {
        setCurrentWeekStart(prev => prev + (7 * 24 * 60 * 60 * 1000));
    };

    const goToCurrentWeek = () => {
        setCurrentWeekStart(getWeekStart());
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const shorts = weekContent.filter(c => c.type === 'short');
    const videos = weekContent.filter(c => c.type === 'youtube');
    const newsletters = weekContent.filter(c => c.type === 'newsletter');

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="text-blue-400" size={24} />
                        <h1 className="text-2xl font-bold text-white">
                            Content Calendar
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Plan and track your content production</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
                {/* View Toggle and Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* View Toggle */}
                        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'week'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'month'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <Grid3x3 size={16} />
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('next-up')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'next-up'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                <ListTodo size={16} />
                                Next Up
                            </button>
                        </div>

                        {/* Week/Month Navigation - Conditional */}
                        {viewMode === 'week' && (
                            <>
                                <button
                                    onClick={goToPreviousWeek}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-100">
                                        {formatWeekRange(currentWeekStart)}
                                    </h2>
                                    <button
                                        onClick={goToCurrentWeek}
                                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Go to current week
                                    </button>
                                </div>
                                <button
                                    onClick={goToNextWeek}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Quick Add */}
                    <div className="relative">
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Content
                        </button>

                        {showAddMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                                <button
                                    onClick={() => {
                                        setShowBulkAdd(true);
                                        setShowAddMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors text-green-400 font-medium border-b border-gray-700 flex items-center gap-2"
                                >
                                    <Table size={18} />
                                    📅 Bulk Planning Mode
                                </button>
                                <button
                                    onClick={() => handleQuickAdd('short')}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors text-purple-400 font-medium"
                                >
                                    + Short
                                </button>
                                <button
                                    onClick={() => handleQuickAdd('youtube')}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors text-red-400 font-medium"
                                >
                                    + YouTube Video
                                </button>
                                <button
                                    onClick={() => handleQuickAdd('newsletter')}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors text-blue-400 font-medium"
                                >
                                    + Newsletter
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bars - Week View Only */}
                {viewMode === 'week' && (
                    <ProgressBars content={content} weekStart={currentWeekStart} />
                )}

                {/* Month View */}
                {viewMode === 'month' ? (
                    <div className="mt-8">
                        <MonthView
                            content={content}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            onPrevMonth={goToPreviousMonth}
                            onNextMonth={goToNextMonth}
                            onDateClick={(date) => {
                                // Switch to week view for that date
                                setCurrentWeekStart(getWeekStart(date));
                                setViewMode('week');
                            }}
                        />
                    </div>
                ) : viewMode === 'next-up' ? (
                    <div className="mt-8">
                        <NextUpView
                            content={content}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    </div>
                ) : (
                    /* Week View - Content Lists */
                    <div className="mt-8 space-y-8">
                        {/* Shorts */}
                        <div>
                            <h3 className="text-lg font-semibold text-purple-400 mb-4">
                                Shorts ({shorts.length}/7)
                            </h3>
                            {shorts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {shorts.map(short => (
                                        <ContentCard
                                            key={short.id}
                                            content={short}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-900 border border-gray-800 rounded-xl">
                                    <p className="text-gray-500">No shorts planned this week</p>
                                </div>
                            )}
                        </div>

                        {/* YouTube Videos */}
                        <div>
                            <h3 className="text-lg font-semibold text-red-400 mb-4">
                                YouTube Videos ({videos.length}/3)
                            </h3>
                            {videos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {videos.map(video => (
                                        <ContentCard
                                            key={video.id}
                                            content={video}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-900 border border-gray-800 rounded-xl">
                                    <p className="text-gray-500">No videos planned this week</p>
                                </div>
                            )}
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-4">
                                Newsletter
                            </h3>
                            {newsletters.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {newsletters.map(newsletter => (
                                        <ContentCard
                                            key={newsletter.id}
                                            content={newsletter}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-900 border border-gray-800 rounded-xl">
                                    <p className="text-gray-500">No newsletter planned this week</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Add Modal */}
            <BulkAddModal
                isOpen={showBulkAdd}
                onClose={() => setShowBulkAdd(false)}
                onSaved={() => {
                    loadContent();
                    setShowBulkAdd(false);
                }}
                weekStart={currentWeekStart}
            />
        </DashboardLayout>
    );
}

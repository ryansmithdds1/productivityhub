import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, getMonthStart } from '../lib/utils';
import type { Content } from '../types';

interface MonthViewProps {
    content: Content[];
    currentMonth: number; // 0-11
    currentYear: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onDateClick: (date: Date) => void;
}

export function MonthView({
    content,
    currentMonth,
    currentYear,
    onPrevMonth,
    onNextMonth,
    onDateClick,
}: MonthViewProps) {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const monthStart = getMonthStart(currentYear, currentMonth);
    const startDayOfWeek = monthStart.getDay(); // 0 = Sunday
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust to Monday = 0

    const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    // Create array of dates for the calendar
    const calendarDates: (number | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < adjustedStartDay; i++) {
        calendarDates.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDates.push(i);
    }

    const getContentForDate = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const dayStart = new Date(date).setHours(0, 0, 0, 0);
        const dayEnd = new Date(date).setHours(23, 59, 59, 999);

        return content.filter(c => c.dueDate >= dayStart && c.dueDate <= dayEnd);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100">{monthName}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onPrevMonth}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={onNextMonth}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-400 pb-2"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar dates */}
                {calendarDates.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const dayContent = getContentForDate(day);
                    const shorts = dayContent.filter(c => c.type === 'short');
                    const videos = dayContent.filter(c => c.type === 'youtube');
                    const newsletters = dayContent.filter(c => c.type === 'newsletter');

                    return (
                        <button
                            key={day}
                            onClick={() => onDateClick(new Date(currentYear, currentMonth, day))}
                            className={`aspect-square p-2 rounded-lg border transition-all hover:border-blue-500/50 flex flex-col items-start ${isToday(day)
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-gray-950 border-gray-800 hover:bg-gray-900'
                                }`}
                        >
                            <div className="text-xs font-medium text-gray-300 mb-1">{day}</div>

                            {dayContent.length > 0 && (
                                <div className="w-full space-y-0.5">
                                    {shorts.length > 0 && (
                                        <div className="text-xs bg-purple-500/20 text-purple-300 rounded px-1 py-0.5 truncate">
                                            {shorts.length} short{shorts.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                    {videos.length > 0 && (
                                        <div className="text-xs bg-red-500/20 text-red-300 rounded px-1 py-0.5 truncate">
                                            {videos.length} video{videos.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                    {newsletters.length > 0 && (
                                        <div className="text-xs bg-blue-500/20 text-blue-300 rounded px-1 py-0.5 truncate">
                                            Newsletter
                                        </div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

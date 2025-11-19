export function getWeekStart(date: Date = new Date()): number {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
}

export function getWeekEnd(weekStart: number): number {
    return weekStart + (7 * 24 * 60 * 60 * 1000) - 1;
}

export function formatWeekRange(weekStart: number): string {
    const start = new Date(weekStart);
    const end = new Date(weekStart + (6 * 24 * 60 * 60 * 1000));

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
}

export function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return new Date(timestamp).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getMonthStart(year: number, month: number): Date {
    return new Date(year, month, 1);
}

export function isToday(timestamp: number): boolean {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

export function isPast(timestamp: number): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return timestamp < today.getTime();
}

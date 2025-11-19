import type { Task, RecurringPattern } from '../types';

export function getStartOfDay(date: Date = new Date()): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

export function getEndOfDay(date: Date = new Date()): number {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
}

export function formatTime(time: string): string {
    // Convert HH:mm to "h:mm AM/PM"
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatTimeBlock(startTime: string, duration: number): string {
    const start = formatTime(startTime);
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    const end = formatTime(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`);
    return `${start} - ${end}`;
}

export function getDayName(timestamp: number): string {
    const d = new Date(timestamp);
    const today = getStartOfDay();
    const tomorrow = getStartOfDay(new Date(today + 24 * 60 * 60 * 1000));

    if (timestamp === today) return 'Today';
    if (timestamp === tomorrow) return 'Tomorrow';

    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function isTaskDueToday(task: Task): boolean {
    const today = getStartOfDay();
    return task.dueDate === today && !task.completed;
}

export function isTaskDueThisWeek(task: Task): boolean {
    const today = getStartOfDay();
    const weekEnd = today + (7 * 24 * 60 * 60 * 1000);
    return task.dueDate >= today && task.dueDate < weekEnd && !task.completed;
}

export function getNextRecurrence(task: Task): number | null {
    if (!task.recurring) return null;

    const { frequency, interval, daysOfWeek, endDate } = task.recurring;
    const now = getStartOfDay();
    let next = task.dueDate;

    while (next <= now) {
        switch (frequency) {
            case 'daily':
                next += interval * 24 * 60 * 60 * 1000;
                break;
            case 'weekly':
                if (daysOfWeek && daysOfWeek.length > 0) {
                    // Find next occurrence on specified days
                    const currentDate = new Date(next);
                    let found = false;
                    for (let i = 1; i <= 7; i++) {
                        currentDate.setDate(currentDate.getDate() + 1);
                        if (daysOfWeek.includes(currentDate.getDay())) {
                            next = getStartOfDay(currentDate);
                            found = true;
                            break;
                        }
                    }
                    if (!found) next += 7 * 24 * 60 * 60 * 1000;
                } else {
                    next += interval * 7 * 24 * 60 * 60 * 1000;
                }
                break;
            case 'monthly':
                const d = new Date(next);
                d.setMonth(d.getMonth() + interval);
                next = getStartOfDay(d);
                break;
        }
    }

    if (endDate && next > endDate) return null;

    return next;
}

export function shouldShowRecurringTask(task: Task): boolean {
    if (!task.recurring) return false;
    const nextDate = getNextRecurrence(task);
    return nextDate !== null && nextDate <= getStartOfDay(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
}

export function getCategoryColor(category: string): string {
    const colors = {
        work: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        personal: 'bg-green-500/20 text-green-400 border-green-500/30',
        content: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        health: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[category as keyof typeof colors] || colors.other;
}

export function getPriorityColor(priority: string): string {
    const colors = {
        high: 'text-red-400',
        medium: 'text-yellow-400',
        low: 'text-gray-400',
    };
    return colors[priority as keyof typeof colors] || colors.low;
}

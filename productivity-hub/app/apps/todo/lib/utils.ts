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

export function isTaskOverdue(task: Task): boolean {
    const today = getStartOfDay();
    return task.dueDate < today && !task.completed;
}

export function isTaskDueThisWeek(task: Task): boolean {
    const today = getStartOfDay();
    const weekEnd = today + (7 * 24 * 60 * 60 * 1000);
    return task.dueDate >= today && task.dueDate < weekEnd && !task.completed;
}

export function getNextRecurrence(task: Task): number | null {
    if (!task.recurring) return null;

    const { frequency, interval, daysOfWeek, seasonalMonths, specificMonth, endDate } = task.recurring;
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
            case 'quarterly':
                // Every 3 months
                const qDate = new Date(next);
                qDate.setMonth(qDate.getMonth() + 3);
                next = getStartOfDay(qDate);
                break;
            case 'bi-annual':
            case 'seasonal':
                // Occurs in specific months (e.g., March & September)
                if (seasonalMonths && seasonalMonths.length > 0) {
                    const currentDate = new Date(next);
                    const currentMonth = currentDate.getMonth(); // 0-11

                    // Find next occurrence in seasonalMonths
                    let found = false;
                    // Sort months to find next occurrence
                    const sortedMonths = [...seasonalMonths].sort((a, b) => a - b);

                    for (const month of sortedMonths) {
                        const monthIndex = month - 1; // Convert 1-12 to 0-11
                        if (monthIndex > currentMonth) {
                            // Same year, later month
                            currentDate.setMonth(monthIndex);
                            currentDate.setDate(1);
                            next = getStartOfDay(currentDate);
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        // Next occurrence is next year, first month in array
                        currentDate.setFullYear(currentDate.getFullYear() + 1);
                        currentDate.setMonth(sortedMonths[0] - 1);
                        currentDate.setDate(1);
                        next = getStartOfDay(currentDate);
                    }
                } else {
                    // Fallback: treat as yearly
                    const aDate = new Date(next);
                    aDate.setFullYear(aDate.getFullYear() + 1);
                    next = getStartOfDay(aDate);
                }
                break;
            case 'annual':
                // Occurs once a year in a specific month
                if (specificMonth) {
                    const annualDate = new Date(next);
                    const currentMonth = annualDate.getMonth(); // 0-11
                    const targetMonth = specificMonth - 1; // Convert 1-12 to 0-11

                    if (targetMonth > currentMonth) {
                        // Same year
                        annualDate.setMonth(targetMonth);
                        annualDate.setDate(1);
                    } else {
                        // Next year
                        annualDate.setFullYear(annualDate.getFullYear() + 1);
                        annualDate.setMonth(targetMonth);
                        annualDate.setDate(1);
                    }
                    next = getStartOfDay(annualDate);
                } else {
                    // Fallback: add one year
                    const aDate = new Date(next);
                    aDate.setFullYear(aDate.getFullYear() + 1);
                    next = getStartOfDay(aDate);
                }
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
        home: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        property: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        farm: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[category as keyof typeof colors] || colors.other;
}

export function getLastCompletedText(task: Task): string | null {
    if (!task.completionHistory || task.completionHistory.length === 0) {
        return null;
    }

    const lastCompleted = task.completionHistory[0];
    const now = Date.now();
    const diff = now - lastCompleted;

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks === 1) return '1 week ago';
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months === 1) return '1 month ago';
    return `${months} months ago`;
}

export function getPriorityColor(priority: string): string {
    const colors = {
        high: 'text-red-400',
        medium: 'text-yellow-400',
        low: 'text-gray-400',
    };
    return colors[priority as keyof typeof colors] || colors.low;
}

export function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return;
    }

    if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

export function scheduleNotification(task: Task) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    // Only schedule if task has a time block
    if (!task.timeBlock?.startTime) return;

    const [hours, minutes] = task.timeBlock.startTime.split(':').map(Number);
    const taskTime = new Date(task.dueDate);
    taskTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const timeUntilTask = taskTime.getTime() - now.getTime();

    // Schedule 10 minutes before
    const notificationTime = timeUntilTask - (10 * 60 * 1000);

    if (notificationTime > 0) {
        setTimeout(() => {
            new Notification(`Upcoming Task: ${task.title}`, {
                body: `Starting in 10 minutes`,
                icon: '/favicon.ico'
            });
        }, notificationTime);
    }
}

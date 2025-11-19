import type { Content, Newsletter, NewsletterSection } from '../types';

const STORAGE_KEY = 'content_calendar_items';

export const storage = {
    getContent(): Content[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveContent(content: Content): void {
        const allContent = this.getContent();
        const index = allContent.findIndex(c => c.id === content.id);

        if (index >= 0) {
            allContent[index] = content;
        } else {
            allContent.push(content);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allContent));
    },

    deleteContent(id: string): void {
        const allContent = this.getContent();
        const filtered = allContent.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    getContentForWeek(weekStart: number): Content[] {
        const allContent = this.getContent();
        const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);

        return allContent.filter(content => {
            const dueDate = content.dueDate;
            return dueDate >= weekStart && dueDate < weekEnd;
        });
    },

    getContentForMonth(year: number, month: number): Content[] {
        const allContent = this.getContent();
        const monthStart = new Date(year, month, 1).getTime();
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).getTime();

        return allContent.filter(content => {
            const dueDate = content.dueDate;
            return dueDate >= monthStart && dueDate <= monthEnd;
        });
    },
};

export function createDefaultNewsletter(weekOf: number): Newsletter {
    const sections: NewsletterSection[] = [
        { name: 'below-gumline', label: 'Below the Gumline', completed: false },
        { name: 'news', label: 'News Articles', completed: false },
        { name: 'research', label: 'The Research Says', completed: false },
        { name: 'business', label: 'Business Topic', completed: false },
        { name: 'efficiency', label: 'Efficiency Topic', completed: false },
        { name: 'meme', label: 'Meme', completed: false },
    ];

    return {
        id: `newsletter-${Date.now()}`,
        type: 'newsletter',
        title: 'Weekly Newsletter',
        dueDate: weekOf + (6 * 24 * 60 * 60 * 1000), // Sunday of the week
        status: 'idea',
        weekOf,
        sections,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

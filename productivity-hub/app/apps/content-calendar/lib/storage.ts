import type { Content, Newsletter, NewsletterSection } from '../types';

const STORAGE_KEY = 'content_calendar_items';

export const storage = {
    async getContent(): Promise<Content[]> {
        try {
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('Failed to fetch content');
            return await response.json();
        } catch (error) {
            console.error('Error fetching content:', error);
            return [];
        }
    },

    async saveContent(content: Content): Promise<Content | null> {
        try {
            // Determine if this is a create or update
            const allContent = await this.getContent();
            const exists = allContent.some(c => c.id === content.id);

            const response = await fetch('/api/content', {
                method: exists ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content),
            });

            if (!response.ok) throw new Error('Failed to save content');
            return await response.json();
        } catch (error) {
            console.error('Error saving content:', error);
            return null;
        }
    },

    async deleteContent(id: string): Promise<void> {
        try {
            await fetch(`/api/content?id=${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting content:', error);
        }
    },

    async getContentForWeek(weekStart: number): Promise<Content[]> {
        const allContent = await this.getContent();
        const weekEnd = weekStart + (7 * 24 * 60 * 60 * 1000);

        return allContent.filter(content => {
            const dueDate = content.dueDate;
            return dueDate >= weekStart && dueDate < weekEnd;
        });
    },

    async getContentForMonth(year: number, month: number): Promise<Content[]> {
        const allContent = await this.getContent();
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

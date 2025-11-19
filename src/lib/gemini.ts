import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ScriptCategory, AIScriptSuggestion } from '../types';

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.initialize(apiKey);
        }
    }

    initialize(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }

    isReady(): boolean {
        return this.model !== null;
    }

    async generateScriptIdeas(topic: string, category: ScriptCategory): Promise<AIScriptSuggestion[]> {
        if (!this.model) {
            throw new Error('Gemini API not initialized. Please add your API key in settings.');
        }

        const prompt = `You are a world-class video script strategist specializing in viral short-form content (TikTok, Reels, YouTube Shorts).

Generate 3 distinct script concepts for a ${category} video about: "${topic}"

Requirements:
- HOOK (0-3s): Must grab attention immediately. Use pattern interrupts, curiosity gaps, or bold statements.
- BODY: Deliver value concisely. No fluff, just insight.
- CTA: Clear, specific call to action.
- VISUALS: Brief notes on what to show (B-roll, camera direction, text overlays).

Return ONLY a JSON array with 3 items in this exact format:
[
  {
    "hook": "The hook text (punchy, bold)",
    "body": "The main content (valuable, concise)",
    "cta": "The call to action (clear, actionable)",
    "visuals": "Visual notes (camera angles, B-roll ideas)"
  }
]

Do not include any markdown formatting, just the raw JSON array.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Remove markdown code blocks if present
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

        try {
            const suggestions = JSON.parse(text);
            if (!Array.isArray(suggestions) || suggestions.length === 0) {
                throw new Error('Invalid response format');
            }
            return suggestions.slice(0, 3);
        } catch (error) {
            console.error('Failed to parse AI response:', text);
            throw new Error('Failed to generate script ideas. Please try again.');
        }
    }

    async polishScript(text: string): Promise<string> {
        if (!this.model) {
            throw new Error('Gemini API not initialized. Please add your API key in settings.');
        }

        const prompt = `You are a script editor specializing in viral short-form video content.

Polish this script body to make it punchier and more engaging:

"${text}"

Requirements:
- Remove filler words and unnecessary fluff
- Make every sentence impactful
- Keep the core message intact
- Optimize for retention (every word must earn its place)
- Keep it concise and scannable

Return ONLY the polished text, no explanations or markdown.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }
}

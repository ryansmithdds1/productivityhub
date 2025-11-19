import type { HookTemplate } from '../types';

export const hookTemplates: HookTemplate[] = [
    {
        id: '1',
        text: 'Most people don\'t realize [specific insight]...',
        category: ['clinical', 'research', 'universal'],
        explanation: 'Creates curiosity gap by hinting at hidden knowledge. Works because it positions the viewer as "in the know" after watching.'
    },
    {
        id: '2',
        text: 'Stop scrolling if [relatable problem]...',
        category: ['patient', 'business', 'universal'],
        explanation: 'Direct command + specificity. The "if" creates self-selection (viewers who relate will stay).'
    },
    {
        id: '3',
        text: 'Here\'s what actually happens when [process/scenario]',
        category: ['clinical', 'research', 'patient'],
        explanation: 'Behind-the-scenes appeal. "Actually" implies debunking misconceptions.'
    },
    {
        id: '4',
        text: 'I spent [time/money] learning [topic] so you don\'t have to',
        category: ['business', 'universal'],
        explanation: 'Value proposition hook. Shows sacrifice = credibility. Promises time-saving shortcut.'
    },
    {
        id: '5',
        text: '[Number] things I wish I knew about [topic] before starting',
        category: ['business', 'clinical', 'universal'],
        explanation: 'Listicle format (scannable) + hindsight wisdom (relatable regret/FOMO prevention).'
    },
    {
        id: '6',
        text: 'You\'re doing [common activity] wrong. Here\'s why:',
        category: ['clinical', 'patient', 'universal'],
        explanation: 'Contrarian stance creates defensive curiosity. Viewers want to prove you wrong or learn the "right" way.'
    },
    {
        id: '7',
        text: 'This [tool/method] changed how I approach [problem]',
        category: ['business', 'clinical', 'universal'],
        explanation: 'Transformation story. Implies a "before and after" that viewers want to replicate.'
    },
    {
        id: '8',
        text: 'The [industry] doesn\'t want you to know this...',
        category: ['clinical', 'business', 'research'],
        explanation: 'Conspiracy angle (use carefully). Creates "us vs. them" dynamic. High engagement but must deliver on promise.'
    },
    {
        id: '9',
        text: 'POV: You just found out [surprising fact about topic]',
        category: ['patient', 'universal'],
        explanation: 'POV format is algorithmically favored. Creates immersive, relatable scenario.'
    },
    {
        id: '10',
        text: 'If you struggle with [pain point], watch this',
        category: ['patient', 'clinical', 'universal'],
        explanation: 'Pain-agitation hook. Speaks directly to viewer\'s current problem state.'
    },
    {
        id: '11',
        text: 'Why [controversial opinion] is actually true',
        category: ['research', 'business', 'universal'],
        explanation: 'Debate-starter. Works best when you can back it with data or unique insight.'
    },
    {
        id: '12',
        text: 'The [simple thing] that [big result]',
        category: ['business', 'clinical', 'universal'],
        explanation: 'Simplicity + impact contrast. Promises maximum ROI for minimum effort.'
    },
];

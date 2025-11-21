'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft, Clock, Save } from 'lucide-react';
import { PLANNING_STEPS, type WeeklyPlan } from '../types';

interface PlanningWizardProps {
    onComplete: (plan: WeeklyPlan) => void;
    onCancel: () => void;
    initialPlan?: WeeklyPlan;
}

export function PlanningWizard({ onComplete, onCancel, initialPlan }: PlanningWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);

    // Form data
    const [brainDump, setBrainDump] = useState('');
    const [wins, setWins] = useState<string[]>(['', '']);
    const [challenges, setChallenges] = useState('');
    const [spiritualGoals, setSpiritualGoals] = useState<string[]>(['']);
    const [personalGoals, setPersonalGoals] = useState<string[]>(['']);
    const [businessGoals, setBusinessGoals] = useState<string[]>(['']);
    const [contentGoals, setContentGoals] = useState<string[]>(['']);
    const [roadblocks, setRoadblocks] = useState('');
    const [commitment, setCommitment] = useState('');
    const [createdTasks, setCreatedTasks] = useState<string[]>([]); // Track task IDs

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentStepInfo = PLANNING_STEPS[currentStep];
    const progress = ((currentStep + 1) / PLANNING_STEPS.length) * 100;

    const handleNext = () => {
        if (currentStep < PLANNING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
            setStartTime(Date.now());
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setStartTime(Date.now());
        }
    };

    const createTask = async (title: string, category: 'work' | 'personal' | 'content' | 'health' | 'other') => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    category,
                    priority: 'medium',
                    dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // Due in 1 week
                    completed: false
                })
            });

            if (response.ok) {
                const task = await response.json();
                setCreatedTasks(prev => [...prev, task.id]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to create task:', error);
            return false;
        }
    };

    const handleComplete = () => {
        const plan: Partial<WeeklyPlan> = {
            weekOf: Date.now(),
            status: 'completed',
            reflections: {
                wins: wins.filter(w => w.trim()),
                challenges: [challenges].filter(c => c.trim())
            },
            goals: {
                spiritual: spiritualGoals.filter(g => g.trim()),
                personal: personalGoals.filter(g => g.trim()),
                business: businessGoals.filter(g => g.trim()),
                content: contentGoals.filter(g => g.trim())
            },
            roadblocks,
            commitment
        };
        onComplete(plan as WeeklyPlan);
    };

    const addGoalField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, '']);
    };

    const updateGoalField = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => {
            const newGoals = [...prev];
            newGoals[index] = value;
            return newGoals;
        });
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Prep & Brain Dump
                return (
                    <div className="space-y-4">
                        <p className="text-gray-400">Jot down any lingering ideas, wins, or challenges from the past week. Clear your mind before diving deeper.</p>
                        <textarea
                            value={brainDump}
                            onChange={(e) => setBrainDump(e.target.value)}
                            className="w-full h-64 bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:border-blue-500 focus:outline-none resize-none"
                            placeholder="Brain dump everything on your mind..."
                        />
                    </div>
                );

            case 1: // Reflection
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">What were 1-2 wins this week?</label>
                            {wins.map((win, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    value={win}
                                    onChange={(e) => {
                                        const newWins = [...wins];
                                        newWins[i] = e.target.value;
                                        setWins(newWins);
                                    }}
                                    className="w-full mb-2 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder={`Win ${i + 1}`}
                                />
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">What was your biggest challenge?</label>
                            <textarea
                                value={challenges}
                                onChange={(e) => setChallenges(e.target.value)}
                                className="w-full h-24 bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:border-blue-500 focus:outline-none resize-none"
                                placeholder="Describe the challenge..."
                            />
                        </div>
                    </div>
                );

            case 2: // Spiritual & Service
                return (
                    <div className="space-y-4">
                        <p className="text-gray-400">Plan your spiritual activities and service goals for the week.</p>
                        {spiritualGoals.map((goal, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => updateGoalField(i, e.target.value, setSpiritualGoals)}
                                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Temple visit with fasting on Friday"
                                />
                                {goal.trim() && (
                                    <button
                                        onClick={() => createTask(goal, 'personal')}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        + Add to To-Do
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addGoalField(setSpiritualGoals)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            + Add another goal
                        </button>
                    </div>
                );

            case 3: // Personal & Family
                return (
                    <div className="space-y-4">
                        <p className="text-gray-400">Set personal and family objectives for the week.</p>
                        {personalGoals.map((goal, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => updateGoalField(i, e.target.value, setPersonalGoals)}
                                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Date night Tuesday, Family walk Wednesday"
                                />
                                {goal.trim() && (
                                    <button
                                        onClick={() => createTask(goal, 'personal')}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        + Add to To-Do
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addGoalField(setPersonalGoals)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            + Add another goal
                        </button>
                    </div>
                );

            case 4: // Business & Professional
                return (
                    <div className="space-y-4">
                        <p className="text-gray-400">Define your business and professional goals for the week.</p>
                        {businessGoals.map((goal, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => updateGoalField(i, e.target.value, setBusinessGoals)}
                                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Complete CE course, Review staffing Monday"
                                />
                                {goal.trim() && (
                                    <button
                                        onClick={() => createTask(goal, 'work')}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        + Add to To-Do
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addGoalField(setBusinessGoals)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            + Add another goal
                        </button>
                    </div>
                );

            case 5: // Content Creation
                return (
                    <div className="space-y-4">
                        <p className="text-gray-400">Plan your content for the week: 2 YouTube videos and 5 shorts.</p>
                        {contentGoals.map((goal, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={(e) => updateGoalField(i, e.target.value, setContentGoals)}
                                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., YouTube: How to Fix Overbite | Short: Quick Flossing Tip"
                                />
                                {goal.trim() && (
                                    <button
                                        onClick={() => createTask(goal, 'content')}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        + Add to To-Do
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addGoalField(setContentGoals)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            + Add another item
                        </button>
                    </div>
                );

            case 6: // Roadblocks
                return (
                    <div className="space-y-4">
                        <p className="text-gray-400">Review your calendar and identify potential roadblocks or conflicts.</p>
                        <textarea
                            value={roadblocks}
                            onChange={(e) => setRoadblocks(e.target.value)}
                            className="w-full h-48 bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:border-blue-500 focus:outline-none resize-none"
                            placeholder="e.g., Heavy travel on Wednesday - shift CE to Thursday. Add buffer for unexpected patient emergencies."
                        />
                    </div>
                );

            case 7: // Close & Commit
                return (
                    <div className="space-y-4">
                        {createdTasks.length > 0 && (
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                                <p className="text-green-400 text-sm font-medium">
                                    ✅ Created {createdTasks.length} task(s) in your To-Do List
                                </p>
                            </div>
                        )}
                        <p className="text-gray-400">Summarize your week and set a mid-week check-in reminder.</p>
                        <textarea
                            value={commitment}
                            onChange={(e) => setCommitment(e.target.value)}
                            className="w-full h-48 bg-gray-950 border border-gray-800 rounded-lg p-4 text-white focus:border-blue-500 focus:outline-none resize-none"
                            placeholder="This week I will focus on... Mid-week check-in: Thursday evening to review progress."
                        />
                    </div>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Step {currentStep + 1} of {PLANNING_STEPS.length}</span>
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock size={14} />
                        {formatTime(elapsedTime)} / {currentStepInfo.suggestedMinutes}min
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{currentStepInfo.title}</h2>
                    <p className="text-gray-400 text-sm">{currentStepInfo.description}</p>
                </div>

                {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>

                <div className="flex gap-3">
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        {currentStep === PLANNING_STEPS.length - 1 ? (
                            <>
                                <Save size={18} />
                                Complete Planning
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { Calendar, Play, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { PlanningWizard } from './components/PlanningWizard';
import { WeekSelectionModal } from './components/WeekSelectionModal';
import { storage } from './lib/storage';
import type { WeeklyPlan } from './types';

export default function WeeklyPlanningPage() {
    const [isPlanning, setIsPlanning] = useState(false);
    const [plans, setPlans] = useState<WeeklyPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan | null>(null);
    const [showWeekSelection, setShowWeekSelection] = useState(false);
    const [planningDate, setPlanningDate] = useState<number>(Date.now());

    useEffect(() => {
        loadPlans();
    }, []);

    const PlanDetailModal = ({ plan, onClose }: { plan: WeeklyPlan; onClose: () => void }) => (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
                    <h2 className="text-xl font-bold text-white">Plan Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <ChevronRight className="rotate-90" size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-8">
                    {/* Reflections */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-3">Reflections</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-950 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-2">Wins</p>
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                    {plan.reflections?.wins.map((win, i) => (
                                        <li key={i}>{win}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-950 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-2">Challenges</p>
                                <p className="text-gray-300">{plan.reflections?.challenges[0]}</p>
                            </div>
                        </div>
                    </div>

                    {/* Goals */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-3">Goals</h3>
                        <div className="space-y-4">
                            {plan.goals?.spiritual && plan.goals.spiritual.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-2">Spiritual & Service</p>
                                    <ul className="list-disc list-inside text-gray-300 bg-gray-950 p-4 rounded-lg">
                                        {plan.goals.spiritual.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                </div>
                            )}
                            {plan.goals?.personal && plan.goals.personal.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-2">Personal & Family</p>
                                    <ul className="list-disc list-inside text-gray-300 bg-gray-950 p-4 rounded-lg">
                                        {plan.goals.personal.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                </div>
                            )}
                            {plan.goals?.business && plan.goals.business.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-2">Business</p>
                                    <ul className="list-disc list-inside text-gray-300 bg-gray-950 p-4 rounded-lg">
                                        {plan.goals.business.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                </div>
                            )}
                            {plan.goals?.content && plan.goals.content.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-2">Content</p>
                                    <ul className="list-disc list-inside text-gray-300 bg-gray-950 p-4 rounded-lg">
                                        {plan.goals.content.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Roadblocks & Commitment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-3">Roadblocks</h3>
                            <div className="bg-gray-950 p-4 rounded-lg text-gray-300">
                                {plan.roadblocks || 'None identified'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-3">Commitment</h3>
                            <div className="bg-gray-950 p-4 rounded-lg text-gray-300">
                                {plan.commitment || 'No commitment set'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const loadPlans = async () => {
        setLoading(true);
        const data = await storage.getPlans();
        setPlans(data);
        setLoading(false);
    };

    const handleStartPlanning = () => {
        setShowWeekSelection(true);
    };

    const handleWeekSelected = (date: number) => {
        setPlanningDate(date);
        setShowWeekSelection(false);
        setIsPlanning(true);
    };

    const handleCompletePlanning = async (plan: WeeklyPlan) => {
        await storage.createPlan(plan);
        setIsPlanning(false);
        loadPlans();
    };

    const handleCancelPlanning = () => {
        setIsPlanning(false);
    };

    const getWeekDateRange = (timestamp: number) => {
        const date = new Date(timestamp);
        const weekStart = new Date(date);
        // Adjust to Monday if needed, but assuming user picks Monday or we just use the date as start
        // If we want to force Monday alignment:
        // const day = weekStart.getDay();
        // const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        // weekStart.setDate(diff);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    if (isPlanning) {
        return (
            <DashboardLayout>
                <div className="p-8">
                    <PlanningWizard
                        onComplete={handleCompletePlanning}
                        onCancel={handleCancelPlanning}
                        weekOf={planningDate}
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Weekly Planning</h1>
                        <p className="text-gray-400 mt-1">45-60 minute guided planning session</p>
                    </div>
                    <button
                        onClick={handleStartPlanning}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Play size={20} />
                        Begin Planning Session
                    </button>
                </div>

                {/* Overview Card */}
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">8-Step Workflow</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { step: 1, title: 'Prep & Brain Dump', time: '5 min' },
                            { step: 2, title: 'Reflection', time: '5 min' },
                            { step: 3, title: 'Spiritual Goals', time: '10 min' },
                            { step: 4, title: 'Personal/Family', time: '10 min' },
                            { step: 5, title: 'Business Goals', time: '15 min' },
                            { step: 6, title: 'Content Goals', time: '10 min' },
                            { step: 7, title: 'Roadblocks', time: '5 min' },
                            { step: 8, title: 'Commit', time: '5 min' },
                        ].map(({ step, title, time }) => (
                            <div key={step} className="bg-gray-900/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">
                                        {step}
                                    </div>
                                    <span className="text-sm font-medium text-white">{title}</span>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1 ml-8">
                                    <Clock size={12} />
                                    {time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Plans */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar className="text-blue-400" size={20} />
                        Planning History
                    </h2>

                    {loading ? (
                        <p className="text-gray-500 text-center py-8">Loading...</p>
                    ) : plans.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No planning sessions yet. Start your first one above!</p>
                    ) : (
                        <div className="space-y-4">
                            {plans.map(plan => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className="bg-gray-950 border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Week of {getWeekDateRange(plan.weekOf)}</h3>
                                                {plan.status === 'completed' && (
                                                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full">
                                                        <CheckCircle size={12} />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Planned on {new Date(plan.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <ChevronRight className="text-gray-600 group-hover:text-blue-400 transition-colors" size={20} />
                                    </div>

                                    {/* Inline Goal Preview */}
                                    {plan.goals && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {plan.goals.business && plan.goals.business.length > 0 && (
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Focus</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {plan.goals.business.slice(0, 3).map((g, i) => (
                                                            <li key={i} className="text-gray-300 truncate">• {g}</li>
                                                        ))}
                                                        {plan.goals.business.length > 3 && (
                                                            <li className="text-gray-500 text-xs pl-2">+{plan.goals.business.length - 3} more</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                            {plan.goals.content && plan.goals.content.length > 0 && (
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {plan.goals.content.slice(0, 3).map((g, i) => (
                                                            <li key={i} className="text-gray-300 truncate">• {g}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedPlan && (
                <PlanDetailModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                />
            )}
        </DashboardLayout>
    );
}

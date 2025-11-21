'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/DashboardLayout';
import { Calendar, Play, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { PlanningWizard } from './components/PlanningWizard';
import { storage } from './lib/storage';
import type { WeeklyPlan } from './types';

export default function WeeklyPlanningPage() {
    const [isPlanning, setIsPlanning] = useState(false);
    const [plans, setPlans] = useState<WeeklyPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        const data = await storage.getPlans();
        setPlans(data);
        setLoading(false);
    };

    const handleStartPlanning = () => {
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
        weekStart.setDate(date.getDate() - date.getDay());
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
                                <div key={plan.id} className="bg-gray-950 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-white">Week of {getWeekDateRange(plan.weekOf)}</h3>
                                                {plan.status === 'completed' && (
                                                    <span className="flex items-center gap-1 text-xs text-green-400">
                                                        <CheckCircle size={14} />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                {new Date(plan.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Summary */}
                                    {plan.goals && (
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {plan.goals.spiritual && plan.goals.spiritual.length > 0 && (
                                                <div className="bg-gray-900 rounded p-2">
                                                    <div className="text-xs text-gray-500 mb-1">Spiritual</div>
                                                    <div className="text-sm text-white font-medium">{plan.goals.spiritual.length} goals</div>
                                                </div>
                                            )}
                                            {plan.goals.personal && plan.goals.personal.length > 0 && (
                                                <div className="bg-gray-900 rounded p-2">
                                                    <div className="text-xs text-gray-500 mb-1">Personal</div>
                                                    <div className="text-sm text-white font-medium">{plan.goals.personal.length} goals</div>
                                                </div>
                                            )}
                                            {plan.goals.business && plan.goals.business.length > 0 && (
                                                <div className="bg-gray-900 rounded p-2">
                                                    <div className="text-xs text-gray-500 mb-1">Business</div>
                                                    <div className="text-sm text-white font-medium">{plan.goals.business.length} goals</div>
                                                </div>
                                            )}
                                            {plan.goals.content && plan.goals.content.length > 0 && (
                                                <div className="bg-gray-900 rounded p-2">
                                                    <div className="text-xs text-gray-500 mb-1">Content</div>
                                                    <div className="text-sm text-white font-medium">{plan.goals.content.length} items</div>
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
        </DashboardLayout>
    );
}

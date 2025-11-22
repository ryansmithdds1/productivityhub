'use client';

import { useState, useEffect } from 'react';
import { Edit2, Save, X, Scale, Footprints, Flame, Heart, Activity, Timer } from 'lucide-react';

const DEFAULT_ROUTINES = {
    morning: `Morning Routine
* Step 1: Spiritual Foundation (20 min)
    * 5:00 AM - Prayer & Gratitude (5 min): Connect and express gratitude.
    * 5:05 AM - Meditate on Covenants (5 min): Sit in quiet reflection and breath work.
    * 5:10 AM - 3 Pages of Book of Mormon (10 min): Focused reading and breath work.
* Step 2: Physical Activation (60 min)
    * 5:20 AM - Mobility Workout (15 min): Prepare your body for movement.
    * 5:35 AM - Walk (45 min): Brisk walk, preferably outside. Use this time to think, listen to your BYU speech, or just be present.
* Step 3: Prepare for the Day (15 min)
    * 6:20 AM - Get Ready (15 min): Quick shower, get dressed for the day.
    * Gather Food For The Day & Leave Home`,

    day: `During The Day
* 2-3 Hours In Offices Increasing Profitability & Managing - keep log of what was done and issues
* Strength Training Workout
* 3 Hours On Course Creation & Youtube

In Office Visit Routine
- Manage the front office weekly update tasks
- Review staffing efficiency / opportunities to cut?
- Review schedule for opportunities
- Review capacity on dr/hyg/ER/NP
- Review EOB’s from prior week for Fees and issues
- Review prior week production/collections and current week projections
- Review adjustments from prior week 
- Look to implement new items to increase production/control costs from list
- Audit doctor diagnosis for opportunities
- Individual trainings where applicable`,

    night: `Night Routine
1. Melatonin
2. Plan & Prep Tomorrow's Meals (10 min): Decide what you'll eat. Pull meat from the freezer, put oats in a bowl, pack your lunch. This single habit is a game-changer for nutrition
3. Financial Transaction Awareness (5 min): Open your personal banking/credit card app. Quickly review the day's transactions. The goal is awareness, not deep analysis.
4. Record Calories & Food (5 min): Open your spreadsheet and log your food for the day. Be honest and quick.
5. Plan Out Tomorrow In Full Detail (10 min):
6. Pray / Relax / Mindfullness
7. Read Church Book or Listen To Talk Falling Asleep`,

    mealPlan: `Breakfast:
4 whole eggs
Peppers + onions
1 oz fat-free cheese (optional)

Lunch:
12 oz chicken breast
2 cups green beans
Side salad (lettuce + vinegar)
½ tbsp olive oil for cooking

Dinner:
4 whole eggs
Peppers + onions
1 oz fat-free cheese (optional)

Shakes:
Whey isolate – 2 servings (80g protein)`
};

interface HealthMetrics {
    weight: string;
    steps: string;
    calories: string;
    rhr: string;
    hrv: string;
    exercise: string;
}

const DEFAULT_METRICS: HealthMetrics = {
    weight: '',
    steps: '',
    calories: '',
    rhr: '',
    hrv: '',
    exercise: ''
};

export function RoutineGrid() {
    console.log('Rendering RoutineGrid');
    const [routines, setRoutines] = useState(DEFAULT_ROUTINES);
    const [metrics, setMetrics] = useState<HealthMetrics>(DEFAULT_METRICS);
    const [editing, setEditing] = useState<string | null>(null);
    const [isEditingMetrics, setIsEditingMetrics] = useState(false);

    // ... (existing useEffects)

    const handleSaveMetrics = async () => {
        try {
            const date = new Date().toISOString().split('T')[0];
            await fetch('/api/health-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    ...metrics
                })
            });
            setIsEditingMetrics(false);
        } catch (e) {
            console.error('Failed to save metrics', e);
        }
    };

    const handleCancelMetrics = () => {
        setIsEditingMetrics(false);
        // Re-fetch or reset to saved state could be added here if needed
        // For now, we just exit edit mode, keeping current local state
    };

    return (
        <div className="space-y-6">
            {/* ... (Daily Routines Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ... (RoutineColumns) */}
                <RoutineColumn
                    title="Morning Routine"
                    content={routines.morning}
                    isEditing={editing === 'morning'}
                    tempValue={tempValue}
                    onEdit={() => handleEdit('morning')}
                    onSave={() => handleSave('morning')}
                    onCancel={handleCancel}
                    onChange={setTempValue}
                    colorClass="border-orange-500/20 bg-orange-500/5"
                    headerColor="text-orange-400"
                />
                <RoutineColumn
                    title="During The Day"
                    content={routines.day}
                    isEditing={editing === 'day'}
                    tempValue={tempValue}
                    onEdit={() => handleEdit('day')}
                    onSave={() => handleSave('day')}
                    onCancel={handleCancel}
                    onChange={setTempValue}
                    colorClass="border-blue-500/20 bg-blue-500/5"
                    headerColor="text-blue-400"
                />
                <RoutineColumn
                    title="Night Routine"
                    content={routines.night}
                    isEditing={editing === 'night'}
                    tempValue={tempValue}
                    onEdit={() => handleEdit('night')}
                    onSave={() => handleSave('night')}
                    onCancel={handleCancel}
                    onChange={setTempValue}
                    colorClass="border-purple-500/20 bg-purple-500/5"
                    headerColor="text-purple-400"
                />
            </div>

            {/* Bottom Section: Meal Plan & Health Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Meal Plan (Takes up 2/3 on large screens) */}
                <div className="lg:col-span-2">
                    <RoutineColumn
                        title="Current Meal Plan"
                        // @ts-ignore
                        content={routines.mealPlan}
                        isEditing={editing === 'mealPlan'}
                        tempValue={tempValue}
                        onEdit={() => handleEdit('mealPlan')}
                        onSave={() => handleSave('mealPlan')}
                        onCancel={handleCancel}
                        onChange={setTempValue}
                        colorClass="border-green-500/20 bg-green-500/5"
                        headerColor="text-green-400"
                    />
                </div>

                {/* Health Metrics (Takes up 1/3 on large screens) */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800/50 bg-gray-900/50 flex items-center justify-between">
                        <h3 className="font-semibold text-red-400">Health Metrics</h3>
                        <div className="flex items-center gap-2">
                            {isEditingMetrics ? (
                                <>
                                    <button
                                        onClick={handleSaveMetrics}
                                        className="p-1.5 hover:bg-gray-700 rounded-lg text-green-400 transition-colors"
                                        title="Save"
                                    >
                                        <Save size={16} />
                                    </button>
                                    <button
                                        onClick={handleCancelMetrics}
                                        className="p-1.5 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
                                        title="Cancel"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditingMetrics(true)}
                                    className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <MetricInput
                                icon={Scale}
                                label="Weight"
                                value={metrics.weight}
                                unit="lbs"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('weight', v)}
                            />
                            <MetricInput
                                icon={Footprints}
                                label="Steps"
                                value={metrics.steps}
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('steps', v)}
                            />
                            <MetricInput
                                icon={Flame}
                                label="Calories"
                                value={metrics.calories}
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('calories', v)}
                            />
                            <MetricInput
                                icon={Heart}
                                label="RHR"
                                value={metrics.rhr}
                                unit="bpm"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('rhr', v)}
                            />
                            <MetricInput
                                icon={Activity}
                                label="HRV"
                                value={metrics.hrv}
                                unit="ms"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('hrv', v)}
                            />
                            <MetricInput
                                icon={Timer}
                                label="Exercise"
                                value={metrics.exercise}
                                unit="min"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('exercise', v)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ... (RoutineColumnProps and RoutineColumn remain the same)

function MetricInput({ icon: Icon, label, value, unit, isEditing, onChange }: { icon: any, label: string, value: string, unit?: string, isEditing: boolean, onChange: (val: string) => void }) {
    return (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Icon size={14} />
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-baseline gap-1 h-6">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full bg-transparent text-white font-mono font-medium focus:outline-none placeholder-gray-600 border-b border-gray-700 focus:border-blue-500"
                            placeholder="-"
                        />
                        {unit && <span className="text-xs text-gray-500">{unit}</span>}
                    </>
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className="text-white font-mono font-medium">{value || '-'}</span>
                        {value && unit && <span className="text-xs text-gray-500">{unit}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

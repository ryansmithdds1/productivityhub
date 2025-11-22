'use client';

import { useState, useEffect } from 'react';
import { Edit2, Save, X, Scale, Footprints, Flame, Heart, Activity, Timer, ChevronLeft, ChevronRight, LineChart, CheckCircle2 } from 'lucide-react';
import { HealthTrends } from './HealthTrends';

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
Whey isolate – 2 servings (80g protein)`,

    goals: `Current Goals:
1. 
2. 
3. `
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
    const [tempValue, setTempValue] = useState('');

    // Date Navigation State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showTrends, setShowTrends] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        // Load Routines from Local Storage
        const savedRoutines = localStorage.getItem('productivity_hub_routines');
        if (savedRoutines) {
            try {
                const parsed = JSON.parse(savedRoutines);
                setRoutines({ ...DEFAULT_ROUTINES, ...parsed });
            } catch (e) {
                console.error('Failed to parse saved routines', e);
            }
        }
    }, []);

    // Load Metrics when date changes
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];

                // Fetch current date metrics
                const res = await fetch(`/api/health-metrics?date=${dateStr}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && !data.error && Object.keys(data).length > 0) {
                        setMetrics({ ...DEFAULT_METRICS, ...data });
                    } else {
                        setMetrics(DEFAULT_METRICS);
                    }
                }

                // Fetch 7-day history for averages
                const historyRes = await fetch('/api/health-metrics?days=7');
                if (historyRes.ok) {
                    const history = await historyRes.json();
                    calculateAverages(history);
                }
            } catch (e) {
                console.error('Failed to fetch metrics', e);
                setMetrics(DEFAULT_METRICS);
            }
        };
        fetchMetrics();
    }, [selectedDate]);

    const [averages, setAverages] = useState({ weight: '', steps: '' });

    const calculateAverages = (history: any[]) => {
        if (!Array.isArray(history) || history.length === 0) {
            setAverages({ weight: '', steps: '' });
            return;
        }

        // Weight Average
        const weightReadings = history
            .map(h => parseFloat(h.weight))
            .filter(w => !isNaN(w) && w > 0);

        const avgWeight = weightReadings.length > 0
            ? (weightReadings.reduce((a, b) => a + b, 0) / weightReadings.length).toFixed(1)
            : '';

        // Steps Average
        const stepsReadings = history
            .map(h => parseInt(h.steps))
            .filter(s => !isNaN(s) && s > 0);

        const avgSteps = stepsReadings.length > 0
            ? Math.round(stepsReadings.reduce((a, b) => a + b, 0) / stepsReadings.length).toString()
            : '';

        setAverages({ weight: avgWeight, steps: avgSteps });
    };

    const handleDateChange = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
        setIsEditingMetrics(false); // Exit edit mode when changing dates
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleEdit = (key: string) => {
        setEditing(key);
        // @ts-ignore
        setTempValue(routines[key as keyof typeof routines]);
    };

    const handleSave = (key: string) => {
        const newRoutines = { ...routines, [key]: tempValue };
        setRoutines(newRoutines);
        localStorage.setItem('productivity_hub_routines', JSON.stringify(newRoutines));
        setEditing(null);
    };

    const handleCancel = () => {
        setEditing(null);
        setTempValue('');
    };

    const handleMetricChange = async (key: keyof HealthMetrics, value: string) => {
        const newMetrics = { ...metrics, [key]: value };
        setMetrics(newMetrics);

        // Save to API
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            await fetch('/api/health-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dateStr,
                    ...newMetrics
                })
            });
        } catch (e) {
            console.error('Failed to save metrics', e);
        }
    };

    const handleSaveMetrics = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            await fetch('/api/health-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dateStr,
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

            {/* Bottom Section: Meal Plan, Goals & Health Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Meal Plan */}
                <div className="h-full">
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

                {/* Goals */}
                <div className="h-full">
                    <RoutineColumn
                        title="My Current Goals"
                        // @ts-ignore
                        content={routines.goals}
                        isEditing={editing === 'goals'}
                        tempValue={tempValue}
                        onEdit={() => handleEdit('goals')}
                        onSave={() => handleSave('goals')}
                        onCancel={handleCancel}
                        onChange={setTempValue}
                        colorClass="border-yellow-500/20 bg-yellow-500/5"
                        headerColor="text-yellow-400"
                    />
                </div>

                {/* Health Metrics */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800/50 bg-gray-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-red-400">Health Metrics</h3>

                            {/* Date Navigation */}
                            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
                                <button
                                    onClick={() => handleDateChange(-1)}
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="text-xs font-mono font-medium text-gray-300 min-w-[80px] text-center">
                                    {formatDate(selectedDate)}
                                </span>
                                <button
                                    onClick={() => handleDateChange(1)}
                                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                                    disabled={formatDate(selectedDate) === 'Today'}
                                >
                                    <ChevronRight size={14} className={formatDate(selectedDate) === 'Today' ? 'opacity-30' : ''} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowTrends(true)}
                                className="p-1.5 hover:bg-gray-700 rounded-lg text-blue-400 transition-colors mr-2"
                                title="View Trends"
                            >
                                <LineChart size={16} />
                            </button>

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
                                color="blue"
                                average={averages.weight}
                            />
                            <MetricInput
                                icon={Footprints}
                                label="Steps"
                                value={metrics.steps}
                                unit="steps"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('steps', v)}
                                color="green"
                                average={averages.steps}
                            />
                            <MetricInput
                                icon={Flame}
                                label="Calories"
                                value={metrics.calories}
                                unit="kcal"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('calories', v)}
                                color="orange"
                            />
                            <MetricInput
                                icon={Heart}
                                label="RHR"
                                value={metrics.rhr}
                                unit="bpm"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('rhr', v)}
                                color="red"
                            />
                            <MetricInput
                                icon={Activity}
                                label="HRV"
                                value={metrics.hrv}
                                unit="ms"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('hrv', v)}
                                color="purple"
                            />
                            <MetricInput
                                icon={Timer}
                                label="Exercise"
                                value={metrics.exercise}
                                unit="min"
                                isEditing={isEditingMetrics}
                                onChange={(v) => handleMetricChange('exercise', v)}
                                color="teal"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trends Modal */}
            {showTrends && <HealthTrends onClose={() => setShowTrends(false)} />}
        </div>
    );
}

interface RoutineColumnProps {
    title: string;
    content: string;
    isEditing: boolean;
    tempValue: string;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (val: string) => void;
    colorClass: string;
    headerColor: string;
}

function RoutineColumn({
    title,
    content,
    isEditing,
    tempValue,
    onEdit,
    onSave,
    onCancel,
    onChange,
    colorClass,
    headerColor
}: RoutineColumnProps) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    // Load checked state from local storage
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const key = `routine_checks_${title}_${today}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            setCheckedItems(JSON.parse(saved));
        } else {
            // Reset if new day (implicit by unique key per day)
            setCheckedItems({});
        }
    }, [title]);

    const handleCheck = (lineIndex: number) => {
        const today = new Date().toISOString().split('T')[0];
        const key = `routine_checks_${title}_${today}`;

        const newChecked = {
            ...checkedItems,
            [lineIndex]: !checkedItems[lineIndex]
        };

        setCheckedItems(newChecked);
        localStorage.setItem(key, JSON.stringify(newChecked));
    };

    const renderContent = () => {
        if (isEditing) {
            return (
                <textarea
                    value={tempValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-[400px] bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
                />
            );
        }

        return (
            <div className="space-y-1">
                {content.split('\n').map((line, i) => {
                    // Check if line is a list item (starts with * or -)
                    const isListItem = line.trim().startsWith('*') || line.trim().startsWith('-');
                    const isNumberedList = /^\d+\./.test(line.trim());

                    if (isListItem || isNumberedList) {
                        const isChecked = checkedItems[i] || false;
                        const cleanLine = line.replace(/^[\*\-]\s*/, '').replace(/^\d+\.\s*/, '');

                        return (
                            <div
                                key={i}
                                className={`flex items-start gap-2 p-1 rounded hover:bg-gray-800/50 transition-colors cursor-pointer group ${isChecked ? 'opacity-50' : ''}`}
                                onClick={() => handleCheck(i)}
                            >
                                <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'border-gray-600 group-hover:border-gray-500'
                                    }`}>
                                    {isChecked && <CheckCircle2 size={10} />}
                                </div>
                                <span className={`text-sm font-mono leading-relaxed ${isChecked ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                    {isNumberedList ? line.trim() : cleanLine}
                                </span>
                            </div>
                        );
                    }

                    // Regular text (headers, empty lines, etc)
                    return (
                        <div key={i} className="text-gray-300 text-sm font-mono leading-relaxed min-h-[1.2em]">
                            {line}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`rounded-xl border ${colorClass} overflow-hidden flex flex-col h-full`}>
            <div className="p-4 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/50">
                <h3 className={`font-semibold ${headerColor}`}>{title}</h3>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={onSave}
                                className="p-1.5 hover:bg-gray-700 rounded-lg text-green-400 transition-colors"
                                title="Save"
                            >
                                <Save size={16} />
                            </button>
                            <button
                                onClick={onCancel}
                                className="p-1.5 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
                                title="Cancel"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onEdit}
                            className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
                {renderContent()}
            </div>
        </div>
    );
}

interface MetricInputProps {
    icon: any;
    label: string;
    value: string;
    unit: string;
    isEditing: boolean;
    onChange: (val: string) => void;
    color: string;
    average?: string;
}

function MetricInput({ icon: Icon, label, value, unit, isEditing, onChange, color, average }: MetricInputProps) {
    return (
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md bg-${color}-500/10 text-${color}-400`}>
                    <Icon size={16} />
                </div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
            </div>

            {isEditing ? (
                <div className="flex items-baseline gap-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-lg font-bold text-white focus:outline-none focus:border-blue-500"
                        placeholder="0"
                    />
                    <span className="text-xs text-gray-500">{unit}</span>
                </div>
            ) : (
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white tracking-tight">
                            {value || '--'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{unit}</span>
                    </div>
                    {average && (
                        <div className="text-[10px] text-gray-500 mt-1">
                            7d avg: <span className="text-gray-400">{average}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';

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
7. Read Church Book or Listen To Talk Falling Asleep`
};

export function RoutineGrid() {
    const [routines, setRoutines] = useState(DEFAULT_ROUTINES);
    const [editing, setEditing] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('productivity_hub_routines');
        if (saved) {
            try {
                setRoutines(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved routines', e);
            }
        }
    }, []);

    const handleEdit = (key: string) => {
        setEditing(key);
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="p-4 flex-1">
                {isEditing ? (
                    <textarea
                        value={tempValue}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-[400px] bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
                    />
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-300 text-sm font-mono leading-relaxed">
                        {content}
                    </div>
                )}
            </div>
        </div>
    );
}

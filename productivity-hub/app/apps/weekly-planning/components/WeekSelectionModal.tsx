'use client';

import { useState } from 'react';

interface WeekSelectionModalProps {
    onClose: () => void;
    onSelect: (date: number) => void;
}

export function WeekSelectionModal({ onClose, onSelect }: WeekSelectionModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4">Select Week</h2>
                <p className="text-gray-400 mb-6">Choose the Monday of the week you want to plan for.</p>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white mb-6 focus:border-blue-500 focus:outline-none"
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            // Create date at noon to avoid timezone issues shifting the day
                            const selectedDate = new Date(date);
                            // Add time component to ensure it's treated as local time or specific day
                            const timestamp = selectedDate.getTime();
                            onSelect(timestamp);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Start Planning
                    </button>
                </div>
            </div>
        </div>
    );
}

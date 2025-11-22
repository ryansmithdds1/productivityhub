'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, Scale, Footprints, Flame, Heart, Activity, Timer } from 'lucide-react';

interface HealthMetric {
    date: string;
    weight: string;
    steps: string;
    calories: string;
    rhr: string;
    hrv: string;
    exercise: string;
}

interface HealthTrendsProps {
    onClose: () => void;
}

const METRICS = [
    { key: 'weight', label: 'Weight', unit: 'lbs', icon: Scale, color: '#3b82f6' },
    { key: 'steps', label: 'Steps', unit: '', icon: Footprints, color: '#10b981' },
    { key: 'calories', label: 'Calories', unit: '', icon: Flame, color: '#f59e0b' },
    { key: 'rhr', label: 'RHR', unit: 'bpm', icon: Heart, color: '#ef4444' },
    { key: 'hrv', label: 'HRV', unit: 'ms', icon: Activity, color: '#8b5cf6' },
    { key: 'exercise', label: 'Exercise', unit: 'min', icon: Timer, color: '#ec4899' },
];

export function HealthTrends({ onClose }: HealthTrendsProps) {
    const [data, setData] = useState<HealthMetric[]>([]);
    const [activeMetric, setActiveMetric] = useState(METRICS[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/health-metrics?days=30');
                if (res.ok) {
                    const metrics = await res.json();
                    setData(metrics);
                }
            } catch (e) {
                console.error('Failed to fetch trends', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Format data for chart
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(item[activeMetric.key as keyof HealthMetric] || '0')
    })).filter(item => item.value > 0); // Only show days with data

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <activeMetric.icon className="text-gray-400" size={24} />
                        Health Trends
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Metric Selector */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {METRICS.map(metric => (
                            <button
                                key={metric.key}
                                onClick={() => setActiveMetric(metric)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeMetric.key === metric.key
                                        ? 'bg-gray-800 border-gray-600 text-white'
                                        : 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-700'
                                    }`}
                            >
                                <metric.icon size={16} />
                                <span>{metric.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="h-[400px] w-full bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                Loading data...
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No data recorded for this metric in the last 30 days
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af' }}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af' }}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={activeMetric.color}
                                        strokeWidth={3}
                                        dot={{ fill: activeMetric.color, strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

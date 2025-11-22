'use client';

import { Home, Sprout, Tractor, ArrowRight, X } from 'lucide-react';
import type { Category, RecurringFrequency } from '../types';

export interface MaintenanceTemplate {
    title: string;
    category: 'home' | 'property' | 'farm';
    frequency: 'quarterly' | 'bi-annual' | 'seasonal' | 'annual';
    interval?: number;
    seasonalMonths?: number[];
    specificMonth?: number;
    description?: string;
}

const TEMPLATES: MaintenanceTemplate[] = [
    // Home Templates
    {
        title: 'Change HVAC Filters',
        category: 'home',
        frequency: 'quarterly',
        description: 'Replace air filters to maintain system efficiency'
    },
    {
        title: 'Test Smoke Detectors',
        category: 'home',
        frequency: 'bi-annual',
        seasonalMonths: [3, 9], // March, September
        description: 'Test batteries and functionality'
    },
    {
        title: 'Clean Dryer Vent',
        category: 'home',
        frequency: 'annual',
        specificMonth: 1, // January
        description: 'Remove lint buildup to prevent fire hazards'
    },
    {
        title: 'Inspect Fire Extinguishers',
        category: 'home',
        frequency: 'annual',
        specificMonth: 6, // June
        description: 'Check pressure gauges and expiration dates'
    },

    // Property Templates
    {
        title: 'Clean Gutters',
        category: 'property',
        frequency: 'bi-annual',
        seasonalMonths: [4, 10], // April, October
        description: 'Remove leaves and debris'
    },
    {
        title: 'Winterize Sprinklers',
        category: 'property',
        frequency: 'annual',
        specificMonth: 10, // October
        description: 'Blow out lines to prevent freezing'
    },
    {
        title: 'Pressure Wash Deck/Patio',
        category: 'property',
        frequency: 'annual',
        specificMonth: 5, // May
        description: 'Clean surfaces before summer season'
    },
    {
        title: 'Lawn Fertilization',
        category: 'property',
        frequency: 'seasonal',
        seasonalMonths: [3, 5, 9, 10], // Mar, May, Sep, Oct
        description: 'Apply seasonal fertilizer'
    },

    // Farm Templates
    {
        title: 'Inspect Fences',
        category: 'farm',
        frequency: 'quarterly',
        description: 'Walk perimeter and check for damage'
    },
    {
        title: 'Service Tractor',
        category: 'farm',
        frequency: 'annual',
        specificMonth: 2, // February
        description: 'Oil change, filters, and general inspection'
    },
    {
        title: 'Test Well Water',
        category: 'farm',
        frequency: 'annual',
        specificMonth: 8, // August
        description: 'Submit sample for quality testing'
    },
    {
        title: 'Clean Barn/Coop',
        category: 'farm',
        frequency: 'seasonal',
        seasonalMonths: [3, 6, 9, 12], // Quarterly but specific
        description: 'Deep clean and sanitize animal housing'
    }
];

interface MaintenanceTemplatesProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: MaintenanceTemplate) => void;
}

export function MaintenanceTemplates({ isOpen, onClose, onSelectTemplate }: MaintenanceTemplatesProps) {
    if (!isOpen) return null;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'home': return <Home size={18} className="text-orange-400" />;
            case 'property': return <Sprout size={18} className="text-teal-400" />;
            case 'farm': return <Tractor size={18} className="text-amber-400" />;
            default: return null;
        }
    };

    const getFrequencyText = (template: MaintenanceTemplate) => {
        switch (template.frequency) {
            case 'quarterly': return 'Quarterly';
            case 'bi-annual': return 'Twice a Year';
            case 'seasonal': return 'Seasonal';
            case 'annual': return 'Once a Year';
            default: return template.frequency;
        }
    };

    const groupedTemplates = {
        home: TEMPLATES.filter(t => t.category === 'home'),
        property: TEMPLATES.filter(t => t.category === 'property'),
        farm: TEMPLATES.filter(t => t.category === 'farm')
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Maintenance Templates</h2>
                        <p className="text-sm text-gray-400">Quickly add common maintenance tasks</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Home Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-orange-400 font-medium mb-2">
                                <Home size={20} />
                                <h3>Home</h3>
                            </div>
                            {groupedTemplates.home.map((template, idx) => (
                                <TemplateCard
                                    key={idx}
                                    template={template}
                                    onSelect={onSelectTemplate}
                                />
                            ))}
                        </div>

                        {/* Property Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-teal-400 font-medium mb-2">
                                <Sprout size={20} />
                                <h3>Property</h3>
                            </div>
                            {groupedTemplates.property.map((template, idx) => (
                                <TemplateCard
                                    key={idx}
                                    template={template}
                                    onSelect={onSelectTemplate}
                                />
                            ))}
                        </div>

                        {/* Farm Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-400 font-medium mb-2">
                                <Tractor size={20} />
                                <h3>Farm</h3>
                            </div>
                            {groupedTemplates.farm.map((template, idx) => (
                                <TemplateCard
                                    key={idx}
                                    template={template}
                                    onSelect={onSelectTemplate}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TemplateCard({ template, onSelect }: { template: MaintenanceTemplate, onSelect: (t: MaintenanceTemplate) => void }) {
    return (
        <button
            onClick={() => onSelect(template)}
            className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-lg p-4 transition-all group"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white group-hover:text-orange-400 transition-colors">
                    {template.title}
                </h4>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
            </div>
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {template.description}
            </p>
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 rounded bg-gray-700 text-gray-300">
                    {template.frequency === 'quarterly' ? 'Quarterly' :
                        template.frequency === 'bi-annual' ? 'Bi-annual' :
                            template.frequency === 'seasonal' ? 'Seasonal' : 'Annual'}
                </span>
            </div>
        </button>
    );
}

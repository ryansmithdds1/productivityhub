'use client';


import { Apple, ExternalLink } from 'lucide-react';

export default function DietTrackerPage() {
    const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1pRsOYo9aL0IweSM5HppbS8qpX8Rcp7R-Kp0n6aN2zsM/edit?usp=sharing';
    const embedUrl = 'https://docs.google.com/spreadsheets/d/1pRsOYo9aL0IweSM5HppbS8qpX8Rcp7R-Kp0n6aN2zsM/edit?usp=sharing&widget=true&headers=false';

    return (
        <>
            <div className="h-full flex flex-col">
                {/* Header */}
                <header className="bg-gray-900 border-b border-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <Apple className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Diet Tracker</h1>
                                <p className="text-sm text-gray-400 mt-0.5">Track your nutrition and macros</p>
                            </div>
                        </div>
                        <a
                            href={spreadsheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                        >
                            <ExternalLink size={16} />
                            Open in Google Sheets
                        </a>
                    </div>
                </header>

                {/* Embedded Spreadsheet */}
                <div className="flex-1 bg-gray-950 p-4">
                    <div className="h-full bg-white rounded-lg overflow-hidden shadow-2xl">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full border-0"
                            title="Diet Tracker Spreadsheet"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

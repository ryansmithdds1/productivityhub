'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <Sidebar />
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <main className="flex-1 md:ml-64 w-full">
                {children}
            </main>
        </div>
    );
}

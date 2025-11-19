'use client';

import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-950 flex">
            <Sidebar />
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
}

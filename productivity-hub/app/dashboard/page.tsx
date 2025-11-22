import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

import { DashboardLayout } from '@/app/components/DashboardLayout';
import { TodoDashboardWidget } from '@/app/components/TodoDashboardWidget';
import { YouTubeStats } from '@/app/components/YouTubeStats';
import { YouTubeLatestVideos } from '@/app/components/YouTubeLatestVideos';
import { RoutineGrid } from '@/app/components/RoutineGrid';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="px-8 py-6">
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-1">Welcome back, {session.user?.name}</p>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-8 space-y-8">
                {/* Today's Tasks */}
                <TodoDashboardWidget />

                {/* Daily Routines */}
                <RoutineGrid />

                {/* YouTube Stats */}
                <YouTubeStats
                    channelId="UCH8ogybb7nap82QuKpnpbZg"
                    apiKey="AIzaSyC8OSuZfHmCrjbH8RIPG-fM7Oq1kho7q_4"
                />

                {/* Latest Videos */}
                <YouTubeLatestVideos
                    channelId="UCH8ogybb7nap82QuKpnpbZg"
                    apiKey="AIzaSyC8OSuZfHmCrjbH8RIPG-fM7Oq1kho7q_4"
                />
            </div>
        </DashboardLayout>
    );
}

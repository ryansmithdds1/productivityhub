import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

import { DashboardLayout } from '@/app/components/DashboardLayout';
import { YouTubeStats } from '@/app/components/YouTubeStats';
import { SocialStatCard } from '@/app/components/SocialStatCard';
import { YouTubeLatestVideos } from '@/app/components/YouTubeLatestVideos';

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
                {/* Social Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <YouTubeStats
                        channelId="UCH8ogybb7nap82QuKpnpbZg"
                        apiKey="AIzaSyC8OSuZfHmCrjbH8RIPG-fM7Oq1kho7q_4"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SocialStatCard
                            platform="instagram"
                            username="ryansmithdds"
                            initialFollowers="12.5K"
                            color="text-pink-500"
                        />
                        <SocialStatCard
                            platform="tiktok"
                            username="ryansmithdds"
                            initialFollowers="45.2K"
                            color="text-cyan-400"
                        />
                    </div>
                </div>

                {/* Latest Videos */}
                <YouTubeLatestVideos
                    channelId="UCH8ogybb7nap82QuKpnpbZg"
                    apiKey="AIzaSyC8OSuZfHmCrjbH8RIPG-fM7Oq1kho7q_4"
                />
            </div>
        </DashboardLayout>
    );
}

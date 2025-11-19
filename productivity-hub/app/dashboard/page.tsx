import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { apps } from '@/lib/apps-registry';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

import { YouTubeStats } from '@/app/components/YouTubeStats';
import { SocialStatCard } from '@/app/components/SocialStatCard';
import { YouTubeLatestVideos } from '@/app/components/YouTubeLatestVideos';
import { Instagram, Music2 } from 'lucide-react';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Ryan's Productivity Hub</h1>
                        <p className="text-sm text-gray-400">Welcome back, {session.user?.name}</p>
                    </div>

                    <Link
                        href="/api/auth/signout"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Social Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                            icon={Instagram}
                        />
                        <SocialStatCard
                            platform="tiktok"
                            username="ryansmithdds"
                            initialFollowers="45.2K"
                            color="text-cyan-400"
                            icon={Music2}
                        />
                    </div>
                </div>

                {/* Latest Videos */}
                <div className="mb-12">
                    <YouTubeLatestVideos
                        channelId="UCH8ogybb7nap82QuKpnpbZg"
                        apiKey="AIzaSyC8OSuZfHmCrjbH8RIPG-fM7Oq1kho7q_4"
                    />
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Your Apps</h2>
                    <p className="text-gray-400">Select an app to get started</p>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => {
                        const Icon = app.icon;
                        return (
                            <Link
                                key={app.id}
                                href={app.route}
                                className={`bg-gradient-to-br ${app.gradient} border rounded-xl p-6 hover:scale-105 transition-all duration-200 group`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 bg-gray-900/50 rounded-lg ${app.color}`}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                            {app.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {app.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-800/50">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {app.category}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Total Apps</h3>
                        <p className="text-3xl font-bold text-white">{apps.length}</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Categories</h3>
                        <p className="text-3xl font-bold text-white">4</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                        <p className="text-lg font-semibold text-green-400">✓ All Systems Operational</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

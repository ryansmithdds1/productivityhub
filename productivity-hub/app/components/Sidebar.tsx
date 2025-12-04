'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Zap, Settings, User, LogOut, ListTodo, Users, ExternalLink, Dumbbell, Apple, Heart, Search, Folder, Instagram, TrendingUp, Flame, Headphones, Lightbulb, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    name: string;
    href: string;
    icon: any;
    badge?: string;
    disabled?: boolean;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'To-Do List', href: '/apps/todo', icon: ListTodo },
    { name: 'Weekly Planning', href: '/apps/weekly-planning', icon: Calendar },
    { name: 'Content Calendar', href: '/apps/content-calendar', icon: Calendar },
    { name: 'Short Video Creator', href: '/apps/hookpoint', icon: Zap },
    { name: 'YouTube Research', href: '/apps/youtube-research', icon: Youtube },
    { name: 'Workout Tracker', href: '/apps/workout', icon: Dumbbell },
    { name: 'Diet Tracker', href: '/apps/diet', icon: Apple },
    { name: 'Habit Heatmap', href: '/apps/habits', icon: Flame },
    { name: 'Deep Work', href: '/apps/focus', icon: Headphones },
    { name: 'Brainstormer', href: '/apps/brainstorm', icon: Lightbulb },
    { name: 'Mission Files', href: '/apps/drive', icon: Folder },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">R</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors">
                            Ryan's Hub
                        </h1>
                        <p className="text-xs text-gray-500">Productivity Suite</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        const Icon = item.icon;

                        if (item.disabled) {
                            return (
                                <div
                                    key={item.name}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 cursor-not-allowed"
                                >
                                    <Icon size={20} />
                                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                                    {item.badge && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                                    isActive
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                )}
                            >
                                <Icon size={20} />
                                <span className="flex-1 text-sm font-medium">{item.name}</span>
                                {item.badge && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Helpful Links */}
                <div className="mt-8">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Helpful Links
                    </h3>
                    <div className="space-y-1">
                        <a
                            href="https://app.editingmachine.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
                        >
                            <Users size={20} className="group-hover:text-blue-400 transition-colors" />
                            <span className="flex-1 text-sm font-medium">Editing Team</span>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a
                            href="https://benefits.dmba.com/suite/sites/emed"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
                        >
                            <Heart size={20} className="group-hover:text-pink-400 transition-colors" />
                            <span className="flex-1 text-sm font-medium">Emed</span>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a
                            href="https://inq.crm.dynamics.com/main.aspx?appid=5071990d-4de3-ec11-bb3d-0022482ea9aa&forceUCI=1&pagetype=entitylist&etn=inq_missionary&viewid=7b560690-3bed-47c8-9bb7-97e746b6d562&viewType=1039"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
                        >
                            <Search size={20} className="group-hover:text-yellow-400 transition-colors" />
                            <span className="flex-1 text-sm font-medium">Inquiry</span>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a
                            href="https://assistant.ascendviral.com/dashboard/ryansmithdds"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
                        >
                            <Instagram size={20} className="group-hover:text-pink-500 transition-colors" />
                            <span className="flex-1 text-sm font-medium">Instagram Growth</span>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a
                            href="https://app.highsocial.com/dashboard/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
                        >
                            <TrendingUp size={20} className="group-hover:text-cyan-400 transition-colors" />
                            <span className="flex-1 text-sm font-medium">TikTok Growth</span>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-800 space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                >
                    <Settings size={20} />
                    <span className="text-sm font-medium">Settings</span>
                </Link>
                <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Sign Out</span>
                </Link>
            </div>
        </div>
    );
}

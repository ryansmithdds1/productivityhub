import { useState } from 'react';
import { Home, Lightbulb, Settings, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
    children: React.ReactNode;
    currentPage: 'dashboard' | 'library' | 'editor';
    onNavigate: (page: 'dashboard' | 'library' | 'editor') => void;
    onOpenSettings: () => void;
}

export function Layout({ children, currentPage, onNavigate, onOpenSettings }: LayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard' as const, icon: Home, label: 'Dashboard' },
        { id: 'library' as const, icon: Lightbulb, label: 'Hook Library' },
    ];

    return (
        <div className="min-h-screen bg-gray-950 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 border-r border-gray-800">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                        HookPoint
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Viral Shorts Planner</p>
                </div>

                <nav className="flex-1 px-3">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all',
                                currentPage === item.id
                                    ? 'bg-brand-500/10 text-brand-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-800">
                    <button
                        onClick={onOpenSettings}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all"
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                        HookPoint
                    </h1>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-gray-400 hover:text-gray-200"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="bg-gray-900 border-t border-gray-800 p-4 animate-slide-up">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all',
                                    currentPage === item.id
                                        ? 'bg-brand-500/10 text-brand-400'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                )}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                onOpenSettings();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all"
                        >
                            <Settings size={20} />
                            <span className="font-medium">Settings</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 md:mt-0 mt-16">
                {children}
            </main>
        </div>
    );
}

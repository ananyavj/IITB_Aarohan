import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, User, BookOpen, Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useSyncManager } from '@/hooks/useSyncManager';

interface AppShellProps {
    children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
    const location = useLocation();
    const { status, pendingCount, isOnline, triggerSync } = useSyncManager();

    const navItems = [
        { path: '/auth', label: 'Auth', icon: User },
        { path: '/student', label: 'Student', icon: GraduationCap },
        { path: '/teacher', label: 'Teacher', icon: BookOpen },
    ];

    // Helper to render sync icon
    const renderSyncIcon = () => {
        if (!isOnline) return <CloudOff className="w-5 h-5 text-gray-400" />;
        if (status === 'syncing') return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
        if (status === 'error') return <AlertCircle className="w-5 h-5 text-red-400" />;
        if (pendingCount > 0) return (
            <div className="relative">
                <Cloud className="w-5 h-5 text-yellow-400" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white font-bold">
                    {pendingCount}
                </span>
            </div>
        );
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="bg-primary-600 text-white shadow-lg z-20">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold">EduApp</h1>

                    {/* Sync Status Indicator */}
                    <button
                        onClick={triggerSync}
                        disabled={!isOnline || status === 'syncing'}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-xs font-medium backdrop-blur-sm"
                    >
                        {renderSyncIcon()}
                        <span className="hidden sm:inline">
                            {!isOnline ? 'Offline' :
                                status === 'syncing' ? 'Syncing...' :
                                    status === 'error' ? 'Sync Error' :
                                        pendingCount > 0 ? `${pendingCount} Pending` : 'Synced'}
                        </span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex justify-around">
                        {navItems.map(({ path, label, icon: Icon }) => {
                            const isActive = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors ${isActive
                                        ? 'text-primary-600'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                                        }`}
                                >
                                    <Icon className="w-6 h-6 mb-1" />
                                    <span className="text-xs font-medium">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default AppShell;

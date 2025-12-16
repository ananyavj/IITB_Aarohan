import { useState } from 'react';
import { Home, BookOpen, Brain, FileText, Calendar, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StudentHomeScreen from './StudentHomeScreen';
import LearnScreen from './LearnScreen';
import PracticeScreen from './PracticeScreen';
import NotesScreen from './NotesScreen';
import CalendarScreen from './CalendarScreen';
import StudentProfileScreen from './StudentProfileScreen';

const StudentDashboard = () => {
    const { activeTab, setActiveTab } = useAppStore();

    const tabs = [
        { id: 'home', label: 'Home', icon: Home, component: StudentHomeScreen },
        { id: 'learn', label: 'Learn', icon: BookOpen, component: LearnScreen },
        { id: 'practice', label: 'Practice', icon: Brain, component: PracticeScreen },
        { id: 'notes', label: 'Notes', icon: FileText, component: NotesScreen },
        { id: 'calendar', label: 'Calendar', icon: Calendar, component: CalendarScreen },
        { id: 'profile', label: 'Profile', icon: User, component: StudentProfileScreen },
    ];

    const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || StudentHomeScreen;

    return (
        <div className="flex flex-col h-screen">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <ActiveComponent />
            </main>

            {/* Bottom Navigation */}
            <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex justify-around">
                    {tabs.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors ${isActive
                                    ? 'text-primary-600'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                                    }`}
                            >
                                <Icon className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default StudentDashboard;

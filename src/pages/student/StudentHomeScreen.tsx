import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, FileText, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useBooksByClass } from '@/hooks/useContent';
import { Card } from '@/components/ui';
import { getStudentStats } from '@/repositories/statsRepository';

const StudentHomeScreen = () => {
    const navigate = useNavigate();
    const { userProfile, setActiveTab } = useAppStore();

    // Get books for the user's class
    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;
    const books = useBooksByClass(classLevel);

    const [stats, setStats] = useState({
        chaptersCompleted: 0,
        totalStudyTime: 0
    });

    // Fetch stats
    useEffect(() => {
        const loadStats = async () => {
            // TODO: Get actual userId from auth
            const s = await getStudentStats(1);
            setStats(s);
        };
        loadStats();
    }, []);

    // Calculate level progress (simple mock formula for now)
    // Assuming 5 chapters per level
    const currentLevel = Math.floor(stats.chaptersCompleted / 5) + 1;
    const chaptersInCurrentLevel = stats.chaptersCompleted % 5;
    const progress = (chaptersInCurrentLevel / 5) * 100;

    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (progress / 100) * circumference;

    const tiles = [
        { id: 'learn', label: 'Learn', icon: BookOpen, color: 'bg-blue-500' },
        { id: 'practice', label: 'Practice', icon: Brain, color: 'bg-purple-500' },
        { id: 'notes', label: 'Notes', icon: FileText, color: 'bg-green-500' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'bg-orange-500' },
    ];

    const handleTileClick = (id: string) => {
        setActiveTab(id);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24">
            {/* Greeting */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Hello, {userProfile.name || 'Student'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Ready to continue your learning journey?
                </p>
            </div>

            {/* Progress Ring Card */}
            <Card
                className="mb-8 p-6 cursor-pointer transform hover:scale-[1.02] transition-all"
                onClick={() => navigate('/student/progress')}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Level {currentLevel}</h2>
                    <span className="text-sm text-primary-600 font-bold">View Full Progress &rarr;</span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Ring */}
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="text-primary-600 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
                            <span className="text-xs text-gray-500">to Lvl {currentLevel + 1}</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.chaptersCompleted}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Chapters Done</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalStudyTime}h</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Study Time</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Tiles */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {tiles.map(({ id, label, icon: Icon, color }) => (
                    <button
                        key={id}
                        onClick={() => handleTileClick(id)}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-center group"
                    >
                        <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold">{label}</h3>
                    </button>
                ))}
            </div>

            {/* Books from Database */}
            {books && books.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Books</h2>
                    <div className="space-y-3">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <div className="flex items-center">
                                    <BookOpen className="w-8 h-8 mr-3 text-primary-600" />
                                    <div>
                                        <h3 className="font-semibold">{book.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Click to explore chapters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Loading state */}
            {!books && (
                <Card className="p-6">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        Loading books...
                    </p>
                </Card>
            )}
        </div>
    );
};

export default StudentHomeScreen;

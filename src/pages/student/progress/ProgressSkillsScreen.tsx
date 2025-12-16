import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Trophy, Clock, Target, Star, TrendingUp, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui';
import { getStudentStats, getSkillLevels, getWeeklyActivity } from '@/repositories/statsRepository';

const ProgressSkillsScreen = () => {
    const navigate = useNavigate();
    const { userProfile } = useAppStore();
    const userId = 1; // TODO: Get from auth

    // Stats State
    const [stats, setStats] = useState({
        totalStudyTime: 0,
        chaptersCompleted: 0,
        completedQuizzes: 0,
        averageQuizScore: 0,
        currentStreak: 0
    });

    const [skills, setSkills] = useState<any[]>([]);
    const [chartData, setChartData] = useState<{
        labels: string[],
        studyData: number[],
        quizData: number[]
    }>({ labels: [], studyData: [], quizData: [] });

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            if (!userId) return;

            try {
                const s = await getStudentStats(userId);
                setStats(s);

                const sk = await getSkillLevels(userId);
                setSkills(sk);

                const ch = await getWeeklyActivity(userId);
                setChartData(ch);
            } catch (err) {
                console.error("Failed to load stats", err);
            }
        };

        loadData();
    }, [userId]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="font-bold text-lg">My Progress</span>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                        <Trophy className="w-4 h-4" />
                        <span>Level {Math.floor(stats.chaptersCompleted / 2) + 1}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">

                {/* 1. Overall Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 flex flex-col items-center justify-center text-center bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mb-2 text-blue-600 dark:text-blue-300">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudyTime}h</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Study Time</p>
                    </Card>

                    <Card className="p-4 flex flex-col items-center justify-center text-center bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mb-2 text-green-600 dark:text-green-300">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.chaptersCompleted}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Chapters</p>
                    </Card>

                    <Card className="p-4 flex flex-col items-center justify-center text-center bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center mb-2 text-purple-600 dark:text-purple-300">
                            <Target className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageQuizScore}%</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
                    </Card>

                    <Card className="p-4 flex flex-col items-center justify-center text-center bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center mb-2 text-orange-600 dark:text-orange-300">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Day Streak</p>
                    </Card>
                </div>

                {/* 2. Skills Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Your Skills
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {skills.map((skill) => (
                            <Card key={skill.skill} className="p-5 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{skill.skill}</h3>
                                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">Lvl {skill.level}</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                            style={{ width: `${skill.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-right">{skill.progress}% to next level</p>
                                </div>
                                {/* Background decoration */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-full z-0 pointer-events-none" />
                            </Card>
                        ))}
                    </div>
                </div>

                {/* 3. Weekly Activity Chart (Simplified Visual) */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Weekly Activity
                    </h2>
                    <Card className="p-6">
                        <div className="h-48 flex items-end justify-between gap-2">
                            {chartData.studyData.map((value, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg relative h-full flex items-end overflow-hidden group">
                                        {/* Study Bar */}
                                        <div
                                            className="w-full bg-blue-500/80 hover:bg-blue-600 transition-all rounded-t-sm"
                                            style={{ height: `${Math.min(value * 2, 100)}%` }} // Scaling factor
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {value} mins
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">{chartData.labels[i]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                <span className="text-gray-600 dark:text-gray-400">Study Time</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProgressSkillsScreen;

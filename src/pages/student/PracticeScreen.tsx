import { useNavigate } from 'react-router-dom';
import { Brain, Trophy, TrendingUp, BookOpen, Play } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { getQuizHistory, calculateChapterPerformance } from '@/repositories/quizRepository';
import { db } from '@/db/db';

const PracticeScreen = () => {
    const navigate = useNavigate();
    const { userProfile } = useAppStore();

    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;

    // Debug logging
    console.log('[PracticeScreen] User Profile:', userProfile);
    console.log('[PracticeScreen] Class Level:', classLevel);

    // Get all chapters for current class (across all subjects)
    const allChapters = useLiveQuery(async () => {
        console.log('[PracticeScreen] Fetching chapters for class:', classLevel);
        if (!classLevel) {
            console.warn('[PracticeScreen] No class level set! Please select a class in your profile.');
            return [];
        }

        const classLevelRecord = await db.classLevels.where('level').equals(classLevel).first();
        console.log('[PracticeScreen] Found class level record:', classLevelRecord);
        if (!classLevelRecord) {
            console.warn('[PracticeScreen] No class level record found for:', classLevel);
            return [];
        }

        const books = await db.books.where('classLevelId').equals(classLevelRecord.id!).toArray();
        console.log('[PracticeScreen] Found books:', books.length);
        const bookIds = books.map(b => b.id!);

        const chapters = [];
        for (const bookId of bookIds) {
            const bookChapters = await db.chapters.where('bookId').equals(bookId).toArray();
            const book = books.find(b => b.id === bookId);

            for (const chapter of bookChapters) {
                const subject = await db.subjects.get(book!.subjectId);
                chapters.push({
                    ...chapter,
                    bookTitle: book!.title,
                    subjectName: subject?.name || 'Unknown'
                });
            }
        }

        console.log('[PracticeScreen] Total chapters found:', chapters.length);
        return chapters;
    }, [classLevel]);

    // Get quiz history
    const quizHistory = useLiveQuery(async () => {
        return await getQuizHistory(1, 5);
    }, []);

    // Get chapter performance for each chapter
    const chaptersWithPerformance = useLiveQuery(async () => {
        if (!allChapters) return [];

        const chaptersData = await Promise.all(
            allChapters.map(async (chapter) => {
                const performance = await calculateChapterPerformance(1, chapter.id!);
                return {
                    ...chapter,
                    performance
                };
            })
        );

        return chaptersData;
    }, [allChapters]);

    const handleStartQuiz = async (chapterId: number) => {
        // Check if questions exist for this chapter
        const { getQuestionsByChapter } = await import('@/repositories/quizRepository');
        const questions = await getQuestionsByChapter(chapterId);

        if (questions.length === 0) {
            alert('Quizzes for this chapter are coming soon! Check back later.');
            return;
        }

        navigate(`/student/practice/chapter/${chapterId}`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Brain className="w-8 h-8 text-primary-600" />
                    Practice & Quizzes
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Test your knowledge with adaptive practice quizzes
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                        <h3 className="font-semibold">Total Quizzes</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {quizHistory?.length || 0}
                    </p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        <h3 className="font-semibold">Average Score</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {quizHistory && quizHistory.length > 0
                            ? Math.round(
                                quizHistory
                                    .filter(q => q.score !== undefined)
                                    .reduce((sum, q) => sum + q.score!, 0) / quizHistory.length
                            )
                            : 0}%
                    </p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h3 className="font-semibold">Chapters Available</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {allChapters?.length || 0}
                    </p>
                </Card>
            </div>

            {/* Practice by Chapter */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Practice by Chapter</h2>

                {chaptersWithPerformance && chaptersWithPerformance.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {chaptersWithPerformance.map((chapter) => (
                            <Card key={chapter.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
                                            {chapter.subjectName}
                                        </div>
                                        <h3 className="font-semibold text-lg mb-1">{chapter.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {chapter.bookTitle}
                                        </p>
                                    </div>
                                </div>

                                {chapter.performance.totalQuizzes > 0 && (
                                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Best Score:</span>
                                            <span className="font-semibold text-green-600">
                                                {chapter.performance.bestScore}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-1">
                                            <span className="text-gray-600 dark:text-gray-400">Attempts:</span>
                                            <span className="font-semibold">
                                                {chapter.performance.totalQuizzes}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => handleStartQuiz(chapter.id!)}
                                    className="w-full"
                                    variant={chapter.performance.totalQuizzes > 0 ? 'outline' : 'primary'}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {chapter.performance.totalQuizzes > 0 ? 'Practice Again' : 'Start Quiz'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            No chapters available for practice
                        </p>
                        <p className="text-sm text-gray-500">
                            Make sure you've selected a class in your profile
                        </p>
                    </Card>
                )}
            </div>

            {/* Recent Activity */}
            {quizHistory && quizHistory.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                    <Card className="divide-y divide-gray-200 dark:divide-gray-700">
                        {quizHistory.map((session) => (
                            <div key={session.id} className="p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-medium">Quiz #{session.id}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {session.completedAt
                                            ? new Date(session.completedAt).toLocaleDateString()
                                            : 'In progress'}
                                    </p>
                                </div>
                                {session.score !== undefined && (
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary-600">
                                            {session.score}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PracticeScreen;

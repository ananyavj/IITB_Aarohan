import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle2, Clock } from 'lucide-react';
import { useChaptersByBook } from '@/hooks/useContent';
import { useChapterProgress } from '@/hooks/useStudyTracking';
import { Card, Button } from '@/components/ui';
import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';

const ChapterProgressRing = ({ progress }: { progress: number }) => {
    const circumference = 2 * Math.PI * 20;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-primary-600"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{progress}%</span>
            </div>
        </div>
    );
};

const ChapterCard = ({ chapter }: { chapter: any }) => {
    const navigate = useNavigate();
    const progress = useChapterProgress(chapter.id) || 0;

    return (
        <Card className="hover:shadow-lg transition-all">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center mb-2">
                            <span className="text-sm font-semibold text-primary-600 mr-2">
                                Chapter {chapter.order}
                            </span>
                            {progress === 100 && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{chapter.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>~15 min read</span>
                        </div>
                    </div>
                    <ChapterProgressRing progress={progress} />
                </div>

                <Button
                    onClick={() => navigate(`/student/learn/chapter/${chapter.id}`)}
                    className="w-full"
                    variant={progress > 0 ? 'secondary' : 'primary'}
                >
                    {progress === 0 ? (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                        </>
                    ) : progress === 100 ? (
                        'Review'
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>
        </Card>
    );
};

const ChapterListScreen = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const navigate = useNavigate();

    const chapters = useChaptersByBook(bookId ? parseInt(bookId) : undefined);

    const book = useLiveQuery(async () => {
        if (!bookId) return null;
        return await db.books.get(parseInt(bookId));
    }, [bookId]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold">{book?.title || 'Loading...'}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {chapters?.length || 0} chapters
                    </p>
                </div>
            </div>

            {/* Chapters */}
            <div className="max-w-4xl mx-auto p-6">
                {chapters && chapters.length > 0 ? (
                    <div className="space-y-4">
                        {chapters.map((chapter) => (
                            <ChapterCard key={chapter.id} chapter={chapter} />
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            {chapters ? 'No chapters available' : 'Loading chapters...'}
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ChapterListScreen;

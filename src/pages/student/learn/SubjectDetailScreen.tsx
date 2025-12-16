import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, Button } from '@/components/ui';
import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';

const SubjectDetailScreen = () => {
    const { subjectName } = useParams<{ subjectName: string }>();
    const navigate = useNavigate();
    const { userProfile } = useAppStore();

    // Default to 10 if class is missing (fixes empty query issue)
    const classLevel = parseInt(userProfile.class || '10');

    // Get books for this subject and class
    const subjectBooks = useLiveQuery(async () => {
        if (!subjectName || !classLevel) return [];

        try {
            // Get the classLevel record
            const classLevelRecord = await db.classLevels.where('level').equals(classLevel).first();
            if (!classLevelRecord) return [];

            // Find subjects with matching name and classLevel
            const subjects = await db.subjects
                .where('classLevelId')
                .equals(classLevelRecord.id!)
                .and(s => s.name.toLowerCase() === subjectName.toLowerCase())
                .toArray();

            if (subjects.length === 0) return [];

            // Get books for these subjects
            const subjectIds = subjects.map(s => s.id!);
            const books = await db.books
                .where('classLevelId')
                .equals(classLevelRecord.id!)
                .toArray();

            const filteredBooks = books.filter(book => subjectIds.includes(book.subjectId));

            console.log('[SubjectDetail] Filtered books:', filteredBooks.length);

            // Check if books have chapters
            const booksWithChapters = await Promise.all(
                filteredBooks.map(async (book) => {
                    const chapters = await db.chapters.where('bookId').equals(book.id!).toArray();
                    console.log(`[SubjectDetail] Book "${book.title}" has ${chapters.length} chapters`);
                    return {
                        ...book,
                        hasChapters: chapters.length > 0,
                        chapterCount: chapters.length
                    };
                })
            );

            console.log('[SubjectDetail] Books with chapters:', booksWithChapters);
            return booksWithChapters;
        } catch (error) {
            console.error('Error fetching books:', error);
            return [];
        }
    }, [subjectName, classLevel]);

    const handleBookClick = (bookId: number, hasChapters: boolean) => {
        if (hasChapters) {
            navigate(`/student/learn/book/${bookId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/student/learn')}
                        className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Subjects
                    </button>
                    <h1 className="text-3xl font-bold capitalize">{subjectName}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Class {userProfile.class || '10'}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-6">
                {subjectBooks && subjectBooks.length > 0 ? (
                    <div className="space-y-4">
                        {subjectBooks.map((book) => (
                            <Card
                                key={book.id}
                                className={`${book.hasChapters ? 'cursor-pointer hover:shadow-lg' : 'opacity-75'} transition-all`}
                                onClick={() => handleBookClick(book.id!, book.hasChapters)}
                            >
                                <div className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${book.hasChapters ? 'bg-primary-100 dark:bg-primary-900' : 'bg-gray-200 dark:bg-gray-700'
                                            }`}>
                                            {book.hasChapters ? (
                                                <BookOpen className="w-6 h-6 text-primary-600" />
                                            ) : (
                                                <Clock className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{book.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {book.hasChapters
                                                    ? `${book.chapterCount} chapters available`
                                                    : 'Coming Soon'}
                                            </p>
                                        </div>
                                    </div>
                                    {book.hasChapters && (
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Content Coming Soon</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We're working on adding content for this subject.
                        </p>
                        <div className="flex flex-col items-center gap-3">
                            <Button onClick={() => navigate('/student/learn')}>
                                Back to Subjects
                            </Button>
                            <button
                                onClick={async () => {
                                    if (confirm('This will reset all content to fix missing chapters. Continue?')) {
                                        await db.delete();
                                        window.location.reload();
                                    }
                                }}
                                className="text-sm text-red-500 hover:text-red-600 underline"
                            >
                                Missing Content? Click here to Repair
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectDetailScreen;

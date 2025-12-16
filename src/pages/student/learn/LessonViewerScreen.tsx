import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Notebook, Plus, Bot, GitBranch } from 'lucide-react';
import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Skeleton } from '@/components/ui';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteCard from '@/components/notes/NoteCard';
import SummaryPanel from '@/components/ai/SummaryPanel';
import MindMapPanel from '@/components/ai/MindMapPanel';
import { useNotesByChapter } from '@/hooks/useNotes';
import { createNote, updateNote, deleteNote } from '@/repositories/noteRepository';
import type { Note } from '@/db/db';

// SAFE MODE LESSON VIEWER (Enhanced + Notes + AI)
const LessonViewerScreen = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'summary' | 'mindmap'>('content');
    const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

    // Data fetching
    const chapter = useLiveQuery(async () => {
        if (!chapterId) return null;
        return await db.chapters.get(parseInt(chapterId));
    }, [chapterId]);

    const sections = useLiveQuery(async () => {
        if (!chapterId) return [];
        return await db.sections.where('chapterId').equals(parseInt(chapterId)).sortBy('order');
    }, [chapterId]);

    const hasQuiz = useLiveQuery(async () => {
        if (!chapterId) return false;
        const questions = await db.questions.where('chapterId').equals(parseInt(chapterId)).count();
        return questions > 0;
    }, [chapterId]);

    const notes = useNotesByChapter(chapterId ? parseInt(chapterId) : undefined);

    // Note handlers
    const handleSaveNote = async (noteData: any) => {
        if (editingNote) {
            await updateNote(editingNote.id!, noteData);
        } else {
            await createNote(noteData);
        }
        setIsNoteEditorOpen(false);
        setEditingNote(undefined);
    };

    const handleDeleteNote = async (noteId: number) => {
        if (confirm('Delete this note?')) {
            await deleteNote(noteId);
        }
    };

    // Loading state
    if (!chapterId) return <div className="p-10 text-center text-red-500">Invalid Chapter ID</div>;
    if (!chapter || !sections) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 p-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between mb-4">
                    <Skeleton className="w-16 h-6" /> {/* Back */}
                    <Skeleton className="w-48 h-6" /> {/* Title */}
                    <div className="w-16"></div>
                </div>
                <div className="flex gap-4 max-w-3xl mx-auto border-t pt-2">
                    <Skeleton className="w-24 h-8" />
                    <Skeleton className="w-24 h-8" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="w-full h-48 rounded-2xl" /> {/* Hero */}
                <div className="space-y-4">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                </div>
            </div>
        </div>
    );

    const intChapterId = parseInt(chapterId);
    // TODO: Get real userId
    const userId = 1;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Sticky Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                <div className="p-4 max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="font-medium">Back</span>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[60%] text-center">
                        {chapter ? chapter.title : '...'}
                    </h1>
                    <div className="w-16"></div> {/* Spacer for centering */}
                </div>

                {/* Tabs */}
                <div className="flex border-t border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
                    <TabButton
                        id="content"
                        label="Lesson"
                        icon={BookOpen}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="notes"
                        label={`Notes ${notes && notes.length > 0 ? `(${notes.length})` : ''}`}
                        icon={Notebook}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="summary"
                        label="AI Summary"
                        icon={Bot}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                    <TabButton
                        id="mindmap"
                        label="Mind Map"
                        icon={GitBranch}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-3xl mx-auto p-4 md:p-8">
                {activeTab === 'content' && (
                    !sections || sections.length === 0 ? (
                        <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Content Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                The content for this chapter is being prepared. Please check back later!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Chapter Hero */}
                            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg mb-10">
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm mb-4">
                                    Chapter {chapter?.id}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                    {chapter?.title}
                                </h2>
                                <p className="text-primary-100 text-lg leading-relaxed opacity-90">
                                    {sections[0]?.content.substring(0, 150)}...
                                </p>
                            </div>

                            {sections.map((section, index) => (
                                <section key={section.id} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-shadow">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {section.title}
                                        </h3>
                                    </div>
                                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white leading-relaxed">
                                        {section.content.split('\n').map((paragraph, i) => (
                                            paragraph.trim() && <p key={i} className="mb-4">{paragraph}</p>
                                        ))}
                                    </div>
                                </section>
                            ))}

                            {/* Quiz Call to Action */}
                            <div className="mt-12 p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
                                <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
                                    Ready to test your knowledge?
                                </h3>
                                <p className="text-indigo-700 dark:text-indigo-300 mb-8 max-w-md mx-auto">
                                    Take a quick quiz to verify what you've learned in this chapter.
                                </p>
                                <button
                                    onClick={() => navigate(`/student/practice/chapter/${chapterId}`)}
                                    disabled={!hasQuiz}
                                    className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${hasQuiz
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {hasQuiz ? 'Start Quiz Now' : 'Quiz Coming Soon'}
                                </button>
                            </div>
                        </div>
                    )
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Notes</h2>
                            <button
                                onClick={() => {
                                    setEditingNote(undefined);
                                    setIsNoteEditorOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Note</span>
                            </button>
                        </div>

                        {notes === undefined ? (
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <Notebook className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No notes yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Create notes to remember key concepts.</p>
                                <button
                                    onClick={() => setIsNoteEditorOpen(true)}
                                    className="px-6 py-2 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition-colors"
                                >
                                    Create First Note
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {notes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onEdit={(n) => {
                                            setEditingNote(n);
                                            setIsNoteEditorOpen(true);
                                        }}
                                        onDelete={() => handleDeleteNote(note.id!)}
                                        showNavigation={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'summary' && (
                    <SummaryPanel lessonId={intChapterId} userId={userId} />
                )}

                {activeTab === 'mindmap' && (
                    <MindMapPanel chapterId={intChapterId} userId={userId} />
                )}
            </div>

            {/* Note Editor Modal */}
            <NoteEditor
                isOpen={isNoteEditorOpen}
                onClose={() => setIsNoteEditorOpen(false)}
                onSave={handleSaveNote}
                note={editingNote}
                chapterId={intChapterId}
                sectionId={sections && sections.length > 0 ? sections[0].id! : 0}
            />
        </div>
    );
};

// Helper component for Tab Buttons
const TabButton = ({ id, label, icon: Icon, activeTab, onClick }: any) => (
    <button
        onClick={() => onClick(id)}
        className={`flex-1 min-w-[100px] py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors whitespace-nowrap px-2 ${activeTab === id
            ? 'border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

export default LessonViewerScreen;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useAllNotes } from '@/hooks/useNotes';
import { updateNote, deleteNote } from '@/repositories/noteRepository';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteCard from '@/components/notes/NoteCard';
import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Note } from '@/db/db';

const NotesScreen = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'math' | 'science' | 'english'>('all');
    const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | undefined>();

    const allNotes = useAllNotes();

    // Get chapter details for each note
    const notesWithContext = useLiveQuery(async () => {
        if (!allNotes) return [];

        const notesWithDetails = await Promise.all(
            allNotes.map(async (note) => {
                const section = await db.sections.get(note.sectionId);
                const chapter = section ? await db.chapters.get(section.chapterId) : null;
                const book = chapter ? await db.books.get(chapter.bookId) : null;
                const subject = book ? await db.subjects.get(book.subjectId) : null;

                return {
                    ...note,
                    sectionTitle: section?.title,
                    chapterTitle: chapter?.title,
                    bookTitle: book?.title,
                    subjectName: subject?.name,
                };
            })
        );

        return notesWithDetails;
    }, [allNotes]);

    // Filter notes
    const filteredNotes = notesWithContext?.filter((note) => {
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesContent = note.content.toLowerCase().includes(query);
            const matchesTags = note.tags?.some(tag => tag.toLowerCase().includes(query));
            const matchesChapter = note.chapterTitle?.toLowerCase().includes(query);

            if (!matchesContent && !matchesTags && !matchesChapter) {
                return false;
            }
        }

        // Filter by subject
        if (filter !== 'all') {
            const subjectMatch = note.subjectName?.toLowerCase() === filter.toLowerCase();
            if (!subjectMatch) return false;
        }

        return true;
    });

    const handleEditNote = (note: Note) => {
        setEditingNote(note);
        setIsNoteEditorOpen(true);
    };

    const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingNote) {
            await updateNote(editingNote.id!, { content: noteData.content, tags: noteData.tags });
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (confirm('Are you sure you want to delete this note?')) {
            await deleteNote(noteId);
            if (editingNote?.id === noteId) {
                setIsNoteEditorOpen(false);
                setEditingNote(undefined);
            }
        }
    };

    const handleNavigateToSection = (note: any) => {
        // Navigate to the chapter containing this note
        navigate(`/student/learn/chapter/${note.chapterId}`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Notes</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    All your study notes in one place
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notes, tags, or chapters..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        All Notes
                    </button>
                    <button
                        onClick={() => setFilter('math')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'math'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Mathematics
                    </button>
                    <button
                        onClick={() => setFilter('science')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'science'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Science
                    </button>
                    <button
                        onClick={() => setFilter('english')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'english'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        English
                    </button>
                </div>
            </div>

            {/* Notes Count */}
            {filteredNotes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Showing {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </p>
            )}

            {/* Notes List */}
            {filteredNotes && filteredNotes.length > 0 ? (
                <div className="space-y-4">
                    {filteredNotes.map((note) => (
                        <div key={note.id} className="space-y-2">
                            {/* Context Info */}
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{note.bookTitle}</span>
                                {' → '}
                                <span>{note.chapterTitle}</span>
                                {' → '}
                                <span className="text-xs">{note.sectionTitle}</span>
                            </div>

                            <NoteCard
                                note={note}
                                onEdit={handleEditNote}
                                onDelete={handleDeleteNote}
                                onNavigate={() => handleNavigateToSection(note)}
                                showNavigation={true}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {searchQuery || filter !== 'all'
                            ? 'No notes match your search'
                            : 'No notes yet. Start taking notes while reading!'}
                    </p>
                    {!searchQuery && filter === 'all' && (
                        <p className="text-sm text-gray-500">
                            Notes will appear here as you create them in the lesson viewer.
                        </p>
                    )}
                </div>
            )}

            {/* Note Editor Modal */}
            {editingNote && (
                <NoteEditor
                    isOpen={isNoteEditorOpen}
                    onClose={() => {
                        setIsNoteEditorOpen(false);
                        setEditingNote(undefined);
                    }}
                    onSave={handleSaveNote}
                    onDelete={() => editingNote && handleDeleteNote(editingNote.id!)}
                    note={editingNote}
                    chapterId={editingNote.chapterId}
                    sectionId={editingNote.sectionId}
                />
            )}
        </div>
    );
};

export default NotesScreen;

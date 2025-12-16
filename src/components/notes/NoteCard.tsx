import { formatDistanceToNow } from 'date-fns';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui';
import type { Note } from '@/db/db';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (noteId: number) => void;
    onNavigate?: () => void;
    showNavigation?: boolean;
}

const NoteCard = ({ note, onEdit, onDelete, onNavigate, showNavigation = false }: NoteCardProps) => {
    const formatDate = (date: Date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'recently';
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <div className="p-4">
                {/* Note Content */}
                <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap">
                    {note.content}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {note.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center gap-2">
                        <span>{formatDate(note.createdAt)}</span>
                        {note.syncStatus === 'pending' && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs">
                                Pending sync
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {showNavigation && onNavigate && (
                            <button
                                onClick={onNavigate}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Go to section"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => onEdit(note)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit note"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(note.id!)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete note"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default NoteCard;

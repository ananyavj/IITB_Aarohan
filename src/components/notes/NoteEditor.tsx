import { useState, useEffect } from 'react';
import { X, Tag, Trash2 } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import type { Note } from '@/db/db';

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    note?: Note;
    chapterId: number;
    sectionId: number;
}

const NoteEditor = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    note,
    chapterId,
    sectionId,
}: NoteEditorProps) => {
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        if (note) {
            setContent(note.content);
            setTags(note.tags || []);
        } else {
            setContent('');
            setTags([]);
        }
    }, [note, isOpen]);

    const handleSave = () => {
        if (!content.trim()) return;

        const noteData = {
            content: content.trim(),
            chapterId,
            sectionId,
            userId: 1, // TODO: Get from auth context
            tags: tags.length > 0 ? tags : undefined,
        };

        onSave(noteData);
        handleClose();
    };

    const handleClose = () => {
        setContent('');
        setTags([]);
        setTagInput('');
        onClose();
    };

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={note ? 'Edit Note' : 'New Note'}>
            <div className="space-y-4">
                {/* Content Textarea */}
                <div>
                    <label className="block text-sm font-medium mb-2">Note Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your note here..."
                        className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                        autoFocus
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                        {content.length} characters
                    </div>
                </div>

                {/* Tags Input */}
                <div>
                    <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                placeholder="e.g., important, review"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white dark:bg-gray-800"
                            />
                        </div>
                        <Button onClick={addTag} variant="outline" size="sm">
                            Add
                        </Button>
                    </div>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                                >
                                    #{tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-primary-900 dark:hover:text-primary-100"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        {note && onDelete && (
                            <Button onClick={onDelete} variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleClose} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!content.trim()}>
                            {note ? 'Save Changes' : 'Create Note'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NoteEditor;

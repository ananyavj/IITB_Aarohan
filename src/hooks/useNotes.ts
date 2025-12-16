import { useLiveQuery } from 'dexie-react-hooks';
import {
    getNotesBySection,
    getNotesByChapter,
    getAllNotes,
    getAllBookmarks,
} from '@/repositories/noteRepository';

// Hook to get notes for a specific section
export const useNotesBySection = (sectionId: number | undefined, userId: number = 1) => {
    return useLiveQuery(
        async () => {
            if (sectionId === undefined) return [];
            return await getNotesBySection(sectionId, userId);
        },
        [sectionId, userId]
    );
};

// Hook to get notes for a chapter
export const useNotesByChapter = (chapterId: number | undefined, userId: number = 1) => {
    return useLiveQuery(
        async () => {
            if (chapterId === undefined) return [];
            return await getNotesByChapter(chapterId, userId);
        },
        [chapterId, userId]
    );
};

// Hook to get all notes for user
export const useAllNotes = (userId: number = 1) => {
    return useLiveQuery(
        async () => {
            return await getAllNotes(userId);
        },
        [userId]
    );
};

// Hook to get all bookmarks for user
export const useBookmarks = (userId: number = 1) => {
    return useLiveQuery(
        async () => {
            return await getAllBookmarks(userId);
        },
        [userId]
    );
};

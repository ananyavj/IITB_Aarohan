import { db } from '@/db/db';
import type { Note } from '@/db/db';
import { logSyncEvent } from './syncRepository';

export const createNote = async (
    noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
    markForSync: boolean = true
): Promise<number> => {
    const note: Note = {
        ...noteData,
        syncStatus: markForSync ? 'pending' : 'synced',
        createdAt: new Date(),
    };

    const noteId = await db.notes.add(note);

    if (markForSync) {
        await logSyncEvent('note', noteId, 'create');
    }

    return noteId;
};

export const updateNote = async (
    id: number,
    updates: Partial<Note>,
    markForSync: boolean = true
): Promise<void> => {
    const updatedData = {
        ...updates,
        updatedAt: new Date(),
        syncStatus: markForSync ? 'pending' : undefined,
    };

    await db.notes.update(id, updatedData);

    if (markForSync) {
        await logSyncEvent('note', id, 'update');
    }
};

export const deleteNote = async (id: number, markForSync: boolean = true): Promise<void> => {
    await db.notes.delete(id);

    if (markForSync) {
        await logSyncEvent('note', id, 'delete');
    }
};

export const getNotesBySection = async (sectionId: number, userId: number): Promise<Note[]> => {
    return await db.notes
        .where(['sectionId', 'userId'])
        .equals([sectionId, userId])
        .reverse()
        .sortBy('createdAt');
};

export const getNotesByChapter = async (chapterId: number, userId: number): Promise<Note[]> => {
    return await db.notes
        .where(['chapterId', 'userId'])
        .equals([chapterId, userId])
        .reverse()
        .sortBy('createdAt');
};

export const getAllNotes = async (userId: number): Promise<Note[]> => {
    return await db.notes
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt');
};

export const searchNotes = async (query: string, userId: number): Promise<Note[]> => {
    const allNotes = await getAllNotes(userId);
    const lowerQuery = query.toLowerCase();

    return allNotes.filter(note =>
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
};

export const getNotesByTag = async (tag: string, userId: number): Promise<Note[]> => {
    const allNotes = await getAllNotes(userId);
    return allNotes.filter(note => note.tags?.includes(tag));
};

export const toggleBookmark = async (sectionId: number, userId: number): Promise<boolean> => {
    const existing = await db.bookmarks
        .where(['sectionId', 'userId'])
        .equals([sectionId, userId])
        .first();

    if (existing) {
        await db.bookmarks.delete(existing.id!);
        await logSyncEvent('bookmark', existing.id!, 'delete');
        return false;
    } else {
        const id = await db.bookmarks.add({
            sectionId,
            userId,
            createdAt: new Date(),
        });
        await logSyncEvent('bookmark', id, 'create');
        return true;
    }
};

export const isBookmarked = async (sectionId: number, userId: number): Promise<boolean> => {
    const bookmark = await db.bookmarks
        .where(['sectionId', 'userId'])
        .equals([sectionId, userId])
        .first();
    return !!bookmark;
};

export const getAllBookmarks = async (userId: number) => {
    return await db.bookmarks.where('userId').equals(userId).reverse().sortBy('createdAt');
};

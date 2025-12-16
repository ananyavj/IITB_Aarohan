import { useLiveQuery } from 'dexie-react-hooks';
import { getBooksByClass, getChaptersByBook, getSectionsByChapter } from '@/repositories/contentRepository';
import type { Book, Chapter, Section } from '@/db/db';

// Hook to get books by class level
export const useBooksByClass = (classLevelId: number | undefined): Book[] | undefined => {
    return useLiveQuery(
        async () => {
            if (classLevelId === undefined) return [];
            return await getBooksByClass(classLevelId);
        },
        [classLevelId]
    );
};

// Hook to get chapters by book
export const useChaptersByBook = (bookId: number | undefined): Chapter[] | undefined => {
    return useLiveQuery(
        async () => {
            if (bookId === undefined) return [];
            return await getChaptersByBook(bookId);
        },
        [bookId]
    );
};

// Hook to get sections by chapter
export const useSections = (chapterId: number | undefined): Section[] | undefined => {
    return useLiveQuery(
        async () => {
            if (chapterId === undefined) return [];
            return await getSectionsByChapter(chapterId);
        },
        [chapterId]
    );
};

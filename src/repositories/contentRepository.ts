import { db } from '@/db/db';
import type { Book, Chapter, Section } from '@/db/db';

// Books
export const getBooksByClass = async (classLevelId: number): Promise<Book[]> => {
    return await db.books.where('classLevelId').equals(classLevelId).toArray();
};

export const saveBook = async (book: Book): Promise<number> => {
    return await db.books.add(book);
};

export const saveBooks = async (books: Book[]): Promise<void> => {
    await db.books.bulkAdd(books);
};

// Chapters
export const getChaptersByBook = async (bookId: number): Promise<Chapter[]> => {
    return await db.chapters
        .where('bookId')
        .equals(bookId)
        .sortBy('order');
};

export const saveChapter = async (chapter: Chapter): Promise<number> => {
    return await db.chapters.add(chapter);
};

export const saveChapters = async (chapters: Chapter[]): Promise<void> => {
    await db.chapters.bulkAdd(chapters);
};

// Sections
export const getSectionsByChapter = async (chapterId: number): Promise<Section[]> => {
    return await db.sections
        .where('chapterId')
        .equals(chapterId)
        .sortBy('order');
};

export const getSectionById = async (sectionId: number): Promise<Section | undefined> => {
    return await db.sections.get(sectionId);
};

export const saveSection = async (section: Section): Promise<number> => {
    return await db.sections.add(section);
};

export const saveSections = async (sections: Section[]): Promise<void> => {
    await db.sections.bulkAdd(sections);
};

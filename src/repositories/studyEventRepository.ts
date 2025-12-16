import { db } from '@/db/db';
import type { StudyEvent } from '@/db/db';

export const logStudyEvent = async (
    userId: number,
    sectionId: number,
    duration: number = 0
): Promise<number> => {
    const event: StudyEvent = {
        userId,
        sectionId,
        duration,
        timestamp: new Date(),
    };
    return await db.studyEvents.add(event);
};

export const getStudyEventsByChapter = async (
    chapterId: number,
    userId: number
): Promise<StudyEvent[]> => {
    // Get all sections for this chapter
    const sections = await db.sections.where('chapterId').equals(chapterId).toArray();
    const sectionIds = sections.map(s => s.id!);

    // Get study events for these sections
    const events = await db.studyEvents
        .where('userId')
        .equals(userId)
        .and(event => sectionIds.includes(event.sectionId))
        .toArray();

    return events;
};

export const calculateChapterProgress = async (
    chapterId: number,
    userId: number
): Promise<number> => {
    // Get total sections
    const totalSections = await db.sections.where('chapterId').equals(chapterId).count();
    if (totalSections === 0) return 0;

    // Get completed sections (sections with study events)
    const events = await getStudyEventsByChapter(chapterId, userId);
    const completedSectionIds = new Set(events.map(e => e.sectionId));
    const completedCount = completedSectionIds.size;

    return Math.round((completedCount / totalSections) * 100);
};

export const getTotalStudyTime = async (userId: number): Promise<number> => {
    const events = await db.studyEvents.where('userId').equals(userId).toArray();
    return events.reduce((total, event) => total + event.duration, 0);
};

export const getSectionStudyTime = async (
    sectionId: number,
    userId: number
): Promise<number> => {
    const events = await db.studyEvents
        .where(['sectionId', 'userId'])
        .equals([sectionId, userId])
        .toArray();
    return events.reduce((total, event) => total + event.duration, 0);
};

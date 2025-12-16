import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import {
    logStudyEvent,
    calculateChapterProgress,
    getTotalStudyTime,
} from '@/repositories/studyEventRepository';

// Hook to get chapter progress percentage
export const useChapterProgress = (chapterId: number | undefined): number | undefined => {
    const userId = 1; // TODO: Get from auth context

    return useLiveQuery(
        async () => {
            if (chapterId === undefined) return 0;
            return await calculateChapterProgress(chapterId, userId);
        },
        [chapterId]
    );
};

// Hook to get total study time
export const useTotalStudyTime = (): number | undefined => {
    const userId = 1; // TODO: Get from auth context

    return useLiveQuery(
        async () => {
            return await getTotalStudyTime(userId);
        },
        []
    );
};

// Hook to log lesson start
export const useStartLesson = (chapterId: number | undefined, sectionId: number | undefined) => {
    const userId = 1; // TODO: Get from auth context

    useEffect(() => {
        if (chapterId === undefined || sectionId === undefined) return;

        // Log study event when component mounts
        logStudyEvent(userId, sectionId, 0).catch(console.error);
    }, [chapterId, sectionId, userId]);
};

// Function to log section completion
export const logSectionCompletion = async (sectionId: number, duration: number = 0) => {
    const userId = 1; // TODO: Get from auth context
    await logStudyEvent(userId, sectionId, duration);
};

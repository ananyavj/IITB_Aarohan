import { useLiveQuery } from 'dexie-react-hooks';
import {
    getUserCalendars,
    getVisibleCalendars,
    getEventsByMonth,
    getEventsByDateRange,
    getUpcomingEvents,
    getEventsByDay,
    getClassCalendars,
} from '@/repositories/calendarRepository';
import { useAppStore } from '@/store/useAppStore';
import type { Calendar, CalendarEvent } from '@/db/db';

/**
 * Get all calendars for current user
 */
export const useCalendars = (): Calendar[] | undefined => {
    const userId = 1; // TODO: Get from auth

    return useLiveQuery(
        async () => getUserCalendars(userId),
        [userId]
    );
};

/**
 * Get only visible calendars for current user
 */
export const useVisibleCalendars = (): Calendar[] | undefined => {
    const userId = 1; // TODO: Get from auth

    return useLiveQuery(
        async () => getVisibleCalendars(userId),
        [userId]
    );
};

/**
 * Get class calendars for student's class
 */
export const useClassCalendars = (subjectId?: number): Calendar[] | undefined => {
    const { userProfile } = useAppStore();
    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;

    return useLiveQuery(
        async () => {
            if (!classLevel) return [];
            return await getClassCalendars(classLevel, subjectId);
        },
        [classLevel, subjectId]
    );
};

/**
 * Get events for a specific month
 */
export const useMonthEvents = (month: number, year: number): CalendarEvent[] | undefined => {
    const { userProfile } = useAppStore();
    const userId = 1; // TODO: Get from auth
    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;

    return useLiveQuery(
        async () => getEventsByMonth(month, year, userId, classLevel),
        [month, year, userId, classLevel]
    );
};

/**
 * Get events in a date range
 */
export const useDateRangeEvents = (
    startDate: Date,
    endDate: Date
): CalendarEvent[] | undefined => {
    const { userProfile } = useAppStore();
    const userId = 1; // TODO: Get from auth
    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;

    return useLiveQuery(
        async () => getEventsByDateRange(startDate, endDate, userId, classLevel),
        [startDate.getTime(), endDate.getTime(), userId, classLevel]
    );
};

/**
 * Get upcoming events (next N events)
 */
export const useUpcomingEvents = (limit: number = 10): CalendarEvent[] | undefined => {
    const { userProfile } = useAppStore();
    const userId = 1; // TODO: Get from auth
    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;

    return useLiveQuery(
        async () => getUpcomingEvents(limit, userId, classLevel),
        [limit, userId, classLevel]
    );
};

/**
 * Get events for a specific day
 */
export const useDayEvents = (date: Date): CalendarEvent[] | undefined => {
    const { userProfile } = useAppStore();
    const userId = 1; // TODO: Get from auth
    const classLevel = userProfile.class ? parseInt(userProfile.class) : undefined;

    return useLiveQuery(
        async () => getEventsByDay(date, userId, classLevel),
        [date.getTime(), userId, classLevel]
    );
};

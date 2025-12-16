import { db } from '@/db/db';
import type { Calendar, CalendarEvent } from '@/db/db';
import { logSyncEvent } from './syncRepository';

// ======================================================================
// CALENDAR CRUD
// ======================================================================

/**
 * Get all calendars for a user (personal + class calendars they created)
 */
export const getUserCalendars = async (userId: number): Promise<Calendar[]> => {
    return await db.calendars
        .where('userId')
        .equals(userId)
        .toArray();
};

/**
 * Get visible calendars for a user
 */
export const getVisibleCalendars = async (userId: number): Promise<Calendar[]> => {
    return await db.calendars
        .where('userId')
        .equals(userId)
        .and(cal => cal.isVisible === true)
        .toArray();
};

/**
 * Get class calendars for a specific class/subject (for students to view)
 */
export const getClassCalendars = async (classLevel: number, subjectId?: number): Promise<Calendar[]> => {
    let query = db.calendars
        .where('scope')
        .equals('class')
        .and(cal => cal.classLevel === classLevel);

    if (subjectId) {
        query = query.and(cal => cal.subjectId === subjectId);
    }

    return await query.toArray();
};

/**
 * Create a new calendar
 */
export const createCalendar = async (data: Omit<Calendar, 'id'>): Promise<number> => {
    const id = await db.calendars.add({
        ...data,
        createdAt: data.createdAt || new Date(),
    });

    // Don't sync personal calendars (they're local-only for now)
    // Class calendars would be synced
    if (data.scope === 'class') {
        await logSyncEvent('calendar', id, 'create');
    }

    return id;
};

/**
 * Update calendar
 */
export const updateCalendar = async (id: number, updates: Partial<Calendar>): Promise<void> => {
    await db.calendars.update(id, updates);

    const calendar = await db.calendars.get(id);
    if (calendar?.scope === 'class') {
        await logSyncEvent('calendar', id, 'update');
    }
};

/**
 * Delete calendar
 */
export const deleteCalendar = async (id: number): Promise<void> => {
    const calendar = await db.calendars.get(id);

    // Delete all events in this calendar first
    const events = await db.calendarEvents.where('calendarId').equals(id).toArray();
    for (const event of events) {
        await deleteEvent(event.id!);
    }

    await db.calendars.delete(id);

    if (calendar?.scope === 'class') {
        await logSyncEvent('calendar', id, 'delete');
    }
};

/**
 * Toggle calendar visibility
 */
export const toggleCalendarVisibility = async (id: number): Promise<void> => {
    const calendar = await db.calendars.get(id);
    if (calendar) {
        await db.calendars.update(id, { isVisible: !calendar.isVisible });
    }
};

// ======================================================================
// EVENT CRUD
// ======================================================================

/**
 * Create a calendar event
 */
export const createEvent = async (data: Omit<CalendarEvent, 'id'>): Promise<number> => {
    const id = await db.calendarEvents.add({
        ...data,
        createdAt: data.createdAt || new Date(),
        syncStatus: 'pending',
    });

    await logSyncEvent('calendarEvent', id, 'create');
    return id;
};

/**
 * Update calendar event
 */
export const updateEvent = async (id: number, updates: Partial<CalendarEvent>): Promise<void> => {
    await db.calendarEvents.update(id, {
        ...updates,
        updatedAt: new Date(),
        syncStatus: 'pending',
    });

    await logSyncEvent('calendarEvent', id, 'update');
};

/**
 * Delete calendar event
 */
export const deleteEvent = async (id: number): Promise<void> => {
    await db.calendarEvents.delete(id);
    await logSyncEvent('calendarEvent', id, 'delete');
};

/**
 * Check if user can edit an event (must be creator)
 */
export const canUserEditEvent = async (eventId: number, userId: number): Promise<boolean> => {
    const event = await db.calendarEvents.get(eventId);
    return event?.userId === userId;
};

// ======================================================================
// EVENT QUERIES
// ======================================================================

/**
 * Get events for a specific month (personal + class events for user)
 */
export const getEventsByMonth = async (
    month: number, // 0-11
    year: number,
    userId: number,
    classLevel?: number
): Promise<CalendarEvent[]> => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    return await getEventsByDateRange(startDate, endDate, userId, classLevel);
};

/**
 * Get events in a date range (personal + class events for user)
 */
export const getEventsByDateRange = async (
    startDate: Date,
    endDate: Date,
    userId: number,
    classLevel?: number
): Promise<CalendarEvent[]> => {
    // Get personal events
    const personalEvents = await db.calendarEvents
        .where('userId')
        .equals(userId)
        .and(event =>
            event.scope === 'personal' &&
            event.startTime >= startDate &&
            event.startTime <= endDate
        )
        .toArray();

    // Get class events if classLevel provided
    let classEvents: CalendarEvent[] = [];
    if (classLevel) {
        classEvents = await db.calendarEvents
            .where('scope')
            .equals('class')
            .and(event =>
                event.classLevel === classLevel &&
                event.startTime >= startDate &&
                event.startTime <= endDate
            )
            .toArray();
    }

    // Combine and sort by start time
    return [...personalEvents, ...classEvents].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
};

/**
 * Get upcoming events (limit to next N events)
 */
export const getUpcomingEvents = async (
    limit: number,
    userId: number,
    classLevel?: number
): Promise<CalendarEvent[]> => {
    const now = new Date();

    // Get personal future events
    const personalEvents = await db.calendarEvents
        .where('userId')
        .equals(userId)
        .and(event => event.scope === 'personal' && event.startTime >= now)
        .limit(limit)
        .toArray();

    // Get class future events if classLevel provided
    let classEvents: CalendarEvent[] = [];
    if (classLevel) {
        classEvents = await db.calendarEvents
            .where('scope')
            .equals('class')
            .and(event => event.classLevel === classLevel && event.startTime >= now)
            .limit(limit)
            .toArray();
    }

    // Combine, sort, and limit
    return [...personalEvents, ...classEvents]
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, limit);
};

/**
 * Get all class events for a specific class/subject (for teachers)
 */
export const getClassEvents = async (
    classLevel: number,
    subjectId?: number
): Promise<CalendarEvent[]> => {
    let query = db.calendarEvents
        .where('scope')
        .equals('class')
        .and(event => event.classLevel === classLevel);

    if (subjectId) {
        query = query.and(event => event.targetSubjectId === subjectId);
    }

    return await query.sortBy('startTime');
};

/**
 * Get events for a specific calendar
 */
export const getEventsByCalendar = async (calendarId: number): Promise<CalendarEvent[]> => {
    return await db.calendarEvents
        .where('calendarId')
        .equals(calendarId)
        .sortBy('startTime');
};

/**
 * Get events for a specific day
 */
export const getEventsByDay = async (
    date: Date,
    userId: number,
    classLevel?: number
): Promise<CalendarEvent[]> => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    return await getEventsByDateRange(dayStart, dayEnd, userId, classLevel);
};

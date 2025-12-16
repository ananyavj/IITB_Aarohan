import { db } from '@/db/db';
import type { SyncEvent } from '@/db/db';

export const logSyncEvent = async (
    entityType: string,
    entityId: number,
    action: 'create' | 'update' | 'delete'
): Promise<number> => {
    const event: SyncEvent = {
        entityType,
        entityId,
        action,
        timestamp: new Date(),
        synced: false,
    };
    return await db.syncEvents.add(event);
};

export const getPendingSyncEvents = async (): Promise<SyncEvent[]> => {
    return await db.syncEvents.where('synced').equals(0).toArray();
};

export const markSyncEventSynced = async (id: number): Promise<void> => {
    await db.syncEvents.update(id, { synced: true });
};

export const getSyncEventsByEntity = async (
    entityType: string,
    entityId: number
): Promise<SyncEvent[]> => {
    return await db.syncEvents
        .where(['entityType', 'entityId'])
        .equals([entityType, entityId])
        .toArray();
};

/**
 * SIMULATED Incoming Data Sync
 * In a real app, this would GET data from APIs
 */
const performIncomingSync = async (): Promise<void> => {
    // Simulate fetching:
    // 1. Content Metadata (new chapters/books)
    // 2. Teacher Calendar Events
    // 3. AI Responses

    console.log('Fetching incoming data...');
    // Real impl: const data = await fetch('/api/sync/incoming');
    // await db.transaction('rw', db.content, db.events, () => { ... merge data ... });
};

/**
 * SIMULATED Backend Sync
 * In a real app, this would POST events to an API endpoint
 */
export const performBatchSync = async (): Promise<{ success: boolean; syncedCount: number }> => {
    try {
        // 1. Push Changes
        const pendingEvents = await getPendingSyncEvents();

        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (pendingEvents.length > 0) {
            // Mark all as synced (mock success)
            const ids = pendingEvents.map(e => e.id as number);
            await db.syncEvents.where('id').anyOf(ids).modify({ synced: true });
        }

        // 2. Pull Changes (Incoming Sync)
        await performIncomingSync();

        return { success: true, syncedCount: pendingEvents.length };
    } catch (error) {
        console.error('Sync failed:', error);
        return { success: false, syncedCount: 0 };
    }
};

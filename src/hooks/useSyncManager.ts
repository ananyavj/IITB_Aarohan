import { useState, useEffect, useCallback } from 'react';
import { performBatchSync, getPendingSyncEvents, logSyncEvent } from '@/repositories/syncRepository';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export const useSyncManager = () => {
    const [status, setStatus] = useState<SyncStatus>('idle');
    const [pendingCount, setPendingCount] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    // Sync Function
    const triggerSync = useCallback(async () => {
        if (!navigator.onLine) {
            console.log('[useSyncManager] triggerSync aborted: navigator.onLine is false');
            setStatus('offline');
            return;
        }

        const events = await getPendingSyncEvents();
        if (events.length === 0) {
            setStatus('idle');
            return;
        }

        setStatus('syncing');

        try {
            const result = await performBatchSync();
            if (result.success) {
                setStatus('idle');
                setLastSyncTime(new Date());
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Sync Manager Error:', error);
            setStatus('error');
        }
    }, []);

    // Monitor Online/Offline Status
    useEffect(() => {
        const handleOnline = () => {
            console.log('[useSyncManager] Event: online');
            setIsOnline(true);
            triggerSync();
        };
        const handleOffline = () => {
            console.log('[useSyncManager] Event: offline');
            setIsOnline(false);
            setStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!navigator.onLine) {
            handleOffline();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [triggerSync]);

    // Check for pending items periodically
    useEffect(() => {
        const checkPending = async () => {
            const events = await getPendingSyncEvents();
            setPendingCount(events.length);
        };

        checkPending();
        const interval = setInterval(checkPending, 5000);
        return () => clearInterval(interval);
    }, [lastSyncTime]);

    // Auto-sync loop (every 30s if online)
    useEffect(() => {
        if (isOnline) {
            const interval = setInterval(triggerSync, 30000);
            return () => clearInterval(interval);
        }
    }, [isOnline, triggerSync]);

    return {
        status,
        pendingCount,
        lastSyncTime,
        isOnline,
        triggerSync
    };
};

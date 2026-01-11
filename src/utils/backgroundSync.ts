import { syncTodayEntries } from './foodDiarySync';

let syncInterval: NodeJS.Timeout | null = null;

/**
 * Start background sync service for food diary
 * Syncs unsynced entries every 5 minutes
 */
export const startFoodDiarySyncService = (): void => {
    if (syncInterval) {
        console.log('[BackgroundSync] Service already running');
        return;
    }

    console.log('[BackgroundSync] Starting Food Diary sync service (5 min interval)');

    // Initial sync
    syncTodayEntries().catch(e => {
        console.error('[BackgroundSync] Initial sync failed:', e);
    });

    // Periodic sync every 5 minutes
    syncInterval = setInterval(async () => {
        try {
            console.log('[BackgroundSync] Running periodic sync...');
            await syncTodayEntries();
        } catch (e) {
            console.error('[BackgroundSync] Periodic sync failed:', e);
        }
    }, 5 * 60 * 1000); // 5 minutes
};

/**
 * Stop background sync service
 */
export const stopFoodDiarySyncService = (): void => {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('[BackgroundSync] Food Diary sync service stopped');
    }
};

/**
 * Force immediate sync (for manual trigger)
 */
export const forceSyncNow = async (): Promise<void> => {
    console.log('[BackgroundSync] Force sync triggered');
    await syncTodayEntries();
};

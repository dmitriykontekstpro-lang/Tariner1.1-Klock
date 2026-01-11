import { supabase } from '../lib/supabaseClient';
import { FoodEntry } from '../types';
import { loadFoodEntries, markAsSynced, addFoodEntry } from './foodDiaryStore';

import { getLocalDateKey } from './dateHelpers';

/**
 * Sync today's unsynced entries to Supabase using JSON append usage
 */
export const syncTodayEntries = async (): Promise<void> => {
    try {
        const today = getLocalDateKey(new Date());
        const entries = await loadFoodEntries(today, today);

        // Filter unsynced and analyzed entries
        const unsynced = entries.filter(e => !e.syncedToSupabase && e.analyzed);

        if (unsynced.length === 0) {
            console.log('[FoodDiarySync] No entries to sync');
            return;
        }

        console.log(`[FoodDiarySync] Syncing ${unsynced.length} entries...`);

        // Prepare payload
        const userId = unsynced[0].userId; // All entries should have same user
        const payload = unsynced.map(e => ({
            id: e.id, // Keep ID for reference
            name: e.foodName,
            calories: e.calories,
            protein: e.protein,
            fats: e.fats,
            carbs: e.carbs,
            portion: e.portion,
            weight: e.weight || null,
            foodType: e.foodType || 'Unknown',
            meal: e.mealType
        }));

        // Call RPC
        const { error } = await supabase.rpc('append_to_food_diary', {
            p_user_id: userId,
            p_date: today,
            p_new_entries: payload
        });

        if (error) {
            throw error;
        }

        // Mark local entries as synced
        for (const entry of unsynced) {
            await markAsSynced(entry.id, 'json-synced'); // ID не так важен для JSON стораджа
        }

        console.log('[FoodDiarySync] Sync completed successfully');

    } catch (e) {
        console.error('[FoodDiarySync] Sync failed:', e);
        throw e;
    }
};

/**
 * Load historical entries from Supabase (reading JSON)
 */
export const loadHistoricalEntries = async (
    dateFrom: string,
    dateTo: string
): Promise<FoodEntry[]> => {
    try {
        const userId = (global as any).userId || 'offline-user';

        const { data, error } = await supabase
            .from('food_diary')
            .select('date, day_json')
            .eq('user_id', userId)
            .gte('date', dateFrom)
            .lte('date', dateTo)
            .order('date', { ascending: false });

        if (error) {
            console.error('[FoodDiarySync] Failed to load history:', error);
            throw error;
        }

        if (!data) return [];

        const allEntries: FoodEntry[] = [];

        for (const row of data) {
            const rawEntries = row.day_json; // Array of objects
            if (!Array.isArray(rawEntries)) continue;

            for (const item of rawEntries) {
                // Convert JSON item back to FoodEntry
                allEntries.push({
                    id: item.id || 'hist-' + Math.random(),
                    userId,
                    created_at: row.date + 'T12:00:00Z', // Rough estimate
                    date: row.date,
                    photoUri: '',
                    userHints: '',
                    mealType: item.meal,
                    analyzed: true,
                    foodName: item.name,
                    calories: item.calories,
                    protein: item.protein,
                    fats: item.fats,
                    carbs: item.carbs,
                    portion: item.portion,
                    weight: item.weight,
                    foodType: item.foodType,
                    syncedToSupabase: true,
                    supabaseId: 'json-loaded'
                });
            }
        }

        console.log(`[FoodDiarySync] Loaded ${allEntries.length} historical entries`);
        return allEntries;

    } catch (e) {
        console.error('[FoodDiarySync] Failed to load historical entries:', e);
        throw e;
    }
};

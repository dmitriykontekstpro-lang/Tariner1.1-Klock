import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, MealType, DailyNutritionSummary, NutritionPlan } from '../types';
import { getLocalDateKey } from './dateHelpers';

const STORAGE_KEY = 'food_diary_entries';

/**
 * Generate UUID for food entries
 */
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Get user ID from global state (set by App.tsx on init)
 */
const getUserId = (): string => {
    return (global as any).userId || 'offline-user';
};

/**
 * Load all food entries from AsyncStorage
 */
const loadAll = async (): Promise<FoodEntry[]> => {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error('[FoodDiary] Failed to load entries', e);
        return [];
    }
};

/**
 * Save all food entries to AsyncStorage
 */
const saveAll = async (entries: FoodEntry[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
        console.error('[FoodDiary] Failed to save entries', e);
        throw e;
    }
};

/**
 * Load food entries filtered by date range
 * @param dateFrom YYYY-MM-DD (optional)
 * @param dateTo YYYY-MM-DD (optional)
 */
export const loadFoodEntries = async (
    dateFrom?: string,
    dateTo?: string
): Promise<FoodEntry[]> => {
    const all = await loadAll();

    if (!dateFrom && !dateTo) {
        return all;
    }

    return all.filter(entry => {
        if (dateFrom && entry.date < dateFrom) return false;
        if (dateTo && entry.date > dateTo) return false;
        return true;
    });
};

/**
 * Add new food entry
 * @param photoUri Local file path
 * @param userHints User's description
 * @param mealType Type of meal
 */
export const addFoodEntry = async (
    photoUri: string,
    userHints?: string,
    mealType?: MealType
): Promise<FoodEntry> => {
    const all = await loadAll();

    // Limit if needed
    // if (all.length > 1000) ...

    const now = new Date();
    const entry: FoodEntry = {
        id: generateUUID(),
        userId: getUserId(),
        created_at: now.toISOString(),
        date: getLocalDateKey(now), // Fix: Use local date
        photoUri,
        userHints,
        mealType,
        analyzed: false,
        syncedToSupabase: false
    };

    all.push(entry);
    await saveAll(all);

    return entry;
};

/**
 * Update food entry with AI analysis results
 * @param entryId Entry ID
 * @param analysis Analysis results from AI
 */
export const updateFoodEntryAnalysis = async (
    entryId: string,
    analysis: {
        calories: number;
        protein: number;
        fats: number;
        carbs: number;
        foodName: string;
        portion: string;
        weight: number;
        foodType: string;
    }
): Promise<void> => {
    const all = await loadAll();
    const index = all.findIndex(e => e.id === entryId);

    if (index === -1) {
        throw new Error(`Entry with id ${entryId} not found`);
    }

    all[index] = {
        ...all[index],
        analyzed: true,
        calories: analysis.calories,
        protein: analysis.protein,
        fats: analysis.fats,
        carbs: analysis.carbs,
        foodName: analysis.foodName,
        portion: analysis.portion,
        weight: analysis.weight,
        foodType: analysis.foodType
    };

    await saveAll(all);
};

/**
 * Mark entry as synced to Supabase
 * @param entryId Entry ID
 * @param supabaseId Supabase row ID
 */
export const markAsSynced = async (
    entryId: string,
    supabaseId: string
): Promise<void> => {
    const all = await loadAll();
    const index = all.findIndex(e => e.id === entryId);

    if (index === -1) {
        throw new Error(`Entry with id ${entryId} not found`);
    }

    all[index] = {
        ...all[index],
        syncedToSupabase: true,
        supabaseId
    };

    await saveAll(all);
};

/**
 * Get daily nutrition summary for specific date
 * @param date YYYY-MM-DD
 * @param targetNutrition Target nutrition from user profile
 */
export const getDailySummary = async (
    date: string,
    targetNutrition?: NutritionPlan
): Promise<DailyNutritionSummary> => {
    const entries = await loadFoodEntries(date, date);

    // Calculate totals (only from analyzed entries)
    const analyzed = entries.filter(e => e.analyzed);

    const totalCalories = analyzed.reduce((sum, e) => sum + (e.calories || 0), 0);
    const totalProtein = analyzed.reduce((sum, e) => sum + (e.protein || 0), 0);
    const totalFats = analyzed.reduce((sum, e) => sum + (e.fats || 0), 0);
    const totalCarbs = analyzed.reduce((sum, e) => sum + (e.carbs || 0), 0);

    // Calculate progress percentages
    const caloriesProgress = targetNutrition
        ? Math.round((totalCalories / targetNutrition.targetCalories) * 100)
        : 0;

    const proteinProgress = targetNutrition
        ? Math.round((totalProtein / targetNutrition.protein) * 100)
        : 0;

    const fatsProgress = targetNutrition
        ? Math.round((totalFats / targetNutrition.fats) * 100)
        : 0;

    const carbsProgress = targetNutrition
        ? Math.round((totalCarbs / targetNutrition.carbs) * 100)
        : 0;

    return {
        date,
        totalCalories,
        totalProtein,
        totalFats,
        totalCarbs,
        caloriesProgress,
        proteinProgress,
        fatsProgress,
        carbsProgress,
        entries
    };
};

/**
 * Delete food entry (both data and photo file if exists)
 * @param entryId Entry ID
 */
export const deleteFoodEntry = async (entryId: string): Promise<void> => {
    const all = await loadAll();
    const filtered = all.filter(e => e.id !== entryId);

    if (filtered.length === all.length) {
        throw new Error(`Entry with id ${entryId} not found`);
    }

    // TODO: Delete photo file from filesystem when expo-file-system is installed
    // const entry = all.find(e => e.id === entryId);
    // if (entry && entry.photoUri) {
    //     await FileSystem.deleteAsync(entry.photoUri, { idempotent: true });
    // }

    await saveAll(filtered);
};


/**
 * Sync Food Diary with Supabase (Pull only for now, to fix "empty diary")
 */
import { supabase } from '../lib/supabaseClient';

export const syncFoodWithSupabase = async (): Promise<void> => {
    try {
        const userId = getUserId();
        // 1. Fetch from Supabase
        const { data: remoteEntries, error } = await supabase
            .from('food_diary')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        if (!remoteEntries || remoteEntries.length === 0) return;

        // 2. Load Local
        const localEntries = await loadAll();
        let changed = false;

        // 3. Merge (Remote -> Local)
        for (const rem of remoteEntries) {
            // Check if exists by Supabase ID or Local ID (if matched before)
            // Assuming 'id' in supabase is the UUID primary key
            const exists = localEntries.find(l => l.supabaseId === rem.id || l.id === rem.id);

            if (!exists) {
                // Create new local entry from remote
                const newEntry: FoodEntry = {
                    id: rem.id, // Use supabase ID as local ID for consistency if not present
                    supabaseId: rem.id,
                    userId: rem.user_id,
                    created_at: rem.created_at,
                    date: rem.date_key || rem.created_at.split('T')[0], // Handle date key
                    photoUri: rem.image_url || null, // URL from bucket
                    userHints: rem.user_hints,
                    mealType: rem.meal_type as MealType,

                    analyzed: true, // If it's in DB, it's likely analyzed
                    foodName: rem.food_name,
                    calories: rem.calories,
                    protein: rem.protein,
                    fats: rem.fats,
                    carbs: rem.carbs,
                    weight: rem.weight,
                    portion: rem.portion_size || rem.portion,
                    syncedToSupabase: true
                };
                localEntries.push(newEntry);
                changed = true;
            }
        }

        // 4. Save if updates
        if (changed) {
            await saveAll(localEntries);
            console.log('[FoodDiarySync] Pulled', remoteEntries.length, 'entries from Supabase');
        }

    } catch (e) {
        console.error('[FoodDiarySync] Failed to sync', e);
    }
};

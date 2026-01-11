import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseResult } from '../lib/supabaseClient';

export interface ExerciseStats {
    exerciseId: string;
    weight: number;
    cycleIndex: number; // 0-4
    reps: number;
    sets: number;
    lastDate: number; // timestamp
    count: number; // total times performed
    skipped: boolean;
}

export type HistoryState = Record<string, ExerciseStats>; // Map ExerciseID -> Stats

const STORAGE_KEY = 'local_exercise_history';

export const loadLocalHistory = async (): Promise<HistoryState> => {
    try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
            return JSON.parse(json);
        }
    } catch (e) {
        console.error("Failed to load local history", e);
    }
    return {};
};

export const saveLocalHistory = async (history: HistoryState) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save local history", e);
    }
};

export const updateLocalHistory = async (results: Record<string, ExerciseResult>) => {
    const current = await loadLocalHistory();

    Object.values(results).forEach(res => {
        // Skip skipped exercises? Or count them?
        // Logic: if skipped, we do NOT change weight/cycle, but maybe update date?
        // User logic: "Repeat cycle if skipped".

        const existing = current[res.exerciseId];

        const newCount = (existing?.count || 0) + 1;

        // If existing is present, we overwrite with new ONLY if this workout is newer?
        // Assuming we always update "forward".

        current[res.exerciseId] = {
            exerciseId: res.exerciseId,
            weight: res.weight,
            cycleIndex: res.cycleIndex, // This comes from Dashboard (which used calculated value)
            reps: res.reps,
            sets: res.sets,
            lastDate: Date.now(),
            count: newCount,
            skipped: res.skipped || false
        };
    });

    await saveLocalHistory(current);
    return current;
};

export const resetExerciseHistory = async (exerciseId: string) => {
    const current = await loadLocalHistory();
    if (current[exerciseId]) {
        delete current[exerciseId];
        await saveLocalHistory(current);
    }
    return current;
};

export const markWorkoutCompleted = async () => {
    try {
        await AsyncStorage.setItem('last_workout_date', new Date().toISOString());
    } catch (e) {
        console.error("Failed to mark workout complete", e);
    }
};

export const getLastWorkoutDate = async (): Promise<Date | null> => {
    try {
        const s = await AsyncStorage.getItem('last_workout_date');
        return s ? new Date(s) : null;
    } catch (e) {
        return null;
    }
};

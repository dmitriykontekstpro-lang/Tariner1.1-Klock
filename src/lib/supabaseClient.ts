import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://cqpqyhehoiybggjuljzn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcHF5aGVob2l5YmdnanVsanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTQyODQsImV4cCI6MjA4MDA5MDI4NH0.H9PR8iNGM42wvJDfA7ntcz-aj5GWD1L7cl0VlGvFsBs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export interface WorkoutRecord {
    id?: string;
    created_at?: string;
    started_at: string;
    ended_at: string;
    duration_min: number;
    total_reps: number;
    total_volume: number;
    weight_before?: number | null;
    weight_after?: number | null;
    muscle_groups?: string; // Comma-separated muscle groups
    exercises_data: Record<string, ExerciseResult>; // JSONB
}


export interface ExerciseResult {
    exerciseId: string;
    name: string;
    weight: number;
    sets: number;
    reps: number;
    cycleIndex: number; // 0=Init, 1=Start, 2=Vol, 3=Vol+, 4=Intense
    group: string;
    skipped?: boolean; // true if user skipped this exercise
}

// Helper to generate or retrieve a persistent ID for the device
// Note: This needs to be async or cached in state, but logic expects sync access in some places
// For simplicity in porting, we will check if it's already set or return a temp one and try to set it.
// In a real app, we should use a hook.
export const getOrCreateUserId = (): string => {
    // In RN, we can't synchronously get AsyncStorage.
    // We will assume that the app initializes the user ID on launch and stores it in a global variable or cache.
    // For now, let's return a default GUID if not found in memory, and rely on async init in App.tsx
    return (global as any).userId || 'offline-user';
};

// Async init helper
export const initUserId = async (): Promise<string> => {
    const STORAGE_KEY = 'flow_user_device_id';
    let userId = await AsyncStorage.getItem(STORAGE_KEY);

    if (!userId) {
        // Generate a random UUID-like string
        userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        await AsyncStorage.setItem(STORAGE_KEY, userId);
    }

    // Cache it globally for synchronous access (e.g. in loops)
    (global as any).userId = userId;
    return userId;
};

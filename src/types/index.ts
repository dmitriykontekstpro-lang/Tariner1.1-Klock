export enum MuscleGroup {
    CHEST = 'ГРУДЬ',
    BACK = 'СПИНА',
    LEGS = 'НОГИ',
    SHOULDERS = 'ПЛЕЧИ',
    BICEPS = 'БИЦЕПС',
    TRICEPS = 'ТРИЦЕПС',
    ABS = 'ПРЕСС',
    NONE = 'НЕТ ВТОРОЙ ГРУППЫ'
}

export interface Exercise {
    id: string;
    name: string;
    group: MuscleGroup;
    defaultReps: number;
    defaultWeight: number; // Placeholder kg
}

export type WorkoutType = 'PROGRESSIVE' | 'CUSTOM';

export interface CustomExerciseSettings {
    sets: number;
    reps: number;
    weight: number;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    exercises: Exercise[];
    primaryGroup: MuscleGroup;
    secondaryGroup: MuscleGroup;

    // New fields for Custom Workouts
    type: WorkoutType;
    customConfig?: { [exerciseId: string]: CustomExerciseSettings }; // Settings per exercise
    customRestBetweenSets?: number;
    customRestBetweenExercises?: number;
    customPrepDuration?: number; // New field
}

export enum BlockType {
    CHECK_IN = 'CHECK_IN', // Body weight before
    PREP = 'PREP',
    WORK = 'WORK',
    REST = 'REST',
    TRANSITION = 'TRANSITION',
    CHECK_OUT = 'CHECK_OUT', // Body weight after
    FINISH = 'FINISH'
}

export interface TimelineBlock {
    id: string;
    type: BlockType;
    duration: number; // Seconds
    exerciseName?: string;
    exerciseId?: string; // Added for tracking
    reps?: number;
    weight?: number;
    setNumber?: number;
    totalSets?: number;
    nextExercise?: string;

    // Progression Logic
    isNewExercise?: boolean; // Specific flag for "New Record" logic
    requiresConfirmation?: boolean; // Forces camera/input check before start
    cycleIndex?: number; // 0-4
    muscleGroup?: MuscleGroup;
    customLabel?: string;
}

export interface WeeklySchedule {
    [dayIndex: number]: string | null; // 0=Sunday, 1=Monday... value is TemplateID
}

export interface WorkoutSettings {
    setsPerExercise: number;        // Количество сетов каждого упражнения (по умолчанию 3)
    setDuration: number;             // Длительность подхода в секундах (по умолчанию 60)
    restBetweenSets: number;         // Отдых между сетами в секундах (по умолчанию 120)
    restBetweenExercises: number;    // Отдых между упражнениями в секундах (по умолчанию 30)
    repsPerSet: number;              // Количество повторений в подходе (по умолчанию 8)
}

// --- ONBOARDING TYPES ---

export type Gender = 'MALE' | 'FEMALE';
export type BodyFatLevel = 'LOW' | 'MEDIUM' | 'HIGH'; // <15%, 15-25%, >25%
export type MainGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'RECOMPOSITION' | 'STRENGTH' | 'ENDURANCE';
export type ExperienceLevel = 'BEGINNER' | 'AMATEUR' | 'ADVANCED';
export type TrainingLocation = 'GYM' | 'HOME' | 'HOME_BASIC' | 'STREET';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HEAVY';
export type SleepDuration = 'LESS_6' | '7_8' | 'MORE_9';

export interface UserProfile {
    // Biometrics
    gender: Gender;
    age: number;
    height: number; // cm
    weight: number; // kg
    bodyFat?: BodyFatLevel;

    // Goals
    mainGoal: MainGoal;
    targetWeight?: number;
    timeline?: string;

    // Experience
    experience: ExperienceLevel;
    pushUps?: string; // Range like "10-20"
    pullUps?: string;

    // Logistics
    location: TrainingLocation;
    daysPerWeek: number;
    sessionDuration: number; // minutes

    // Health
    injuries: string[]; // ['NECK', 'KNEES'...]
    chronic: string[]; // ['HEART'...]

    // Lifestyle
    activityLevel: ActivityLevel;
    sleepDuration: SleepDuration;
}

export interface NutritionPlan {
    bmr: number;
    tdee: number;
    targetCalories: number;
    protein: number;
    fats: number;
    carbs: number;
}

// --- FOOD DIARY TYPES ---

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface FoodEntry {
    id: string;                    // UUID
    userId: string;                // Device/User ID
    created_at: string;            // ISO timestamp
    date: string;                  // YYYY-MM-DD (для группировки по дням)

    // User Input
    photoUri: string;              // Local file path (file://...)
    userHints?: string;            // "500г куриной грудки, отварная"
    mealType?: MealType;           // Завтрак/Обед/Ужин/Перекус

    // AI Analysis Result
    analyzed: boolean;             // false пока не проанализировано
    foodName?: string;             // "Куриная грудка отварная"
    calories?: number;             // ккал
    protein?: number;              // г
    fats?: number;                 // г
    carbs?: number;                // г
    portion?: string;              // "200г" или "1 порция"
    weight?: number;               // граммы (число)
    foodType?: string;             // тип еды (Мясо и т.д.)

    // Sync
    syncedToSupabase: boolean;     // true если выгружено в облако
    supabaseId?: string;           // ID записи в Supabase
}

export interface DailyNutritionSummary {
    date: string;                  // YYYY-MM-DD
    totalCalories: number;
    totalProtein: number;
    totalFats: number;
    totalCarbs: number;

    // Progress vs Target (from UserProfile NutritionPlan)
    caloriesProgress: number;      // 0-100+ (%)
    proteinProgress: number;
    fatsProgress: number;
    carbsProgress: number;

    entries: FoodEntry[];          // Все записи за день
}


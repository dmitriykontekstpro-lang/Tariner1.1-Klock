export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface FoodItemJSON {
    id: string;
    meal: MealType;
    name: string;
    foodType?: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    weight: number;
    portion?: string;
    image_url?: string | null; // Optional, if we want to support photos for specific items in future
}

export interface DailyNutritionSummary {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalFats: number;
    totalCarbs: number;

    // Progress %
    caloriesProgress: number;
    proteinProgress: number;
    fatsProgress: number;
    carbsProgress: number;

    entries: FoodItemJSON[];
}

// For AI Analysis
export interface FoodAnalysisResult {
    isFood: boolean;
    foodName: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    portion: string;
    weight: number;
    foodType: string;
}

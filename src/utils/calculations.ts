import { UserProfile, NutritionPlan } from '../types';

export const calculateNutrition = (profile: UserProfile): NutritionPlan => {
    // 1. BMI Calculation
    const bmr = calculateBMR(profile);

    // 2. TDEE Calculation
    let activityMultiplier = 1.2;
    switch (profile.activityLevel) {
        case 'SEDENTARY': activityMultiplier = 1.2; break;
        case 'LIGHT': activityMultiplier = 1.375; break;
        case 'MODERATE': activityMultiplier = 1.55; break;
        case 'HEAVY': activityMultiplier = 1.7; break;
    }
    const tdee = Math.round(bmr * activityMultiplier);

    // 3. Goal Adjustment
    let targetCalories = tdee;
    switch (profile.mainGoal) {
        case 'WEIGHT_LOSS':
            targetCalories = Math.round(tdee * 0.85); // -15%
            break;
        case 'MUSCLE_GAIN':
            targetCalories = Math.round(tdee * 1.15); // +15%
            break;
        case 'RECOMPOSITION':
            targetCalories = tdee;
            break;
        case 'STRENGTH':
            targetCalories = Math.round(tdee * 1.10); // +10% surplus
            break;
        case 'ENDURANCE':
            targetCalories = Math.round(tdee * 1.05); // Maintenance+
            break;
    }

    // 4. Macros (Scientific Approach: g/kg bodyweight)
    let proteinPerKg = 1.8;
    let fatsPerKg = 1.0;

    switch (profile.mainGoal) {
        case 'WEIGHT_LOSS':
            proteinPerKg = 2.2; // High protein to spare muscle in deficit
            fatsPerKg = 0.9;
            break;
        case 'MUSCLE_GAIN':
            proteinPerKg = 2.0; // Optimal for growth
            fatsPerKg = 1.0;
            break;
        case 'RECOMPOSITION':
        case 'STRENGTH':
            proteinPerKg = 2.0;
            fatsPerKg = 1.0;
            break;
        case 'ENDURANCE':
            proteinPerKg = 1.6; // Slightly lower protein, higher carbs needed
            fatsPerKg = 1.0;
            break;
    }

    // Calculate Grams
    let protein = Math.round(profile.weight * proteinPerKg);
    let fats = Math.round(profile.weight * fatsPerKg);

    // Calculate Calories from Protein and Fats
    const proteinCals = protein * 4;
    const fatsCals = fats * 9;

    // Remaining Calories for Carbs
    let remainingCals = targetCalories - (proteinCals + fatsCals);

    // Safety check: Ensure carbs aren't negative (unlikely unless very low cal)
    if (remainingCals < 0) remainingCals = 0;

    let carbs = Math.round(remainingCals / 4);

    return {
        bmr: Math.round(bmr),
        tdee,
        targetCalories,
        protein,
        fats,
        carbs
    };
};

const calculateBMR = (profile: UserProfile): number => {
    // Mifflin-St Jeor
    // Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
    // Women: (10 × weight) + (6.25 × height) - (5 × age) - 161

    let base = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    if (profile.gender === 'MALE') {
        base += 5;
    } else {
        base -= 161;
    }
    return base;
};

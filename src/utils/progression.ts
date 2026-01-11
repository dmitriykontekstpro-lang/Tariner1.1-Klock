import { ExerciseResult } from '../lib/supabaseClient';
import { Exercise, TimelineBlock, BlockType, WorkoutTemplate, WorkoutSettings } from '../types';
import { HistoryState } from './historyStore';

// Calculate next load based on cycleIndex progression
export const calculateNextLoad = (
    lastResult: ExerciseResult | null,
    defaultExercise: Exercise,
    defaultReps: number
): { weight: number, reps: number, cycleIndex: number, isNew: boolean } => {
    // If no history - this is a new exercise
    if (!lastResult) {
        return {
            weight: defaultExercise.defaultWeight,
            reps: defaultReps,
            cycleIndex: 0, // Cycle 0 = new exercise
            isNew: true
        };
    }

    // If last time was skipped, repeat the same cycle
    if (lastResult.skipped) {
        console.log(`[Progression] Last result was skipped. Repeating cycle ${lastResult.cycleIndex}.`);
        return {
            weight: lastResult.weight,
            reps: defaultReps,
            cycleIndex: lastResult.cycleIndex,
            isNew: false
        };
    }

    const { weight, cycleIndex } = lastResult;
    console.log(`[Progression] Calculating next load. Last cycle: ${cycleIndex}, Last Weight: ${weight}`);

    let nextWeight = weight;
    let nextReps = defaultReps;
    let nextCycleIndex = 0;

    // Progression logic based on cycleIndex (Completed Cycle -> Next Cycle)
    switch (cycleIndex) {
        case 0: // Completed "New Exercise" (0) -> Next is Start 1
            nextWeight = weight + 2.5; // +2.5kg
            nextReps = 8;              // Fixed 8 reps
            nextCycleIndex = 1;
            break;
        case 1: // Completed Start 1 (8 reps) -> Next is Start 2
            nextWeight = weight;       // Same weight
            nextReps = 10;             // Fixed 10 reps
            nextCycleIndex = 2;
            break;
        case 2: // Completed Start 2 (10 reps) -> Next is Start 3
            nextWeight = weight;       // Same weight
            nextReps = 12;             // Fixed 12 reps
            nextCycleIndex = 3;
            break;
        case 3: // Completed Start 3 (12 reps) -> Next is Start 4
            nextWeight = weight;       // Same weight
            nextReps = 14;             // Fixed 14 reps
            nextCycleIndex = 4;
            break;
        case 4: // Completed Start 4 (14 reps) -> Loop back to Start 1
            nextWeight = weight + 2.5; // +2.5kg
            nextReps = 8;              // Reset to 8 reps
            nextCycleIndex = 1;
            break;
        default:
            // Fallback or if cycle got corrupted
            nextWeight = weight;
            nextReps = 8;
            nextCycleIndex = 1;
    }

    console.log(`[Progression] New Cycle: ${nextCycleIndex}, New Weight: ${nextWeight}, New Reps: ${nextReps}`);

    return {
        weight: nextWeight,
        reps: nextReps,
        cycleIndex: nextCycleIndex,
        isNew: false
    };
};

export const prepareWorkoutTimeline = async (
    template: WorkoutTemplate,
    settings: WorkoutSettings,
    history: HistoryState // Uses local history now
): Promise<TimelineBlock[]> => {

    // We don't fetch from Supabase anymore!

    const blocks: TimelineBlock[] = [];
    let blockId = 0;

    // 1. CHECK_IN (Body Weight Start)
    blocks.push({
        id: `blk_${blockId++}`,
        type: BlockType.CHECK_IN,
        duration: 0,
        requiresConfirmation: true
    });

    // 2. PREP
    const prepDuration = (template.type === 'CUSTOM' && template.customPrepDuration)
        ? template.customPrepDuration
        : 30;
    blocks.push({ id: `blk_${blockId++}`, type: BlockType.PREP, duration: prepDuration });

    if (!template.exercises || !Array.isArray(template.exercises)) {
        console.warn("Template has no exercises!");
        return blocks;
    }

    // CUSTOM WORKOUT LOGIC
    if (template.type === 'CUSTOM') {
        const customRestSets = template.customRestBetweenSets || settings.restBetweenSets;
        const customRestEx = template.customRestBetweenExercises || settings.restBetweenExercises;

        for (let i = 0; i < template.exercises.length; i++) {
            const ex = template.exercises[i];
            const rawConfig = template.customConfig?.[ex.id] || { sets: 3, reps: 10, weight: 20 };

            const safeSets = (typeof rawConfig.sets === 'number' && !isNaN(rawConfig.sets) && rawConfig.sets > 0) ? rawConfig.sets : 3;
            const safeReps = (typeof rawConfig.reps === 'number' && !isNaN(rawConfig.reps) && rawConfig.reps > 0) ? rawConfig.reps : 10;
            // Weight can be 0 theoretically, but let's assume if NaN -> 20
            const safeWeight = (typeof rawConfig.weight === 'number' && !isNaN(rawConfig.weight)) ? rawConfig.weight : 20;

            for (let set = 1; set <= safeSets; set++) {
                // Determine duration logic
                const duration = safeReps * 2 + 10;

                blocks.push({
                    id: `blk_${blockId++}`,
                    type: BlockType.WORK,
                    duration: duration,
                    exerciseName: ex.name,
                    exerciseId: ex.id,
                    reps: safeReps,
                    weight: safeWeight,
                    setNumber: set,
                    totalSets: safeSets,
                    isNewExercise: false,
                    cycleIndex: 0,
                    muscleGroup: ex.group,
                    customLabel: `ПОДХОД ${set}/${safeSets}`
                });

                // Rest between sets
                if (set < safeSets) {
                    blocks.push({
                        id: `blk_${blockId++}`,
                        type: BlockType.REST,
                        duration: customRestSets,
                        nextExercise: `${ex.name} (Сет ${set + 1})`
                    });
                }
            }

            // Rest between exercises
            if (i < template.exercises.length - 1) {
                blocks.push({
                    id: `blk_${blockId++}`,
                    type: BlockType.TRANSITION,
                    duration: customRestEx,
                    nextExercise: template.exercises[i + 1].name
                });
            }
        }

        // 3. CHECK_OUT
        blocks.push({ id: `blk_${blockId++}`, type: BlockType.CHECK_OUT, duration: 0, requiresConfirmation: true });
        // 4. FINISH
        blocks.push({ id: `blk_${blockId++}`, type: BlockType.FINISH, duration: 0 });

        return blocks;
    }

    // PROGRESSIVE WORKOUT LOGIC (Standard Flow)
    for (let i = 0; i < template.exercises.length; i++) {
        const ex = template.exercises[i];

        // Search in local history
        const localStat = history[ex.id];

        let lastLog: ExerciseResult | null = null;
        if (localStat) {
            console.log(`[Progression] Found LOCAL history for ${ex.id}: Cycle ${localStat.cycleIndex}, Weight ${localStat.weight}`);
            // Convert to ExerciseResult compatible object for calculation
            lastLog = {
                exerciseId: localStat.exerciseId,
                name: ex.name,
                weight: localStat.weight,
                reps: localStat.reps,
                sets: localStat.sets,
                group: ex.group,
                cycleIndex: localStat.cycleIndex,
                skipped: localStat.skipped
            };
        } else {
            console.log(`[Progression] No local history found for ${ex.id} (Start 0)`);
        }

        const calculated = calculateNextLoad(lastLog, ex, settings.repsPerSet);
        // Fixed 4 sets total: 1 Warmup + 3 Working
        const totalSets = 4;

        for (let set = 1; set <= totalSets; set++) {
            const isWarmup = set === 1;
            const currentSetWeight = isWarmup ? 0 : calculated.weight;

            // Logic: Warmup set often has more reps or same? User didn't specify, assume same reps logic for timing.
            // Formula: reps * 2 + 10
            const workDuration = calculated.reps * 2 + 10;

            let setLabel = '';
            if (isWarmup) {
                setLabel = "Разминочный подход без веса";
            } else {
                setLabel = `Рабочий сет №${set - 1}`;
            }

            // WORK
            blocks.push({
                id: `blk_${blockId++}`,
                type: BlockType.WORK,
                duration: workDuration,
                exerciseName: ex.name,
                // Override exerciseName to include set info? Or add a new field?
                // Dashboard displays 'exerciseName'. Let's append or use a specific field if Dashboard supports it.
                // Dashboard displays: {currentBlock.exerciseName} then below {currentBlock.setNumber}.
                // We can hack exerciseName or just rely on Dashboard showing Set X.
                // User wants: "Приложение должно писать: Рабочий сет №1".
                // I will put this label into a new property 'customLabel' or modify 'setNumber' display in Dashboard?
                // For now, let's inject it into exerciseName for visibility or handle in Dashboard.
                // Let's modify Dashboard later to show this label. For now calculate correctly.

                exerciseId: ex.id,
                reps: calculated.reps,
                weight: currentSetWeight,
                setNumber: set, // 1..4 (Dashboard shows "CET X")
                totalSets: totalSets,
                isNewExercise: calculated.isNew && set === 2, // Ask for weight on first WORKING set (set 2)? Or Warmup? Usually working.
                cycleIndex: calculated.cycleIndex,
                muscleGroup: ex.group,
                customLabel: setLabel
            });

            // REST - use restBetweenSets from settings
            if (set < totalSets) {
                blocks.push({
                    id: `blk_${blockId++}`,
                    type: BlockType.REST,
                    duration: settings.restBetweenSets,
                    nextExercise: `${ex.name} (Сет ${set + 1})`
                });
            }
        }

        // TRANSITION - use restBetweenExercises from settings
        if (i < template.exercises.length - 1) {
            blocks.push({
                id: `blk_${blockId++}`,
                type: BlockType.TRANSITION,
                duration: settings.restBetweenExercises,
                nextExercise: template.exercises[i + 1].name
            });
        }
    }

    // 3. CHECK_OUT (Body Weight End)
    blocks.push({
        id: `blk_${blockId++}`,
        type: BlockType.CHECK_OUT,
        duration: 0,
        requiresConfirmation: true
    });

    // 4. FINISH
    blocks.push({ id: `blk_${blockId++}`, type: BlockType.FINISH, duration: 0 });

    return blocks;
};

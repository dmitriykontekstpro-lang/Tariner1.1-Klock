import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Vibration, ActivityIndicator, Alert, Modal } from 'react-native';
import { TimelineBlock, BlockType } from '../types';
import { speak, clearSpeechQueue } from '../utils/generator';
import { CameraOverlay } from './CameraOverlay';
import { supabase, WorkoutRecord, ExerciseResult, getOrCreateUserId } from '../lib/supabaseClient';
import { playMetronomeClick } from '../utils/audio';
import { Ionicons } from '@expo/vector-icons';
import { updateLocalHistory, markWorkoutCompleted } from '../utils/historyStore';

interface DashboardProps {
    initialTimeline: TimelineBlock[];
    onFinish: () => void;
    disableHistoryUpdate?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialTimeline, onFinish, disableHistoryUpdate }) => {
    const timeline = initialTimeline;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timeline[0].duration);
    const [isPaused, setIsPaused] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Data Collection
    const [startTime] = useState<string>(new Date().toISOString());
    const [startBodyWeight, setStartBodyWeight] = useState<number>(0);
    const [endBodyWeight, setEndBodyWeight] = useState<number>(0);

    const [editedWeights, setEditedWeights] = useState<Record<string, number>>({});
    const [skippedExercises, setSkippedExercises] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [targetExerciseId, setTargetExerciseId] = useState<string | null>(null);

    const currentBlock = timeline[currentIndex];
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Effect: Handle Block Changes (Speech, Camera Triggers)
    useEffect(() => {
        const block = timeline[currentIndex];

        // 1. CHECK_IN
        if (block.type === BlockType.CHECK_IN) {
            speak("Взвешивание перед тренировкой.");
            setTimeout(() => {
                setShowCamera(true);
                setIsPaused(true);
            }, 1000);
            return;
        }

        // 2. CHECK_OUT
        if (block.type === BlockType.CHECK_OUT) {
            speak("Взвешивание после тренировки.");
            setTimeout(() => {
                setShowCamera(true);
                setIsPaused(true);
            }, 1000);
            return;
        }

        // 3. NEW EXERCISE - Request weight on first working set (set 2)
        if (block.type === BlockType.WORK && block.isNewExercise && block.setNumber === 2 && block.exerciseId) {
            speak(`Новое упражнение: ${block.exerciseName}. Установите вес снаряда.`);
            setTargetExerciseId(block.exerciseId);
            setTimeout(() => {
                setShowCamera(true);
                setIsPaused(true);
            }, 2000);
            return;
        }

        // Normal Flow
        setShowCamera(false);
        setIsPaused(false);

        if (block.type === BlockType.WORK) {
            const weight = editedWeights[block.exerciseId!] || block.weight;
            speak(`Подход ${block.setNumber}. ${weight} килограмм.`);
        } else if (block.type === BlockType.PREP) {
            speak("Приготовься к тренировке");
        } else if (block.type === BlockType.REST) {
            speak(`Отдых. Далее: ${block.nextExercise || 'нет'}`);
        } else if (block.type === BlockType.TRANSITION) {
            speak(`Смена снаряда. ${block.nextExercise}`);
        } else if (block.type === BlockType.FINISH) {
            speak("Тренировка окончена. Проверьте результаты.");
        }

    }, [currentIndex]);

    // Main Timer Loop
    useEffect(() => {
        if (isPaused || showCamera || showExitConfirm || currentBlock.type === BlockType.FINISH || currentBlock.duration === 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                // Countdown Beeps Logic (Rest/Prep/Trans -> Work)
                const nextIsWork = timeline[currentIndex + 1]?.type === BlockType.WORK;
                const isBreak = currentBlock.type === BlockType.REST || currentBlock.type === BlockType.TRANSITION || currentBlock.type === BlockType.PREP;

                if (isBreak && nextIsWork && prev <= 4 && prev > 1) {
                    // Beep at 3, 2, 1
                    const { playCountdownBeep } = require('../utils/audio');
                    playCountdownBeep();
                }

                if (prev <= 1) {
                    handleNextBlock();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused, showCamera, showExitConfirm, currentBlock, currentIndex]);

    // Metronome Logic
    useEffect(() => {
        if (currentBlock.type !== BlockType.WORK || isPaused || showCamera || showExitConfirm) return;
        // if (timeLeft <= 10) return; // Buffer zone? Maybe user wants metronome until the end. Let's keep it ticking.

        const elapsed = currentBlock.duration - timeLeft;
        // Metronome: 60 BPM (1 tick per second).
        // Beat 1: Strong, Beat 2: Weak.
        const isStrong = elapsed % 2 === 0;
        playMetronomeClick(isStrong);

    }, [timeLeft, currentBlock, isPaused, showCamera, showExitConfirm]);


    const handleNextBlock = () => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < timeline.length) {
            setCurrentIndex(nextIdx);
            setTimeLeft(timeline[nextIdx].duration);
        }
    };

    const skipBlock = () => {
        // Mark exercise as skipped if it's a WORK block
        if (currentBlock.type === BlockType.WORK && currentBlock.exerciseId) {
            // Treat explicit skip as "Done Early" for now, not "Skipped Exercise"
            // setSkippedExercises(prev => new Set(prev).add(currentBlock.exerciseId!));
        }
        clearSpeechQueue();
        handleNextBlock();
    };

    const handleCameraResult = (weight: number) => {
        console.log(`[Dashboard] handleCameraResult: ${weight}, blockType: ${currentBlock.type}`);

        if (currentBlock.type === BlockType.CHECK_IN) {
            console.log('[Dashboard] Setting Start Weight');
            setStartBodyWeight(weight);
            speak(`Вес атлета: ${weight} килограмм.`);
            setShowCamera(false);
            setIsPaused(false);
            handleNextBlock();
            return;
        }

        if (currentBlock.type === BlockType.CHECK_OUT) {
            console.log('[Dashboard] Setting End Weight');
            setEndBodyWeight(weight);
            speak(`Финальный вес: ${weight} килограмм.`);
            setShowCamera(false);
            setIsPaused(false);
            handleNextBlock();
            return;
        }

        if (currentBlock.type === BlockType.FINISH) {
            console.log('[Dashboard] Late End Weight on FINISH');
            setEndBodyWeight(weight);
            setShowCamera(false);
            return;
        }

        if (targetExerciseId) {
            setEditedWeights(prev => ({ ...prev, [targetExerciseId]: weight }));
            speak(`Вес установлен: ${weight} килограмм.`);
            setTargetExerciseId(null);
            setShowCamera(false);
            setIsPaused(false);
            // Don't skip to next block - continue current WORK block with new weight
        }
    };

    const openEditWeight = (exerciseId: string) => {
        setTargetExerciseId(exerciseId);
        setShowCamera(true);
    };

    const handleSaveAndExit = async () => {
        setSaving(true);
        speak("Сохранение данных.");

        const endTime = new Date().toISOString();
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

        // Collect unique muscle groups
        const muscleGroups = new Set<string>();

        const exercisesData: Record<string, ExerciseResult> = {};
        let totalReps = 0;
        let totalVolume = 0;

        // Process each unique exercise (not each set)
        const processedExercises = new Set<string>();

        timeline.forEach(block => {
            if (block.type === BlockType.WORK && block.exerciseId && !processedExercises.has(block.exerciseId)) {
                processedExercises.add(block.exerciseId);

                const actualWeight = editedWeights[block.exerciseId] || block.weight || 0;
                const isSkipped = skippedExercises.has(block.exerciseId);

                // Add muscle group
                if (block.muscleGroup) {
                    muscleGroups.add(block.muscleGroup);
                }

                // Calculate total reps for this exercise
                const exerciseSets = block.totalSets || 3;
                const exerciseReps = block.reps || 0;
                totalReps += exerciseSets * exerciseReps;
                totalVolume += actualWeight * exerciseSets * exerciseReps;

                exercisesData[block.exerciseId] = {
                    exerciseId: block.exerciseId,
                    name: block.exerciseName || '',
                    weight: actualWeight,
                    sets: exerciseSets,
                    reps: exerciseReps,
                    cycleIndex: block.cycleIndex || 0,
                    group: block.muscleGroup || 'UNKNOWN',
                    skipped: isSkipped
                };
            }
        });

        // NEW: Update Local History First (Offline First)
        if (!disableHistoryUpdate) {
            console.log("[Dashboard] Updating local history...", exercisesData);
            await updateLocalHistory(exercisesData);
        } else {
            console.log("[Dashboard] Custom workout - skipping history update");
        }

        const record = {
            // id: auto-generated
            started_at: startTime,
            ended_at: endTime,
            duration_min: durationMin,
            total_reps: totalReps,
            total_volume: totalVolume,
            weight_before: startBodyWeight > 0 ? startBodyWeight : null,
            weight_after: endBodyWeight > 0 ? endBodyWeight : null,
            exercises_data: exercisesData
        };

        try {
            // Save to Supabase (Background)
            console.log("[Dashboard] Saving to Supabase:", record);
            const { error } = await supabase.from('workouts').insert([record]);

            if (error) {
                console.error("[Dashboard] Supabase save error:", error);
                Alert.alert("Облако недоступно", "Данные сохранены локально.");
            } else {
                speak("Данные успешно сохранены.");
                console.log("[Dashboard] Saved successfully.");
            }

            await markWorkoutCompleted();
            setTimeout(() => onFinish(), 1000);
        } catch (err) {
            console.error("Save fatal error", err);
            speak("Ошибка сохранения.");
            Alert.alert("Ошибка", "Не удалось сохранить данные.");
            setSaving(false);
        }
    };

    const requestExit = () => {
        setIsPaused(true);
        setShowExitConfirm(true);
    };

    const cancelExit = () => {
        setShowExitConfirm(false);
        setIsPaused(false);
    };

    const confirmExit = () => {
        clearSpeechQueue();
        onFinish();
    };

    // UI Helpers
    const getTheme = () => {
        switch (currentBlock.type) {
            case BlockType.WORK: return 'text-flow-green border-flow-green';
            case BlockType.REST: return 'text-flow-blue border-flow-blue';
            case BlockType.TRANSITION: return 'text-flow-orange border-flow-orange';
            case BlockType.CHECK_IN:
            case BlockType.CHECK_OUT:
            case BlockType.PREP: return 'text-white border-gray-500';
            default: return 'text-white border-white';
        }
    };

    // Use border colors for rings
    const ringBorderColor = () => {
        switch (currentBlock.type) {
            case BlockType.WORK: return 'border-flow-green';
            case BlockType.REST: return 'border-flow-blue';
            case BlockType.TRANSITION: return 'border-flow-orange';
            default: return 'border-gray-500';
        }
    };

    if (showCamera) {
        let initWeight = 80;
        if (currentBlock.type === BlockType.CHECK_IN && startBodyWeight > 0) initWeight = startBodyWeight;
        else if (currentBlock.type === BlockType.CHECK_OUT && endBodyWeight > 0) initWeight = endBodyWeight;
        else if (currentBlock.type === BlockType.CHECK_OUT && startBodyWeight > 0) initWeight = startBodyWeight;
        if (targetExerciseId) {
            initWeight = editedWeights[targetExerciseId] ||
                timeline.find(b => b.exerciseId === targetExerciseId)?.weight || 20;
        }
        return (
            <CameraOverlay
                initialWeight={initWeight}
                onWeightDetected={handleCameraResult}
                onClose={() => handleCameraResult(initWeight)}
            />
        );
    }

    // FINISH SCREEN
    if (currentBlock.type === BlockType.FINISH) {
        const uniqueExercises = Array.from(new Set(timeline.filter(b => b.exerciseId).map(b => b.exerciseId)))
            .map(id => timeline.find(b => b.exerciseId === id)!);

        return (
            <View className="flex-1 bg-black p-6">
                <Text className="text-3xl font-sans font-bold text-flow-green mb-2 uppercase tracking-widest text-center mt-8">Отчет</Text>

                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-gray-900 p-3 rounded border border-gray-800 items-center">
                        <Text className="text-gray-500 text-[10px] uppercase">Вес До</Text>
                        <Text className="text-xl font-mono text-white">{startBodyWeight || '-'}</Text>
                    </View>
                    <View className="flex-1 bg-gray-900 p-3 rounded border border-gray-800 items-center">
                        <Text className="text-gray-500 text-[10px] uppercase">Вес После</Text>
                        <Text className="text-xl font-mono text-white">{endBodyWeight || '-'}</Text>
                    </View>
                </View>

                <Text className="text-gray-500 text-center mb-4 font-mono text-[10px]">НАЖМИТЕ НА ВЕС СНАРЯДА, ЧТОБЫ ИЗМЕНИТЬ</Text>

                <ScrollView className="flex-1">
                    {uniqueExercises.map((block) => {
                        const weight = (block.exerciseId && editedWeights[block.exerciseId])
                            ? editedWeights[block.exerciseId]
                            : block.weight;

                        return (
                            <TouchableOpacity
                                key={block.exerciseId}
                                onPress={() => !saving && block.exerciseId && openEditWeight(block.exerciseId)}
                                className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex-row justify-between items-center mb-3"
                            >
                                <View>
                                    <Text className="text-white font-sans text-sm uppercase">{block.exerciseName}</Text>
                                    <Text className="text-gray-500 font-mono text-xs">{(block.reps || 0) * (block.totalSets || 3)} REPS TOTAL</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-3xl font-mono font-bold text-flow-green">{weight}</Text>
                                    <Text className="text-gray-600 text-[10px] uppercase">KG</Text>
                                    <Text className="text-gray-600 text-lg">✎</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View className="mt-4 pt-4 border-t border-gray-800">
                    {saving ? (
                        <TouchableOpacity disabled className="w-full bg-gray-800 py-4 rounded items-center flex-row justify-center gap-4">
                            <ActivityIndicator color="white" />
                            <Text className="text-white font-sans text-xl uppercase tracking-wider">Сохранение...</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleSaveAndExit}
                            className="w-full bg-flow-green py-4 rounded items-center shadow shadow-green-400"
                        >
                            <Text className="text-black font-sans font-bold text-xl uppercase tracking-widest">ПОДТВЕРДИТЬ И ВЫЙТИ</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    const progressPercent = ((currentIndex) / timeline.length) * 100;
    const displayWeight = (currentBlock.exerciseId && editedWeights[currentBlock.exerciseId])
        ? editedWeights[currentBlock.exerciseId]
        : currentBlock.weight;

    // Render Time String
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <View className="flex-1 bg-black flex-col relative">

            {/* HEADER */}
            <View className="h-[35%] items-center justify-center relative border-b border-gray-900/50">
                <TouchableOpacity
                    onPress={requestExit}
                    className="absolute top-12 left-6 w-10 h-10 items-center justify-center border border-gray-800 rounded-full z-20"
                >
                    <Ionicons name="arrow-back" size={20} color="gray" />
                </TouchableOpacity>

                {currentBlock.duration > 0 ? (
                    <Text className={`text-8xl font-mono font-bold ${getTheme().split(' ')[0]}`}>
                        {mins}:{secs}
                    </Text>
                ) : (
                    <Text className="text-4xl font-sans font-bold text-white uppercase tracking-wider text-center px-4">
                        ВЗВЕШИВАНИЕ
                    </Text>
                )}

                <View className="absolute top-12 right-6 items-center">
                    <TouchableOpacity
                        onPress={requestExit}
                        className="w-8 h-8 items-center justify-center mb-1"
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text className="text-xs font-mono text-gray-500">
                        {currentIndex + 1}/{timeline.length}
                    </Text>
                </View>
            </View>

            {/* BODY */}
            <View className="flex-1 items-center justify-center p-6 bg-black z-10">
                {currentBlock.type === BlockType.WORK && (
                    <View className="items-center">
                        <Text className="text-3xl font-sans font-bold uppercase mb-4 text-white text-center pb-2">{currentBlock.exerciseName}</Text>
                        <View className="flex-row items-end justify-center gap-4">
                            <View className="items-center">
                                <Text className="text-6xl font-mono font-bold text-flow-green">{displayWeight}</Text>
                                <Text className="text-xs text-gray-400 font-sans tracking-widest uppercase">КГ</Text>
                            </View>
                            <Text className="text-4xl text-gray-600 font-thin mb-4">/</Text>
                            <View className="items-center">
                                <Text className="text-6xl font-mono font-bold text-white">{currentBlock.reps}</Text>
                                <Text className="text-xs text-gray-400 font-sans tracking-widest uppercase">ПОВТ</Text>
                            </View>
                        </View>
                        {currentBlock.customLabel ? (
                            <View className="mt-4 px-4 py-2 bg-gray-900 border border-flow-green rounded-lg">
                                <Text className="text-sm text-flow-green font-bold font-mono text-center uppercase">{currentBlock.customLabel}</Text>
                            </View>
                        ) : (
                            <View className="mt-4 px-3 py-1 border border-gray-700 rounded">
                                <Text className="text-xs text-gray-500 font-mono">СЕТ {currentBlock.setNumber} ИЗ {currentBlock.totalSets}</Text>
                            </View>
                        )}
                    </View>
                )}

                {currentBlock.type === BlockType.CHECK_IN && (
                    <View className="items-center">
                        <Text className="text-4xl font-sans font-bold uppercase text-white mb-2 text-center">ВЕС АТЛЕТА</Text>
                        <Text className="text-gray-500 font-mono">ПЕРЕД ТРЕНИРОВКОЙ</Text>
                    </View>
                )}

                {currentBlock.type === BlockType.CHECK_OUT && (
                    <View className="items-center">
                        <Text className="text-4xl font-sans font-bold uppercase text-white mb-2 text-center">ВЕС АТЛЕТА</Text>
                        <Text className="text-gray-500 font-mono">ПОСЛЕ ТРЕНИРОВКИ</Text>
                    </View>
                )}

                {currentBlock.type === BlockType.REST && (
                    <View className="items-center space-y-6 gap-6">
                        <Text className="text-5xl font-sans font-bold uppercase text-flow-blue tracking-widest">ОТДЫХ</Text>
                        {currentBlock.nextExercise && (
                            <View className="border-t border-gray-800 pt-4 items-center">
                                <Text className="text-gray-500 text-sm uppercase mb-1">ДАЛЕЕ</Text>
                                <Text className="text-xl text-white font-sans text-center">{currentBlock.nextExercise}</Text>
                            </View>
                        )}
                    </View>
                )}

                {currentBlock.type === BlockType.TRANSITION && (
                    <View className="items-center gap-4">
                        <Text className="text-3xl font-sans font-bold uppercase text-flow-orange text-center">СМЕНА СНАРЯДА</Text>
                        <Text className="text-2xl text-white text-center">{currentBlock.nextExercise}</Text>
                    </View>
                )}

                {currentBlock.type === BlockType.PREP && (
                    <Text className="text-4xl font-sans font-bold uppercase text-flow-orange text-center">ПРИГОТОВИТЬСЯ</Text>
                )}
            </View>

            {/* FOOTER */}
            <View className="h-[20%] justify-between pb-8 px-6">
                <View className="flex-row justify-center items-center gap-8 relative">
                    <TouchableOpacity
                        onPress={() => setIsPaused(!isPaused)}
                        className={`w-20 h-20 rounded-full border-2 ${ringBorderColor()} items-center justify-center`}
                    >
                        <Ionicons name={isPaused ? "play" : "pause"} size={32} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={skipBlock} className="absolute right-0 border border-gray-800 px-4 py-2 rounded">
                        <Text className="text-gray-500 text-sm font-sans uppercase">Skip &gt;&gt;</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Line */}
                <View className="w-full bg-gray-900 h-1 mt-6 rounded overflow-hidden">
                    <View
                        className={`h-full ${currentBlock.type === BlockType.WORK ? 'bg-flow-green' : currentBlock.type === BlockType.REST ? 'bg-flow-blue' : 'bg-flow-orange'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </View>
            </View>

            {/* EXIT CONFIRMATION MODAL */}
            <Modal visible={showExitConfirm} transparent animationType="fade" onRequestClose={cancelExit}>
                <View className="flex-1 bg-black/90 items-center justify-center p-6">
                    <View className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-6 items-center">
                        <Text className="text-2xl font-sans font-bold text-white uppercase mb-2 tracking-wide text-center">ЗАКОНЧИТЬ?</Text>
                        <Text className="text-gray-400 font-mono text-xs mb-8 text-center">ПРОГРЕСС ТЕКУЩЕЙ ТРЕНИРОВКИ БУДЕТ ПОТЕРЯН.</Text>

                        <View className="flex-row gap-4 w-full">
                            <TouchableOpacity
                                onPress={cancelExit}
                                className="flex-1 py-4 border border-gray-600 rounded items-center"
                            >
                                <Text className="text-gray-300 font-sans uppercase tracking-widest">ОТМЕНА</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmExit}
                                className="flex-1 py-4 bg-red-600 rounded items-center"
                            >
                                <Text className="text-white font-bold font-sans uppercase tracking-widest">ВЫЙТИ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

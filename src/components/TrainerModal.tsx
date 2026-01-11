import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { generateTrainerAdvice, TrainerJson } from '../lib/openai';

interface TrainerModalProps {
    visible: boolean;
    onClose: () => void;
    userProfile: UserProfile | null;
}

export const TrainerModal: React.FC<TrainerModalProps> = ({ visible, onClose, userProfile }) => {
    const [advice, setAdvice] = useState<TrainerJson | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && userProfile) {
            // Check cache first
            loadAdvice(false);
        }
    }, [visible, userProfile]); // Added userProfile to dependencies

    const loadAdvice = async (force: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            if (!force) {
                const cached = await AsyncStorage.getItem('trainer_advice');
                if (cached) {
                    // Start rendering cache immediately
                    setAdvice(JSON.parse(cached));
                    setLoading(false);
                    return;
                }
            }

            // Generate
            const result = await generateTrainerAdvice(userProfile!, userProfile?.weight);
            setAdvice(result);
            await AsyncStorage.setItem('trainer_advice', JSON.stringify(result));

        } catch (e) {
            setError('Не удалось связаться с тренером. Проверьте сеть или API ключ.');
        } finally {
            setLoading(false);
        }
    };

    const ProgressBar = ({ percent }: { percent: number }) => (
        <View className="h-2 bg-gray-700 rounded-full mt-2 mb-1 overflow-hidden">
            <View
                className="h-full bg-flow-green"
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
        </View>
    );

    const MacroCard = ({ label, grams, pct }: { label: string, grams: number, pct: number }) => (
        <View className="flex-1 bg-gray-800 p-2 rounded border border-gray-700 items-center">
            <Text className="text-gray-500 font-mono text-[10px] uppercase">{label}</Text>
            <Text className="text-white font-bold text-lg">{grams}г</Text>
            <Text className="text-flow-green text-xs font-mono">{pct}%</Text>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/90 justify-center p-6">
                <View className="bg-gray-900 w-full h-[85%] rounded-2xl border border-gray-700 overflow-hidden">
                    {/* Header */}
                    <View className="p-4 border-b border-gray-800 flex-row justify-between items-center bg-gray-900">
                        <View className="flex-row items-center gap-2">
                            <View className="w-8 h-8 rounded-full bg-flow-green items-center justify-center">
                                <Text className="text-black font-bold">AI</Text>
                            </View>
                            <Text className="text-white font-bold uppercase tracking-wider">ТРЕНЕР</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <Text className="text-gray-500 font-bold">ЗАКРЫТЬ</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView className="flex-1 p-6">
                        {loading && !advice && (
                            <View className="mt-20 items-center">
                                <ActivityIndicator size="large" color="#39FF14" />
                                <Text className="text-gray-500 mt-4 font-mono uppercase text-xs">АНАЛИЗИРУЮ ПРОФИЛЬ...</Text>
                            </View>
                        )}

                        {error && (
                            <View className="mt-20 items-center">
                                <Text className="text-red-500 text-center font-bold mb-4">{error}</Text>
                                <TouchableOpacity onPress={() => loadAdvice(true)} className="bg-gray-800 px-4 py-2 rounded">
                                    <Text className="text-white text-xs uppercase">ПОВТОРИТЬ</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!loading && advice && (
                            <View className="pb-10 gap-6">
                                {/* GOAL */}
                                <View className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                    <View className="flex-row justify-between items-baseline mb-2">
                                        <Text className="text-gray-400 font-mono text-xs uppercase">ПРОГРЕСС ЦЕЛИ</Text>
                                        <Text className="text-flow-green font-bold text-xl">{advice.goal.percent}%</Text>
                                    </View>
                                    <ProgressBar percent={advice.goal.percent} />
                                    <View className="flex-row justify-between mt-1">
                                        <Text className="text-gray-500 text-[10px]">Start: {advice.goal.startWeight}kg</Text>
                                        <Text className="text-gray-500 text-[10px]">Target: {advice.goal.targetWeight}kg</Text>
                                    </View>
                                    <Text className="text-white mt-3 text-sm italic">"{advice.goal.message}"</Text>
                                    <View className="mt-3 bg-gray-900 p-2 rounded">
                                        <Text className="text-gray-400 text-xs">Темп: <Text className="text-white">{advice.progress.pace}</Text></Text>
                                    </View>
                                </View>

                                {/* NUTRITION */}
                                <View>
                                    <Text className="text-gray-500 font-mono text-xs uppercase mb-3">ПЛАН ПИТАНИЯ</Text>
                                    <View className="flex-row gap-2 mb-2">
                                        <View className="flex-[1.2] bg-gray-800 p-2 rounded border border-gray-700 items-center justify-center">
                                            <Text className="text-gray-400 text-[10px] uppercase">КАЛОРИИ</Text>
                                            <Text className="text-white font-bold text-2xl">{advice.nutrition.calories}</Text>
                                            <Text className="text-flow-green font-bold text-xs mt-1">{advice.nutrition.delta}</Text>
                                        </View>
                                        <MacroCard label="БЕЛКИ" grams={advice.nutrition.protein.grams} pct={advice.nutrition.protein.percent} />
                                        <MacroCard label="ЖИРЫ" grams={advice.nutrition.fats.grams} pct={advice.nutrition.fats.percent} />
                                        <MacroCard label="УГЛЕВОДЫ" grams={advice.nutrition.carbs.grams} pct={advice.nutrition.carbs.percent} />
                                    </View>
                                </View>

                                {/* EXERCISES */}
                                <View>
                                    <Text className="text-gray-500 font-mono text-xs uppercase mb-3">РЕКОМЕНДУЕМЫЕ УПРАЖНЕНИЯ</Text>
                                    <View className="gap-3">
                                        {advice.exercises.map((group, idx) => (
                                            <View key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <Text className="text-flow-green font-bold uppercase mb-2 text-sm tracking-wider">{group.group}</Text>
                                                {group.list.map((ex, i) => (
                                                    <View key={i} className="flex-row items-center mb-1">
                                                        <View className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2" />
                                                        <Text className="text-white font-sans text-sm">{ex}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* REGENERATE BUTTON */}
                                <TouchableOpacity
                                    onPress={() => loadAdvice(true)}
                                    className="pt-6 pb-2 items-center"
                                >
                                    <View className="border border-gray-600 rounded px-6 py-3 flex-row items-center gap-2">
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white text-xs font-bold uppercase">Обновить рекомендации</Text>
                                        )}
                                    </View>
                                    <Text className="text-gray-600 text-[10px] mt-2 text-center uppercase">
                                        Сгенерирует новый план на основе{'\n'}текущего профиля
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

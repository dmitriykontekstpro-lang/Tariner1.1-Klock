import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UserProfile } from '../../types';
import { getDailySummary, deleteFoodEntry } from '../../utils/foodDiaryStore';
import { NutritionSummaryCard } from './NutritionSummaryCard';
import { FoodCameraModal } from './FoodCameraModal';
import { calculateNutrition } from '../../utils/calculations';
import { getLocalDateKey, isSameDay } from '../../utils/dateHelpers';

interface FoodDiaryScreenProps {
    userProfile: UserProfile | null;
    onClose: () => void;
}

export const FoodDiaryScreen: React.FC<FoodDiaryScreenProps> = ({ userProfile, onClose }) => {
    const [date, setDate] = useState(new Date());
    const [summary, setSummary] = useState<any>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadDaySummary = async (selectedDate: Date) => {
        setLoading(true);
        try {
            const dateStr = getLocalDateKey(selectedDate);
            const targetNutrition = userProfile ? calculateNutrition(userProfile) : undefined;
            const daySummary = await getDailySummary(dateStr, targetNutrition);
            setSummary(daySummary);
        } catch (e) {
            console.error('[FoodDiary] Failed to load summary:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[FoodDiary] Current Date Object:', date.toString());
        console.log('[FoodDiary] Local Date Key:', getLocalDateKey(date));
        loadDaySummary(date);
    }, [date, userProfile]);

    const goToPreviousDay = () => {
        setDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() - 1);
            return newDate;
        });
    };

    const goToNextDay = () => {
        setDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() + 1);
            return newDate;
        });
    };

    const goToToday = () => {
        setDate(new Date());
    };

    const isToday = isSameDay(date, new Date());

    const formatDate = (d: Date) => {
        const months = ['янв.', 'фев.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'];
        const day = d.getDate();
        const month = months[d.getMonth()];
        return `${day} ${month}`;
    };

    const handleDeleteEntry = async (entryId: string) => {
        try {
            await deleteFoodEntry(entryId);
            loadDaySummary(date);
        } catch (e) {
            console.error('Delete failed', e);
        }
    };

    // Force update date on mount
    useEffect(() => {
        setDate(new Date());
    }, []);

    // Log every render
    console.log('[FoodDiary] RENDER Date:', date.toString());

    // Deduplicate entries to prevent key warnings
    const uniqueEntries = summary?.entries
        ? Array.from(new Map(summary.entries.map((item: any) => [item.id, item])).values())
        : [];

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row justify-between items-center p-6 pt-12">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-flow-green items-center justify-center">
                        <Text className="text-2xl">🍽️</Text>
                    </View>
                    <Text className="text-white font-bold text-2xl uppercase tracking-wider">
                        ДНЕВНИК ПИТАНИЯ
                    </Text>
                </View>
                <TouchableOpacity onPress={onClose} className="p-2">
                    <Text className="text-gray-500 font-bold">✕</Text>
                </TouchableOpacity>
            </View>

            {/* Date Navigator */}
            <View className="flex-row items-center justify-between px-6 mb-4">
                <TouchableOpacity
                    onPress={goToPreviousDay}
                    className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center border border-gray-700"
                >
                    <Text className="text-white text-xl">←</Text>
                </TouchableOpacity>

                <View className="flex-row items-center gap-3">
                    <Text className="text-white font-bold text-lg">{formatDate(date)}</Text>
                    {!isToday && (
                        <TouchableOpacity
                            onPress={goToToday}
                            className="bg-gray-900 px-3 py-1 rounded border border-gray-700 flex-row items-center gap-1"
                        >
                            <Text className="text-flow-green text-[10px]">↻</Text>
                            <Text className="text-flow-green text-[10px] uppercase font-bold">К СЕГОДНЯ</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    onPress={goToNextDay}
                    disabled={isToday}
                    className={`w-10 h-10 rounded-full items-center justify-center border ${isToday ? 'bg-gray-800 border-gray-800' : 'bg-gray-900 border-gray-700'
                        }`}
                >
                    <Text className={isToday ? 'text-gray-700' : 'text-white'}> →</Text>
                </TouchableOpacity>
            </View>

            {/* Summary Card */}
            {loading ? (
                <View className="p-6">
                    <Text className="text-gray-500 text-center">Загрузка...</Text>
                </View>
            ) : (
                <NutritionSummaryCard summary={summary} />
            )}

            {/* Food Entries List */}
            <ScrollView className="flex-1 px-6">
                {uniqueEntries.length > 0 ? (
                    uniqueEntries.map((entry: any, index: number) => (
                        <View
                            key={entry.id || index}
                            className="bg-gray-900 p-4 rounded-lg mb-3 border border-gray-700 relative"
                        >
                            <View className="flex-row justify-between items-start pr-8">
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-base mb-1">
                                        {entry.foodName || 'Анализируется...'}
                                    </Text>
                                    {entry.portion && (
                                        <Text className="text-gray-500 text-xs mb-2">{entry.portion}</Text>
                                    )}
                                    {entry.analyzed && (
                                        <View className="flex-row gap-3">
                                            <Text className="text-flow-green text-xs">
                                                {entry.calories} ккал
                                            </Text>
                                            <Text className="text-gray-500 text-xs">
                                                Б: {entry.protein}г
                                            </Text>
                                            <Text className="text-gray-500 text-xs">
                                                Ж: {entry.fats}г
                                            </Text>
                                            <Text className="text-gray-500 text-xs">
                                                У: {entry.carbs}г
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Small Red Cross Delete Button */}
                            <TouchableOpacity
                                onPress={() => handleDeleteEntry(entry.id)}
                                className="absolute top-3 right-3 w-6 h-6 bg-red-600 rounded-full items-center justify-center shadow-sm"
                            >
                                <Text className="text-white text-[10px] font-bold">✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View className="py-12">
                        <Text className="text-gray-600 text-center text-sm">
                            {isToday ? 'Добавьте первый прием пищи' : 'Нет записей за этот день'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Food Button (only for today) */}
            {isToday && (
                <View className="p-6">
                    <TouchableOpacity
                        onPress={() => setShowCamera(true)}
                        className="bg-flow-green py-4 rounded-2xl items-center shadow-lg shadow-green-900/20"
                    >
                        <Text className="text-black font-bold text-lg uppercase tracking-widest">
                            + ДОБАВИТЬ ЕДУ
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Camera Modal */}
            <FoodCameraModal
                visible={showCamera}
                onClose={() => setShowCamera(false)}
                onSuccess={() => {
                    setShowCamera(false);
                    loadDaySummary(date);
                }}
            />
        </View>
    );
};

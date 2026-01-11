import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WorkoutTemplate, UserProfile } from '../types';
import { getDailySummary, syncFoodWithSupabase } from '../utils/foodDiaryStore';
import { calculateNutrition } from '../utils/calculations';
import { getLocalDateKey } from '../utils/dateHelpers';

interface LobbyProps {
    todayTemplate?: WorkoutTemplate;
    onStart: () => void;
    onOpenSettings: () => void;
    todayName: string;
    isSyncing?: boolean;
    totalDuration?: number;
    onAskTrainer: () => void;
    onOpenFoodDiary: () => void;
    userProfile: UserProfile | null;
    isWorkoutCompleted?: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({
    todayTemplate,
    onStart,
    onOpenSettings,
    todayName,
    isSyncing,
    totalDuration,
    onAskTrainer,
    onOpenFoodDiary,
    userProfile,
    isWorkoutCompleted
}) => {
    const [nutrition, setNutrition] = useState<{ current: number, target: number } | null>(null);

    // Get current date info
    const now = new Date();
    const monthNames = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
        'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];
    const currentMonth = monthNames[now.getMonth()];
    const dayOfMonth = now.getDate();
    const dayOfWeekShort = todayName;

    useEffect(() => {
        loadNutrition();
    }, [userProfile]);

    const loadNutrition = async () => {
        console.log('[Lobby] DEBUG: Starting loadNutrition...');
        try {
            // Step 1
            console.log('[Lobby] DEBUG: Calling syncFoodWithSupabase...');
            await syncFoodWithSupabase();
            console.log('[Lobby] DEBUG: Sync done.');

            // Step 2
            const target = userProfile ? calculateNutrition(userProfile) : undefined;
            console.log('[Lobby] DEBUG: Target calculated:', target ? 'Yes' : 'Undefined (UserProfile is null)');

            // Step 3
            const dateStr = getLocalDateKey(new Date());
            console.log('[Lobby] DEBUG: Calling getDailySummary for', dateStr);
            const summary = await getDailySummary(dateStr, target);
            console.log('[Lobby] DEBUG: Summary received, entries count:', summary?.entries?.length);

            const consumed = summary.entries.reduce((acc, entry) => acc + (entry.calories || 0), 0);

            let targetCalories = target?.targetCalories && target.targetCalories > 0 ? target.targetCalories : 2500;

            console.log('[Lobby] DEBUG: Setting state...');
            setNutrition({
                current: consumed,
                target: targetCalories
            });
            console.log('[Lobby] DEBUG: State set.');
        } catch (e) {
            console.error('[Lobby] CRITICAL ERROR inside loadNutrition:', e);
            setNutrition({ current: 0, target: 2500 });
        }
    };

    return (
        <View className="h-full w-full bg-black flex-col p-6">

            {/* Header */}
            <View className="flex-row justify-between items-start pt-4 mb-8">
                <View>
                    <Text className="text-white font-sans font-bold text-3xl uppercase tracking-tighter">{currentMonth}</Text>
                    <Text className="text-gray-500 font-mono text-sm tracking-wider mt-1">{dayOfWeekShort} {dayOfMonth}</Text>
                </View>
                <TouchableOpacity
                    onPress={onOpenSettings}
                    className="w-12 h-12 rounded-full bg-gray-900 items-center justify-center border border-gray-800"
                >
                    <Text className="text-2xl text-gray-400">⚙</Text>
                </TouchableOpacity>
            </View>

            {/* Grid 2x2 */}
            <View className="flex-1 flex-row flex-wrap justify-between content-start gap-y-4">

                {/* 1. Workout Card */}
                <TouchableOpacity
                    onPress={todayTemplate && !isWorkoutCompleted ? onStart : undefined}
                    disabled={isSyncing || !todayTemplate || isWorkoutCompleted}
                    className={`w-[48%] aspect-square ${isWorkoutCompleted ? 'bg-green-900/30 border-green-700' : 'bg-gray-900 border-gray-800'} rounded-3xl p-4 justify-between border relative overflow-hidden`}
                >
                    <View>
                        <View className={`w-8 h-8 ${isWorkoutCompleted ? 'bg-green-500' : 'bg-gray-800'} rounded-full items-center justify-center mb-2`}>
                            <Text className="text-sm">{isWorkoutCompleted ? '✅' : '💪'}</Text>
                        </View>
                        <Text className={`${isWorkoutCompleted ? 'text-green-500' : 'text-gray-500'} text-[10px] uppercase font-bold tracking-wider`}>
                            {isWorkoutCompleted ? 'ВЫПОЛНЕНО' : 'ТРЕНИРОВКА'}
                        </Text>
                    </View>

                    {todayTemplate ? (
                        <View>
                            <Text className={`text-white font-bold text-lg leading-5 mb-1 ${isWorkoutCompleted ? 'opacity-50' : ''}`} numberOfLines={3}>
                                {todayTemplate.name ? todayTemplate.name.replace(/\+/g, '\n+\n') : 'Unknown'}
                            </Text>
                            {!isWorkoutCompleted && (
                                <Text className="text-gray-500 text-[10px] font-mono mt-2">
                                    {totalDuration ? `${totalDuration} МИН` : '~45 МИН'}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View>
                            <Text className="text-gray-500 font-bold text-lg mb-1">ОТДЫХ</Text>
                            <Text className="text-gray-600 text-[10px]">Нет плана</Text>
                        </View>
                    )}

                    {isSyncing && (
                        <View className="absolute inset-0 bg-black/60 items-center justify-center">
                            <ActivityIndicator color="#00ff00" />
                        </View>
                    )}
                </TouchableOpacity>

                {/* 2. Food Diary Card */}
                <TouchableOpacity
                    onPress={onOpenFoodDiary}
                    className="w-[48%] aspect-square bg-gray-900 rounded-3xl p-4 justify-between border border-gray-800"
                >
                    <View>
                        <View className="w-8 h-8 bg-gray-800 rounded-full items-center justify-center mb-2">
                            <Text className="text-sm">🍽️</Text>
                        </View>
                        <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">ПИТАНИЕ</Text>
                    </View>

                    <View>
                        {/* DEBUG: FOOD CARD CONTENT HIDDEN
                        {nutrition ? (
                            <>
                                <View className="flex-row items-baseline gap-1">
                                    <Text className="text-flow-green font-bold text-2xl">{nutrition.current}</Text>
                                    <View className="flex-row items-baseline">
                                        <Text className="text-gray-500 text-sm mx-1">/</Text>
                                        <Text className="text-gray-500 text-sm font-bold">{nutrition.target}</Text>
                                    </View>
                                    <Text className="text-gray-600 text-[10px] ml-1">ккал</Text>
                                </View>
                                <View className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-flow-green"
                                        style={{ width: `${Math.min((nutrition.current / nutrition.target) * 100, 100)}%` }}
                                    />
                                </View>
                                <Text className="text-gray-600 text-[10px] mt-1 font-mono text-right">
                                    {nutrition.target > 0 ? Math.round((nutrition.current / nutrition.target) * 100) : 0}% от цели
                                </Text>
                            </>
                        ) : (
                            <ActivityIndicator size="small" color="#555" />
                        )} 
                        */}
                    </View>
                </TouchableOpacity>

                {/* 3. Exercise Base (Placeholder) */}
                <TouchableOpacity
                    disabled
                    className="w-[48%] aspect-square bg-gray-900/50 rounded-3xl p-4 justify-between border border-gray-800/50 opacity-60"
                >
                    <View>
                        <View className="w-8 h-8 bg-gray-800/50 rounded-full items-center justify-center mb-2">
                            <Text className="text-sm opacity-50">📚</Text>
                        </View>
                        <Text className="text-gray-600 text-[10px] uppercase font-bold tracking-wider">БАЗА</Text>
                    </View>
                    <View>
                        <Text className="text-gray-700 font-bold text-lg">СКОРО</Text>
                    </View>
                </TouchableOpacity>

                {/* 4. Health & Activity (Placeholder) */}
                <TouchableOpacity
                    disabled
                    className="w-[48%] aspect-square bg-gray-900/50 rounded-3xl p-4 justify-between border border-gray-800/50 opacity-60"
                >
                    <View>
                        <View className="w-8 h-8 bg-gray-800/50 rounded-full items-center justify-center mb-2">
                            <Text className="text-sm opacity-50">❤️</Text>
                        </View>
                        <Text className="text-gray-600 text-[10px] uppercase font-bold tracking-wider">ЗДОРОВЬЕ</Text>
                    </View>
                    <View>
                        <Text className="text-gray-700 font-bold text-lg">СКОРО</Text>
                    </View>
                </TouchableOpacity>

            </View>

            {/* AI Trainer Button */}
            <TouchableOpacity
                onPress={onAskTrainer}
                className="w-full bg-gray-800 py-4 rounded-2xl flex-row items-center justify-center gap-3 mt-4 border border-gray-700"
            >
                <Text className="text-xl">👨‍🏫</Text>
                <Text className="text-white font-bold uppercase tracking-widest text-sm">Спросить тренера</Text>
            </TouchableOpacity>

        </View>
    );
};

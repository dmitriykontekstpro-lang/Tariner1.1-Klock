import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { WorkoutTemplate, DailyNutritionSummary, UserProfile } from '../../types';
import { LobbyCard } from './LobbyCard';

interface LobbyProps {
    todayTemplate?: WorkoutTemplate;
    onStart: () => void;
    onOpenSettings: () => void;
    todayName: string;
    isSyncing?: boolean;
    totalDuration?: number;
    onAskTrainer: () => void;
    onOpenFoodDiary: () => void;

    // New Props for Data Logic
    dailySummary?: DailyNutritionSummary | null;
    userProfile?: UserProfile | null;
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
    dailySummary,
    userProfile
}) => {
    // Date Info
    const now = new Date();
    const monthNames = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
        'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];
    const currentMonth = monthNames[now.getMonth()];
    const dayOfMonth = now.getDate();

    // Goal Translation
    const getGoalLabel = (goal?: string) => {
        switch (goal) {
            case 'WEIGHT_LOSS': return 'ПОХУДЕНИЕ';
            case 'MUSCLE_GAIN': return 'НАБОР МАССЫ';
            case 'RECOMPOSITION': return 'РЕКОМПОЗИЦИЯ';
            case 'STRENGTH': return 'СИЛА';
            case 'ENDURANCE': return 'ВЫНОСЛИВОСТЬ';
            default: return 'НЕТ ЦЕЛИ';
        }
    };

    return (
        <View className="h-full w-full bg-black p-6 pt-8">
            {/* Header */}
            <View className="mb-8">
                <Text className="text-white font-sans font-bold text-3xl uppercase tracking-tighter">{currentMonth}</Text>
                <Text className="text-gray-500 font-mono text-sm tracking-wider mt-1">{todayName} {dayOfMonth}</Text>
            </View>

            {/* Grid */}
            <View className="flex-row flex-wrap justify-between">

                {/* 1. Workout Card */}
                <LobbyCard
                    title="СЕГОДНЯ"
                    icon="💪"
                    onPress={onStart}
                    actionLabel={todayTemplate ? "НАЧАТЬ" : undefined}
                    disabled={!todayTemplate}
                    loading={isSyncing}
                >
                    {todayTemplate ? (
                        <View>
                            <Text className="text-white font-bold text-2xl uppercase mb-1 leading-tight" numberOfLines={2}>
                                {todayTemplate.name}
                            </Text>
                            <Text className="text-gray-500 text-xs font-mono">
                                {todayTemplate.exercises.length} УПР • ~{totalDuration || 45} МИН
                            </Text>
                        </View>
                    ) : (
                        <View>
                            <Text className="text-gray-500 font-bold text-xl uppercase">ОТДЫХ</Text>
                            <Text className="text-gray-600 text-xs">Тренировок нет</Text>
                        </View>
                    )}
                </LobbyCard>

                {/* 2. Food Card */}
                <LobbyCard
                    title="ПИТАНИЕ"
                    icon="🍽️"
                    onPress={onOpenFoodDiary}
                    actionLabel="ОТКРЫТЬ"
                >
                    <View>
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-white font-bold text-3xl">
                                {Math.round(dailySummary?.totalCalories || 0)}
                            </Text>
                            <Text className="text-gray-500 text-xs font-bold">ККАЛ</Text>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden w-full">
                            <View
                                style={{ width: `${Math.min((dailySummary?.caloriesProgress || 0) * 100, 100)}%` }}
                                className="h-full bg-flow-green"
                            />
                        </View>
                    </View>
                </LobbyCard>

                {/* 3. Profile Card */}
                <LobbyCard
                    title="ПРОФИЛЬ"
                    icon="👤"
                    onPress={onOpenSettings}
                    actionLabel="НАСТРОЙКИ"
                >
                    <View>
                        <Text className="text-gray-400 text-xs uppercase mb-1">ЦЕЛЬ</Text>
                        <Text className="text-white font-bold text-sm uppercase mb-3">
                            {getGoalLabel(userProfile?.mainGoal)}
                        </Text>

                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-white font-bold text-2xl">
                                {userProfile?.weight || '--'}
                            </Text>
                            <Text className="text-gray-500 text-xs">КГ</Text>
                        </View>
                    </View>
                </LobbyCard>

                {/* 4. Log Card (Placeholder) */}
                <LobbyCard
                    title="ДНЕВНИК"
                    icon="📅"
                    onPress={() => { }}
                    disabled={true}
                >
                    <View className="items-center justify-center py-4 opacity-50">
                        <Text className="text-gray-600 font-bold text-xs uppercase text-center">
                            Скоро
                        </Text>
                    </View>
                </LobbyCard>

            </View>

            {/* Quick Actions / Floating or Bottom? 
                Actually design says 4 cards. We can leave trainer button floating or somewhere?
                The requirement didn't specify leaving the trainer button.
                But it's a useful feature. Let's add it as a small floating bubble or header action? 
                The design request didn't mention it, but I shouldn't remove features unless asked.
                I'll put it back in the header or user might miss it.
            */}
            <View className="absolute top-12 right-6">
                <TouchableOpacity
                    onPress={onAskTrainer}
                    className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 items-center justify-center shadow-lg"
                >
                    <Text className="text-xl">👨‍🏫</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

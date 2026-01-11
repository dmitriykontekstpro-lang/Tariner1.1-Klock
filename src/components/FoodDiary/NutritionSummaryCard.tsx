import React from 'react';
import { View, Text } from 'react-native';
import { DailyNutritionSummary } from '../../types';

interface NutritionSummaryCardProps {
    summary: DailyNutritionSummary | null;
}

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => {
    const clampedPercent = Math.min(Math.max(percent, 0), 150); // Cap at 150%
    const color = percent >= 90 && percent <= 110 ? '#39FF14' : percent > 110 ? '#FF4444' : '#FFA500';

    return (
        <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <View
                style={{ width: `${clampedPercent}%`, backgroundColor: color }}
                className="h-full rounded-full"
            />
        </View>
    );
};

const MacroMiniCard: React.FC<{ label: string; value: number; percent: number }> = ({ label, value, percent }) => {
    return (
        <View className="flex-1 bg-gray-800 p-3 rounded-lg">
            <Text className="text-gray-500 text-[10px] uppercase mb-1">{label}</Text>
            <Text className="text-white font-bold text-lg">{Math.round(value)}г</Text>
            <Text className={`text-xs font-bold mt-1 ${percent >= 90 && percent <= 110 ? 'text-flow-green' :
                    percent > 110 ? 'text-red-500' :
                        'text-orange-500'
                }`}>
                {percent}%
            </Text>
        </View>
    );
};

export const NutritionSummaryCard: React.FC<NutritionSummaryCardProps> = ({ summary }) => {
    if (!summary) {
        return (
            <View className="bg-gray-900 m-4 p-6 rounded-xl border border-gray-700">
                <Text className="text-gray-500 text-center">Нет данных за сегодня</Text>
            </View>
        );
    }

    return (
        <View className="bg-gray-900 m-4 p-4 rounded-xl border border-gray-700">
            {/* Total Calories */}
            <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-400 text-xs uppercase tracking-wider">Калории</Text>
                    <Text className="text-white font-bold text-xl">
                        {summary.totalCalories}
                        <Text className="text-gray-500 text-sm"> ккал</Text>
                    </Text>
                </View>
                <ProgressBar percent={summary.caloriesProgress} />
                <Text className="text-gray-500 text-xs mt-1 text-right">
                    {summary.caloriesProgress}% от цели
                </Text>
            </View>

            {/* Macros Row */}
            <Text className="text-gray-500 text-[10px] uppercase mb-2 tracking-wider">Макронутриенты</Text>
            <View className="flex-row gap-2">
                <MacroMiniCard
                    label="Белки"
                    value={summary.totalProtein}
                    percent={summary.proteinProgress}
                />
                <MacroMiniCard
                    label="Жиры"
                    value={summary.totalFats}
                    percent={summary.fatsProgress}
                />
                <MacroMiniCard
                    label="Углеводы"
                    value={summary.totalCarbs}
                    percent={summary.carbsProgress}
                />
            </View>
        </View>
    );
};

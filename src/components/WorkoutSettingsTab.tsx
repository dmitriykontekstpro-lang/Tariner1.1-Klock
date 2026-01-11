import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { WorkoutSettings } from '../types';

interface WorkoutSettingsTabProps {
    settings: WorkoutSettings;
    onUpdate: (settings: WorkoutSettings) => void;
}

export const WorkoutSettingsTab: React.FC<WorkoutSettingsTabProps> = ({ settings, onUpdate }) => {
    const [localSettings, setLocalSettings] = useState<WorkoutSettings>(
        settings || { restBetweenSets: 90, restBetweenExercises: 120 }
    );

    const updateSetting = (key: keyof WorkoutSettings, value: string) => {
        const numValue = parseInt(value) || 0;
        const updated = { ...localSettings, [key]: numValue };
        setLocalSettings(updated);
        onUpdate(updated);
    };

    const renderSetting = (
        label: string,
        key: keyof WorkoutSettings,
        unit: string,
        description: string
    ) => (
        <View className="mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800">
            <Text className="text-white font-sans font-bold text-base mb-1 uppercase tracking-wide">{label}</Text>
            <Text className="text-gray-500 text-xs mb-3">{description}</Text>

            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={() => updateSetting(key, String(localSettings[key] - 1))}
                    className="w-12 h-12 bg-gray-800 rounded-lg items-center justify-center border border-gray-700"
                >
                    <Text className="text-white text-2xl font-bold">−</Text>
                </TouchableOpacity>

                <View className="flex-1 bg-black border-2 border-flow-green rounded-lg p-3 flex-row items-baseline justify-center gap-2">
                    <TextInput
                        value={String(localSettings[key])}
                        onChangeText={(val) => updateSetting(key, val)}
                        keyboardType="numeric"
                        className="text-white text-3xl font-mono font-bold text-center min-w-[60px]"
                        selectTextOnFocus
                    />
                    <Text className="text-flow-green text-sm uppercase tracking-wider">{unit}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => updateSetting(key, String(localSettings[key] + 1))}
                    className="w-12 h-12 bg-gray-800 rounded-lg items-center justify-center border border-gray-700"
                >
                    <Text className="text-white text-2xl font-bold">+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderInfoBlock = (label: string, value: string, desc: string) => (
        <View className="mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <Text className="text-gray-400 font-sans font-bold text-base mb-1 uppercase tracking-wide">{label}</Text>
            <Text className="text-gray-600 text-xs mb-3">{desc}</Text>
            <View className="bg-black/50 border border-gray-800 rounded-lg p-3 items-center">
                <Text className="text-gray-300 font-mono font-bold text-sm uppercase">{value}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
            <Text className="text-gray-400 text-xs font-mono mb-6 text-center uppercase tracking-widest">
                ПАРАМЕТРЫ ТРЕНИРОВКИ
            </Text>

            {/* Read-Only Auto Params */}
            {renderInfoBlock(
                'Количество сетов',
                '1 РАЗМИНКА + 3 РАБОЧИХ',
                'Фиксированная структура для всех упражнений'
            )}

            {renderInfoBlock(
                'Повторения и Вес',
                'АВТО (ЦИКЛ 8-10-12-14)',
                'Прогрессия нагрузки управляется автоматически'
            )}

            {renderInfoBlock(
                'Длительность подхода',
                'REPS × 2 + 10 СЕК',
                'Рассчитывается индивидуально от количества повторений'
            )}

            {/* Editable Params */}
            <View className="my-4 border-t border-gray-800" />
            <Text className="text-flow-green text-xs font-mono mb-4 uppercase tracking-widest">
                НАСТРОЙКИ ТАЙМЕРА ОТДЫХА
            </Text>

            {renderSetting(
                'Отдых между сетами',
                'restBetweenSets',
                'сек',
                'Время отдыха между подходами одного упражнения'
            )}

            {renderSetting(
                'Отдых между упражнениями',
                'restBetweenExercises',
                'сек',
                'Время на смену снаряда и подготовку'
            )}

            <View className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <Text className="text-flow-green text-xs font-mono text-center">
                    ✓ Настройки сохраняются автоматически
                </Text>
            </View>
        </ScrollView>
    );
};

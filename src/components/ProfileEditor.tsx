import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { UserProfile, Gender, MainGoal, ExperienceLevel, TrainingLocation, ActivityLevel, SleepDuration } from '../types';
import { INJURY_OPTIONS, CHRONIC_OPTIONS } from '../data';
import { calculateNutrition } from '../utils/calculations';

interface ProfileEditorProps {
    profile: UserProfile | null;
    onSave: (p: UserProfile) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile: initialProfile, onSave }) => {
    const [profile, setProfile] = useState<Partial<UserProfile>>(initialProfile || {
        gender: 'MALE',
        age: 30,
        weight: 75,
        height: 175,
        injuries: [],
        chronic: [],
        mainGoal: 'MUSCLE_GAIN',
        experience: 'AMATEUR',
        location: 'GYM',
        daysPerWeek: 3,
        sessionDuration: 60,
        activityLevel: 'MODERATE',
        sleepDuration: '7_8'
    });

    const update = (key: keyof UserProfile, val: any) => {
        setProfile(p => ({ ...p, [key]: val }));
    };

    const toggleArray = (key: 'injuries' | 'chronic', val: string) => {
        setProfile(p => {
            const list = p[key] || [];
            if (val === 'НЕТ ОГРАНИЧЕНИЙ') return { ...p, [key]: [] };

            const exists = list.includes(val);
            const newList = exists ? list.filter(i => i !== val) : [...list, val];
            return { ...p, [key]: newList };
        });
    };

    const handleSave = () => {
        onSave(profile as UserProfile);
        Alert.alert("Успешно", "Данные профиля обновлены.");
    };

    const sectionTitle = (title: string) => (
        <Text className="text-gray-500 font-mono text-xs uppercase mt-6 mb-2">{title}</Text>
    );

    return (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
            <Text className="text-2xl font-bold text-white mb-6 uppercase">Профиль Атлета</Text>

            {sectionTitle('БИОМЕТРИЯ')}
            <View className="flex-row gap-4 mb-2">
                {['MALE', 'FEMALE'].map(g => (
                    <TouchableOpacity
                        key={g}
                        onPress={() => update('gender', g)}
                        className={`flex-1 p-3 rounded border ${profile.gender === g ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`text-center font-bold uppercase ${profile.gender === g ? 'text-black' : 'text-gray-400'}`}>
                            {g === 'MALE' ? 'Мужчина' : 'Женщина'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View className="flex-row gap-4">
                <View className="flex-1">
                    <Text className="text-gray-600 text-[10px] mb-1">ВОЗРАСТ</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={String(profile.age || '')}
                        onChangeText={t => update('age', parseInt(t) || 0)}
                        className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-600 text-[10px] mb-1">РОСТ (СМ)</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={String(profile.height || '')}
                        onChangeText={t => update('height', parseInt(t) || 0)}
                        className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-600 text-[10px] mb-1">ВЕС (КГ)</Text>
                    <TextInput
                        keyboardType="numeric"
                        value={String(profile.weight || '')}
                        onChangeText={t => update('weight', parseInt(t) || 0)}
                        className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                    />
                </View>
            </View>

            {sectionTitle('ЦЕЛЬ')}
            <View className="gap-2">
                {(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'RECOMPOSITION', 'STRENGTH', 'ENDURANCE'] as MainGoal[]).map(g => (
                    <TouchableOpacity
                        key={g}
                        onPress={() => update('mainGoal', g)}
                        className={`p-3 rounded border ${profile.mainGoal === g ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`font-bold uppercase text-xs ${profile.mainGoal === g ? 'text-black' : 'text-white'}`}>
                            {g === 'WEIGHT_LOSS' ? 'Похудение' : g === 'MUSCLE_GAIN' ? 'Набор массы' : g}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View className="mt-2">
                <Text className="text-gray-600 text-[10px] mb-1">ЦЕЛЕВОЙ ВЕС (КГ)</Text>
                <TextInput
                    keyboardType="numeric"
                    value={String(profile.targetWeight || '')}
                    onChangeText={t => update('targetWeight', parseInt(t) || 0)}
                    className="bg-gray-900 text-white p-3 rounded border border-gray-700"
                />
            </View>

            {sectionTitle('ОПЫТ')}
            <View className="flex-row gap-2">
                {(['BEGINNER', 'AMATEUR', 'ADVANCED'] as ExperienceLevel[]).map(e => (
                    <TouchableOpacity
                        key={e}
                        onPress={() => update('experience', e)}
                        className={`flex-1 p-3 rounded border ${profile.experience === e ? 'bg-white border-white' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`text-center font-bold uppercase text-[10px] ${profile.experience === e ? 'text-black' : 'text-white'}`}>
                            {e}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {sectionTitle('ТРАВМЫ')}
            <View className="flex-row flex-wrap gap-2">
                {INJURY_OPTIONS.map(i => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => toggleArray('injuries', i)}
                        className={`px-3 py-2 rounded-full border ${profile.injuries?.includes(i) ? 'bg-red-900 border-red-500' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`text-xs ${profile.injuries?.includes(i) ? 'text-white' : 'text-gray-500'}`}>{i}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {sectionTitle('ХРОНИЧЕСКИЕ')}
            <View className="flex-row flex-wrap gap-2">
                {CHRONIC_OPTIONS.map(c => {
                    const isSel = c === 'НЕТ ОГРАНИЧЕНИЙ' ? (!profile.chronic || profile.chronic.length === 0) : profile.chronic?.includes(c);
                    return (
                        <TouchableOpacity
                            key={c}
                            onPress={() => toggleArray('chronic', c)}
                            className={`px-3 py-2 rounded-full border ${isSel ? 'bg-yellow-700 border-yellow-500' : 'bg-gray-900 border-gray-700'}`}
                        >
                            <Text className={`text-xs ${isSel ? 'text-white' : 'text-gray-500'}`}>{c}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {sectionTitle('РАСЧЕТ ПИТАНИЯ (ИНФО)')}
            <View className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
                {(() => {
                    // Calculate based on current draft profile
                    // Cast to UserProfile assuming required fields are present (defaults handled in strict)
                    const plan = calculateNutrition(profile as UserProfile);
                    return (
                        <View>
                            <View className="flex-row justify-between mb-4 border-b border-gray-800 pb-2">
                                <Text className="text-gray-400 text-xs text-center self-center">ÖEL (ККАЛ)</Text>
                                <Text className="text-flow-green font-bold text-2xl">{plan.targetCalories}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <View className="items-center flex-1">
                                    <Text className="text-gray-500 text-[10px] mb-1">БЕЛКИ</Text>
                                    <Text className="text-white font-mono font-bold">{plan.protein}г</Text>
                                </View>
                                <View className="w-[1px] bg-gray-800 h-full" />
                                <View className="items-center flex-1">
                                    <Text className="text-gray-500 text-[10px] mb-1">ЖИРЫ</Text>
                                    <Text className="text-white font-mono font-bold">{plan.fats}г</Text>
                                </View>
                                <View className="w-[1px] bg-gray-800 h-full" />
                                <View className="items-center flex-1">
                                    <Text className="text-gray-500 text-[10px] mb-1">УГЛЕ.</Text>
                                    <Text className="text-white font-mono font-bold">{plan.carbs}г</Text>
                                </View>
                            </View>
                            <Text className="text-gray-600 text-[10px] mt-3 text-center italic">
                                *Авто-расчет по формуле Миффлина - Сан Жеора
                            </Text>
                        </View>
                    );
                })()}
            </View>

            <TouchableOpacity
                onPress={handleSave}
                className="mt-6 bg-flow-green py-4 rounded items-center"
            >
                <Text className="text-black font-bold uppercase tracking-widest">СОХРАНИТЬ ПРОФИЛЬ</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

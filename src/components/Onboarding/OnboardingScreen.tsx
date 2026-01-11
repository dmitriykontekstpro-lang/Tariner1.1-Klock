import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { UserProfile, Gender, MainGoal, ExperienceLevel, TrainingLocation, ActivityLevel, SleepDuration, NutritionPlan, WeeklySchedule, WorkoutTemplate } from '../../types';
import { INJURY_OPTIONS, CHRONIC_OPTIONS } from '../../data';
import { calculateNutrition } from '../../utils/calculations';
import { generateProgram } from '../../utils/programGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingScreenProps {
    onComplete: (profile: UserProfile, nutrition: NutritionPlan, schedule?: WeeklySchedule, templates?: WorkoutTemplate[]) => void;
}

const TOTAL_STEPS = 6;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        gender: 'MALE',
        injuries: [],
        chronic: [],
        activityLevel: 'MODERATE',
        sleepDuration: '7_8'
    });
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<NutritionPlan | null>(null);
    const [generatedProgram, setGeneratedProgram] = useState<{ schedule: WeeklySchedule, templates: WorkoutTemplate[] } | null>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [step]);

    const nextStep = () => {
        console.log('[Onboarding] nextStep pressed. Current:', step);
        if (step < TOTAL_STEPS) {
            console.log('[Onboarding] Setting step to:', step + 1);
            setStep(prev => prev + 1);
        } else {
            console.log('[Onboarding] Already at total steps');
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = async () => {
        console.log('[Onboarding] handleFinish started');
        setIsCalculating(true);
        // Simulate "AI Generation" delay
        setTimeout(async () => {
            try {
                const finalProfile = profile as UserProfile;
                console.log('[Onboarding] Calculating...');
                const nutrition = calculateNutrition(finalProfile);
                const prog = generateProgram(finalProfile);

                setResult(nutrition);
                setGeneratedProgram(prog);
                setIsCalculating(false);

                // Save to storage
                await AsyncStorage.setItem('user_profile', JSON.stringify(finalProfile));
                await AsyncStorage.setItem('nutrition_plan', JSON.stringify(nutrition));
                console.log('[Onboarding] Done.');
            } catch (e) {
                console.error('[Onboarding] Error:', e);
                setIsCalculating(false);
                Alert.alert('Error', 'Failed. Try again.');
            }
        }, 2000);
    };

    const handleConfirmResult = () => {
        if (result && profile) {
            onComplete(
                profile as UserProfile,
                result,
                generatedProgram?.schedule,
                generatedProgram?.templates
            );
        }
    };

    const updateProfile = (key: keyof UserProfile, value: any) => {
        console.log(`[Onboarding] updateProfile: ${key} -> ${value}`);
        setProfile(prev => ({ ...prev, [key]: value }));
    };

    const toggleArrayItem = (key: 'injuries' | 'chronic', value: string) => {
        setProfile(prev => {
            console.log(`Toggling ${key}: ${value}`);
            const list = prev[key] || [];
            const isSelected = list.includes(value);
            const newList = isSelected ? list.filter(i => i !== value) : [...list, value];
            return { ...prev, [key]: newList };
        });
    };

    const canProceed = () => {
        if (step === 5) return true; // Explicit override
        switch (step) {
            case 1: return !!profile.age && !!profile.height && !!profile.weight;
            case 2: return !!profile.mainGoal && !!profile.targetWeight;
            case 3: return !!profile.experience;
            case 4: return !!profile.location && !!profile.daysPerWeek && !!profile.sessionDuration;
            // Case 5 handled above, Case 6 removed
            default: return true;
        }
    };

    const renderHeader = () => (
        <View className="mb-6">
            <Text className="text-flow-green font-mono text-xs uppercase mb-1">ШАГ {step} ИЗ {TOTAL_STEPS}</Text>
            <View className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                <View className="h-full bg-flow-green" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </View>
        </View>
    );

    // --- STEPS RENDERERS ---

    const renderStep1_Bio = () => (
        <View className="gap-4">
            <Text className="text-white text-2xl font-bold uppercase mb-2">БИОМЕТРИЯ</Text>

            <Text className="text-gray-400 text-xs font-mono uppercase">ПОЛ</Text>
            <View className="flex-row gap-4">
                <TouchableOpacity
                    onPress={() => updateProfile('gender', 'MALE')}
                    className={`flex-1 p-4 rounded border ${profile.gender === 'MALE' ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                >
                    <Text className={`text-center font-bold uppercase ${profile.gender === 'MALE' ? 'text-black' : 'text-gray-400'}`}>МУЖЧИНА</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => updateProfile('gender', 'FEMALE')}
                    className={`flex-1 p-4 rounded border ${profile.gender === 'FEMALE' ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                >
                    <Text className={`text-center font-bold uppercase ${profile.gender === 'FEMALE' ? 'text-black' : 'text-gray-400'}`}>ЖЕНЩИНА</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-gray-400 text-xs font-mono uppercase mt-2">ВОЗРАСТ (ЛЕТ)</Text>
            <TextInput
                keyboardType="numeric"
                className="bg-gray-900 text-white p-4 rounded border border-gray-700 font-mono text-lg"
                placeholder="25"
                placeholderTextColor="#555"
                onChangeText={t => updateProfile('age', parseInt(t) || 0)}
                value={profile.age ? String(profile.age) : ''}
            />

            <Text className="text-gray-400 text-xs font-mono uppercase mt-2">РОСТ (СМ)</Text>
            <TextInput
                keyboardType="numeric"
                className="bg-gray-900 text-white p-4 rounded border border-gray-700 font-mono text-lg"
                placeholder="180"
                placeholderTextColor="#555"
                onChangeText={t => updateProfile('height', parseInt(t) || 0)}
                value={profile.height ? String(profile.height) : ''}
            />

            <Text className="text-gray-400 text-xs font-mono uppercase mt-2">ВЕС (КГ)</Text>
            <TextInput
                keyboardType="numeric"
                className="bg-gray-900 text-white p-4 rounded border border-gray-700 font-mono text-lg"
                placeholder="75"
                placeholderTextColor="#555"
                onChangeText={t => updateProfile('weight', parseInt(t) || 0)}
                value={profile.weight ? String(profile.weight) : ''}
            />
        </View>
    );

    const renderStep2_Goals = () => (
        <View className="gap-4">
            <Text className="text-white text-2xl font-bold uppercase mb-2">ЦЕЛЬ</Text>

            {(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'RECOMPOSITION', 'STRENGTH', 'ENDURANCE'] as MainGoal[]).map(goal => (
                <TouchableOpacity
                    key={goal}
                    onPress={() => updateProfile('mainGoal', goal)}
                    className={`p-4 rounded border ${profile.mainGoal === goal ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                >
                    <Text className={`font-bold uppercase ${profile.mainGoal === goal ? 'text-black' : 'text-white'}`}>
                        {goal === 'WEIGHT_LOSS' ? 'ПОХУДЕНИЕ' :
                            goal === 'MUSCLE_GAIN' ? 'НАБОР МАССЫ' :
                                goal === 'RECOMPOSITION' ? 'РЕКОМПОЗИЦИЯ' :
                                    goal === 'STRENGTH' ? 'РАЗВИТИЕ СИЛЫ' : 'ВЫНОСЛИВОСТЬ'}
                    </Text>
                </TouchableOpacity>
            ))}

            <Text className="text-gray-400 text-xs font-mono uppercase mt-4">ЖЕЛАЕМЫЙ ВЕС (КГ)</Text>
            <TextInput
                keyboardType="numeric"
                className="bg-gray-900 text-white p-4 rounded border border-gray-700 font-mono text-lg"
                placeholder="80"
                placeholderTextColor="#555"
                onChangeText={t => updateProfile('targetWeight', parseInt(t) || 0)}
                value={profile.targetWeight ? String(profile.targetWeight) : ''}
            />
        </View>
    );

    const renderStep3_Experience = () => (
        <View className="gap-4">
            <Text className="text-white text-2xl font-bold uppercase mb-2">ОПЫТ</Text>

            {(['BEGINNER', 'AMATEUR', 'ADVANCED'] as ExperienceLevel[]).map(exp => (
                <TouchableOpacity
                    key={exp}
                    onPress={() => updateProfile('experience', exp)}
                    className={`p-4 rounded border ${profile.experience === exp ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                >
                    <Text className={`font-bold uppercase ${profile.experience === exp ? 'text-black' : 'text-white'}`}>
                        {exp === 'BEGINNER' ? 'НОВИЧОК (0-6 МЕС)' :
                            exp === 'AMATEUR' ? 'ЛЮБИТЕЛЬ (0.5-2 ГОДА)' : 'ОПЫТНЫЙ (2+ ГОДА)'}
                    </Text>
                </TouchableOpacity>
            ))}

            <View className="mt-4">
                <Text className="text-gray-400 text-xs font-mono uppercase mb-2">СКОЛЬКО ОТЖИМАНИЙ?</Text>
                <View className="flex-row gap-2">
                    {['0-5', '10-20', '30+'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => updateProfile('pushUps', opt)}
                            className={`flex-1 p-3 rounded border text-center ${profile.pushUps === opt ? 'bg-gray-700 border-white' : 'bg-gray-900 border-gray-800'}`}
                        >
                            <Text className="text-white text-center font-mono">{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mt-2">
                <Text className="text-gray-400 text-xs font-mono uppercase mb-2">СКОЛЬКО ПОДТЯГИВАНИЙ?</Text>
                <View className="flex-row gap-2">
                    {['0', '1-5', '10+'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => updateProfile('pullUps', opt)}
                            className={`flex-1 p-3 rounded border text-center ${profile.pullUps === opt ? 'bg-gray-700 border-white' : 'bg-gray-900 border-gray-800'}`}
                        >
                            <Text className="text-white text-center font-mono">{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderStep4_Logistics = () => (
        <View className="gap-4">
            <Text className="text-white text-2xl font-bold uppercase mb-2">ГДЕ ТРЕНИРУЕМСЯ?</Text>

            {(['GYM', 'HOME', 'HOME_BASIC', 'STREET'] as TrainingLocation[]).map(loc => (
                <TouchableOpacity
                    key={loc}
                    onPress={() => updateProfile('location', loc)}
                    className={`p-4 rounded border ${profile.location === loc ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                >
                    <Text className={`font-bold uppercase ${profile.location === loc ? 'text-black' : 'text-white'}`}>
                        {loc === 'GYM' ? 'ТРЕНАЖЕРНЫЙ ЗАЛ' :
                            loc === 'HOME' ? 'ДОМА (СВОЙ ВЕС)' :
                                loc === 'HOME_BASIC' ? 'ДОМА (ГАНТЕЛИ/РЕЗИНКИ)' : 'УЛИЦА (ТУРНИКИ)'}
                    </Text>
                </TouchableOpacity>
            ))}

            <Text className="text-gray-400 text-xs font-mono uppercase mt-4">ДНЕЙ В НЕДЕЛЮ</Text>
            <View className="flex-row gap-2">
                {[2, 3, 4, 5].map(d => (
                    <TouchableOpacity
                        key={d}
                        onPress={() => updateProfile('daysPerWeek', d)}
                        className={`w-12 h-12 rounded border items-center justify-center ${profile.daysPerWeek === d ? 'bg-white border-white' : 'bg-gray-900 border-gray-800'}`}
                    >
                        <Text className={`font-bold text-lg ${profile.daysPerWeek === d ? 'text-black' : 'text-white'}`}>{d}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-gray-400 text-xs font-mono uppercase mt-4">ВРЕМЯ НА ТРЕНИРОВКУ</Text>
            <View className="flex-row gap-2">
                {[30, 45, 60, 90].map(m => (
                    <TouchableOpacity
                        key={m}
                        onPress={() => updateProfile('sessionDuration', m)}
                        className={`flex-1 p-3 rounded border items-center justify-center ${profile.sessionDuration === m ? 'bg-white border-white' : 'bg-gray-900 border-gray-800'}`}
                    >
                        <Text className={`font-mono text-xs ${profile.sessionDuration === m ? 'text-black' : 'text-white'}`}>{m} МИН</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep5_Health = () => (
        <View className="gap-4">
            <Text className="text-white text-2xl font-bold uppercase mb-2">ОГРАНИЧЕНИЯ</Text>
            <Text className="text-gray-500 text-sm mb-4">Выберите зоны, где есть боли или травмы:</Text>

            <View className="flex-row flex-wrap gap-2">
                {INJURY_OPTIONS.map(injury => (
                    <TouchableOpacity
                        key={injury}
                        onPress={() => toggleArrayItem('injuries', injury)}
                        className={`px-4 py-2 rounded-full border ${profile.injuries?.includes(injury) ? 'bg-red-600 border-white' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`${profile.injuries?.includes(injury) ? 'text-white' : 'text-gray-400'} font-bold text-xs`}>{injury}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-gray-500 text-sm mt-4 mb-2">Хронические состояния:</Text>
            <View className="flex-row flex-wrap gap-2">
                {CHRONIC_OPTIONS.map(cond => {
                    // Logic: 'No Restrictions' is selected if array is empty
                    const isSelected = cond === 'НЕТ ОГРАНИЧЕНИЙ'
                        ? (!profile.chronic || profile.chronic.length === 0)
                        : profile.chronic?.includes(cond);

                    return (
                        <TouchableOpacity
                            key={cond}
                            onPress={() => {
                                if (cond === 'НЕТ ОГРАНИЧЕНИЙ') setProfile(prev => ({ ...prev, chronic: [] }));
                                else toggleArrayItem('chronic', cond);
                            }}
                            className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-yellow-600 border-white' : 'bg-gray-900 border-gray-700'}`}
                        >
                            <Text className={`${isSelected ? 'text-white' : 'text-gray-400'} font-bold text-xs`}>{cond}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderStep6_Lifestyle = () => {
        console.log('[Onboarding] Rendering Step 6 (Simple)');
        return (
            <View className="gap-4">
                <Text className="text-white text-2xl font-bold uppercase mb-2">ОБРАЗ ЖИЗНИ</Text>

                <Text className="text-gray-400 text-xs font-mono uppercase">АКТИВНОСТЬ ВНЕ ЗАЛА</Text>
                {['SEDENTARY', 'LIGHT', 'MODERATE', 'HEAVY'].map((act) => (
                    <TouchableOpacity
                        key={act}
                        onPress={() => updateProfile('activityLevel', act)}
                        className={`p-4 rounded border ${profile.activityLevel === act ? 'bg-flow-green border-flow-green' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <View>
                            <Text className={`font-bold uppercase ${profile.activityLevel === act ? 'text-black' : 'text-white'}`}>
                                {act === 'SEDENTARY' ? 'СИДЯЧАЯ (ОФИС)' :
                                    act === 'LIGHT' ? 'МАЛАЯ (ПРОГУЛКИ)' :
                                        act === 'MODERATE' ? 'СРЕДНЯЯ (НА НОГАХ)' : 'ТЯЖЕЛАЯ (ФИЗИЧЕСКИЙ ТРУД)'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <Text className="text-gray-400 text-xs font-mono uppercase mt-4">СОН</Text>
                {['LESS_6', '7_8', 'MORE_9'].map((s) => (
                    <TouchableOpacity
                        key={s}
                        onPress={() => updateProfile('sleepDuration', s)}
                        className={`p-3 rounded border ${profile.sleepDuration === s ? 'bg-white border-white' : 'bg-gray-900 border-gray-700'}`}
                    >
                        <Text className={`font-bold uppercase text-center ${profile.sleepDuration === s ? 'text-black' : 'text-white'}`}>
                            {s === 'LESS_6' ? '< 6 ЧАСОВ' : s === '7_8' ? '7-8 ЧАСОВ (НОРМА)' : '9+ ЧАСОВ'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderStep7_Result = () => {
        if (isCalculating) return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#39FF14" />
                <Text className="text-white font-mono mt-4 text-center uppercase tracking-widest">
                    АНАЛИЗИРУЕМ ПРОФИЛЬ...{'\n'}
                    ПОДБИРАЕМ НАГРУЗКУ...{'\n'}
                    СЧИТАЕМ КБЖУ...
                </Text>
            </View>
        );

        if (!result) return null;

        return (
            <View className="flex-1">
                <Text className="text-flow-green font-mono text-center tracking-widest uppercase mb-2">ВАШ ПЛАН ГОТОВ</Text>
                <Text className="text-white font-sans text-4xl font-bold text-center uppercase mb-6">
                    {profile.mainGoal === 'WEIGHT_LOSS' ? 'СЖИГАНИЕ ЖИРА' :
                        profile.mainGoal === 'MUSCLE_GAIN' ? 'НАБОР МАССЫ' :
                            'РЕКОМПОЗИЦИЯ'}
                </Text>

                <View className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-4">
                    <Text className="text-white font-bold uppercase mb-2">ВАША ПРОГРАММА:</Text>
                    <View className="gap-2">
                        {generatedProgram?.templates.map(t => (
                            <View key={t.id} className="bg-black border border-gray-700 px-3 py-2 rounded flex-row justify-between">
                                <Text className="text-white font-mono text-xs">{t.name}</Text>
                                <Text className="text-gray-500 font-mono text-xs">{t.primaryGroup}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-xl items-center">
                        <Text className="text-gray-400 text-xs font-mono">КАЛОРИИ</Text>
                        <Text className="text-3xl text-white font-bold">{result.targetCalories}</Text>
                        <Text className="text-gray-600 text-[10px]">ККАЛ / ДЕНЬ</Text>
                    </View>
                    <View className="flex-1 bg-gray-900 border border-gray-800 p-4 rounded-xl items-center justify-center">
                        <Text className="text-gray-400 text-xs font-mono mb-1">БЕЛКИ: <Text className="text-white">{result.protein}г</Text></Text>
                        <Text className="text-gray-400 text-xs font-mono mb-1">ЖИРЫ: <Text className="text-white">{result.fats}г</Text></Text>
                        <Text className="text-gray-400 text-xs font-mono">УГЛЕ: <Text className="text-white">{result.carbs}г</Text></Text>
                    </View>
                </View>

                <View className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-6">
                    <Text className="text-white font-bold uppercase mb-2">РЕКОМЕНДАЦИИ:</Text>
                    <Text className="text-gray-400 text-xs leading-5">
                        • Тренировки: {profile.daysPerWeek} раза в неделю по {profile.sessionDuration} мин.
                        {'\n'}• Акцент: {profile.experience === 'BEGINNER' ? 'Базовые движения и техника' : 'Прогрессивная перегрузка'}.
                        {'\n'}• {profile.injuries && profile.injuries.length > 0 ? `Исключаем нагрузку на: ${profile.injuries.join(', ')}` : 'Без ограничений по упражнениям.'}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleConfirmResult}
                    className="bg-flow-green py-4 rounded items-center"
                >
                    <Text className="text-black font-bold uppercase tracking-widest">ПРИНЯТЬ ПРОГРАММУ</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-black p-6 pt-12">
            {!result && renderHeader()}

            <ScrollView ref={scrollViewRef} className="flex-1">
                <View key={step}>
                    {step === 1 && renderStep1_Bio()}
                    {step === 2 && renderStep2_Goals()}
                    {step === 3 && renderStep3_Experience()}
                    {step === 4 && renderStep4_Logistics()}
                    {step === 5 && renderStep5_Health()}
                    {step === 6 && renderStep7_Result()}
                </View>
            </ScrollView>

            {!result && step < 6 && (
                <View className="flex-row justify-between pt-6 border-t border-gray-900 mt-4">
                    {step > 1 ? (
                        <TouchableOpacity onPress={prevStep} className="px-6 py-3 bg-gray-900 rounded border border-gray-700">
                            <Text className="text-white font-bold uppercase">НАЗАД</Text>
                        </TouchableOpacity>
                    ) : <View />}

                    <TouchableOpacity
                        onPress={() => {
                            console.log(`[Onboarding] Button Pressed. Step: ${step}`);
                            if (step === 5) {
                                console.log('[Onboarding] Triggering Finish');
                                setStep(6);
                                handleFinish();
                            } else {
                                nextStep();
                            }
                        }}
                        disabled={!canProceed()}
                        className={`px-6 py-3 rounded ${canProceed() ? (step === 5 ? 'bg-flow-green shadow-lg shadow-green-900/50' : 'bg-white') : 'bg-gray-800'}`}
                    >
                        <Text className={`font-bold uppercase ${canProceed() ? 'text-black' : 'text-gray-500'}`}>
                            {step === 5 ? 'РАССЧИТАТЬ' : 'ДАЛЕЕ'} ({step}/{TOTAL_STEPS})
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

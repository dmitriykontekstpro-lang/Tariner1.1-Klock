import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // Fallback
// @ts-ignore
import { readAsStringAsync } from 'expo-file-system/legacy';

import { MealType } from '../../types';
import { analyzeFoodPhotoWithRetry } from '../../lib/foodAnalyzer';
import { addFoodEntry, updateFoodEntryAnalysis } from '../../utils/foodDiaryStore';

interface FoodCameraModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const FoodCameraModal: React.FC<FoodCameraModalProps> = ({ visible, onClose, onSuccess }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [photo, setPhoto] = useState<string | null>(null);

    // New Input States
    const [foodName, setFoodName] = useState('');
    const [weight, setWeight] = useState('');
    const [portionSize, setPortionSize] = useState<'S' | 'M' | 'L' | undefined>(undefined);

    const [mealType, setMealType] = useState<MealType>('LUNCH');
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraType>('back');

    // Request permissions on mount
    React.useEffect(() => {
        if (visible && !permission?.granted) {
            requestPermission();
        }
    }, [visible]);

    const takePhoto = async () => {
        if (!cameraRef.current) return;
        try {
            const photoData = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: false,
            });
            if (photoData?.uri) {
                setPhoto(photoData.uri);
            }
        } catch (e) {
            console.error('Failed to take picture', e);
            setError('Ошибка камеры');
        }
    };

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                setPhoto(result.assets[0].uri);
            }
        } catch (e) {
            console.error('Failed to pick image', e);
            setError('Ошибка выбора фото');
        }
    };

    const handleSend = async () => {
        if (!photo) return;
        setAnalyzing(true);
        setError(null);

        try {
            // 1. Add entry locally (temporary hints string for now)
            const hintsStr = `${foodName ? foodName : ''} ${weight ? weight + 'г' : ''} ${portionSize ? 'Размер: ' + portionSize : ''}`.trim();
            const entry = await addFoodEntry(photo, hintsStr, mealType);

            // 2. Read as Base64
            // Try legacy first, then standard (in case expo fixed it or context changed)
            let base64;
            try {
                base64 = await readAsStringAsync(photo, { encoding: 'base64' });
            } catch (err) {
                console.warn('Legacy read failed, trying standard', err);
                base64 = await FileSystem.readAsStringAsync(photo, { encoding: 'base64' });
            }

            // 3. AI Analysis with structured hints
            const analysis = await analyzeFoodPhotoWithRetry(base64, {
                foodName: foodName || undefined,
                weight: weight || undefined,
                portionSize: portionSize || undefined
            });

            // 4. Handle "No Food" case
            if (analysis.isFood === false) {
                Alert.alert(
                    'Еда не обнаружена',
                    'ИИ не нашел еды на фото. Попробуйте сделать снимок четче или с другого ракурса.',
                    [
                        { text: 'Переснять', onPress: () => setPhoto(null) },
                        { text: 'Отмена', onPress: resetAndClose, style: 'cancel' }
                    ]
                );
                setAnalyzing(false);
                return; // Stop here
            }

            // 5. Update entry if food found
            await updateFoodEntryAnalysis(entry.id, analysis);

            // 6. Done
            onSuccess();
            resetAndClose();
        } catch (e: any) {
            console.error('[FoodCamera] Analysis failed', e);
            setError(e.message || 'Ошибка анализа');
        } finally {
            setAnalyzing(false);
        }
    };

    const resetAndClose = () => {
        setPhoto(null);
        setFoodName('');
        setWeight('');
        setPortionSize(undefined);
        setError(null);
        setAnalyzing(false);
        onClose();
    };

    const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
        { value: 'BREAKFAST', label: 'Завтрак', icon: '🌅' },
        { value: 'LUNCH', label: 'Обед', icon: '☀️' },
        { value: 'DINNER', label: 'Ужин', icon: '🌙' },
        { value: 'SNACK', label: 'Перекус', icon: '🍎' }
    ];

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <Modal visible={visible} transparent animationType="slide">
                <View className="flex-1 bg-black justify-center items-center p-6">
                    <Text className="text-white text-center mb-4">Нужен доступ к камере</Text>
                    <TouchableOpacity onPress={requestPermission} className="bg-flow-green px-6 py-3 rounded-lg"><Text className="font-bold">Разрешить</Text></TouchableOpacity>
                    <TouchableOpacity onPress={onClose} className="mt-4"><Text className="text-gray-500">Закрыть</Text></TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View className="flex-1 bg-black">
                {/* 1. Camera / Preview Area */}
                <View className="flex-1 relative">
                    {!photo ? (
                        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />
                    ) : (
                        <Image source={{ uri: photo }} className="flex-1 bg-black" resizeMode="cover" />
                    )}

                    {/* Top Controls */}
                    <View className="absolute top-12 left-4 right-4 flex-row justify-between z-10">
                        <TouchableOpacity onPress={resetAndClose} className="bg-black/50 p-2 rounded-full">
                            <Text className="text-white text-lg font-bold px-2">✕</Text>
                        </TouchableOpacity>
                        {!photo && (
                            <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')} className="bg-black/50 p-2 rounded-full">
                                <Text className="text-white text-lg">🔄</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 2. Controls Area */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="bg-gray-900 border-t border-gray-800">
                    <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
                        {error && <View className="bg-red-900/50 p-3 rounded-lg mb-4"><Text className="text-red-400 text-center">{error}</Text></View>}

                        {/* Meal Type */}
                        <View className="flex-row justify-between mb-4">
                            {MEAL_TYPES.map((type) => (
                                <TouchableOpacity key={type.value} onPress={() => setMealType(type.value)} className={`items-center p-2 rounded-lg w-[23%] ${mealType === type.value ? 'bg-gray-700 border border-flow-green' : 'bg-gray-800'}`}>
                                    <Text className="text-xl mb-1">{type.icon}</Text>
                                    <Text className={`text-[10px] uppercase font-bold ${mealType === type.value ? 'text-flow-green' : 'text-gray-500'}`}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* New Inputs: Name, Weight, Portion */}
                        <View className="flex-row gap-2 mb-4">
                            {/* Name */}
                            <TextInput
                                placeholder="Название (опц.)"
                                placeholderTextColor="#666"
                                value={foodName}
                                onChangeText={setFoodName}
                                className="flex-1 bg-black text-white p-3 rounded-lg border border-gray-700"
                            />
                            {/* Weight */}
                            <TextInput
                                placeholder="Вес (г)"
                                placeholderTextColor="#666"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                className="w-20 bg-black text-white p-3 rounded-lg border border-gray-700 text-center"
                            />
                        </View>

                        {/* Portion Size Toggle */}
                        <View className="flex-row justify-between bg-black rounded-lg p-1 mb-4 border border-gray-700">
                            {(['S', 'M', 'L'] as const).map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    onPress={() => setPortionSize(portionSize === size ? undefined : size)}
                                    className={`flex-1 py-2 items-center rounded ${portionSize === size ? 'bg-flow-green' : ''}`}
                                >
                                    <Text className={`font-bold ${portionSize === size ? 'text-black' : 'text-gray-500'}`}>
                                        {size === 'S' ? 'Малая (S)' : size === 'M' ? 'Средняя (M)' : 'Большая (L)'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mb-4">
                            {!photo ? (
                                <>
                                    <TouchableOpacity onPress={takePhoto} className="flex-1 bg-flow-green h-14 rounded-xl items-center justify-center shadow-lg shadow-green-900/20">
                                        <Text className="text-black font-bold text-base uppercase tracking-widest">📷 Камера</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={pickFromGallery} className="flex-1 bg-gray-800 h-14 rounded-xl items-center justify-center border border-gray-700">
                                        <Text className="text-white font-bold text-base uppercase tracking-widest">🖼️ Галерея</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity onPress={() => setPhoto(null)} disabled={analyzing} className="w-14 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700">
                                        <Text className="text-2xl">↺</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSend} disabled={analyzing} className={`flex-1 h-14 rounded-xl items-center justify-center ${analyzing ? 'bg-gray-800' : 'bg-flow-green'}`}>
                                        {analyzing ? (
                                            <View className="flex-row items-center gap-2">
                                                <ActivityIndicator color="#39FF14" />
                                                <Text className="text-white font-bold uppercase">Анализ...</Text>
                                            </View>
                                        ) : (
                                            <Text className="text-black font-bold text-lg uppercase tracking-widest">Отправить</Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { speak } from '../utils/generator';

interface PrepScreenProps {
    onReady: () => void; // Called when time is up or user skips
    onCancel?: () => void;
}

export const PrepScreen: React.FC<PrepScreenProps> = ({ onReady, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(120);

    useEffect(() => {

        // Start prep speech
        speak("Подготовка к тренировке. У вас есть две минуты.");

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // Auto-start when time is up
    useEffect(() => {
        if (timeLeft === 0) {
            onReady();
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <View className="flex-1 bg-black items-center justify-between p-6 py-12">

            <View className="items-center mt-10">
                <Text className="text-flow-green font-mono text-xs uppercase tracking-widest mb-4">
                    ПОДГОТОВКА СИСТЕМЫ
                </Text>
                <Text className="text-white font-sans font-bold text-3xl uppercase text-center mb-2">
                    ПРИГОТОВЬТЕСЬ
                </Text>
                <Text className="text-gray-500 text-center px-8">
                    Наденьте экипировку, включите музыку и настройтесь на работу.
                </Text>
            </View>

            <View className="items-center justify-center h-64 w-64 rounded-full border-4 border-gray-800 relative">
                <Text className="text-7xl font-mono font-bold text-white">
                    {formatTime(timeLeft)}
                </Text>
            </View>

            <TouchableOpacity
                onPress={onReady}
                className="w-full bg-flow-green py-4 rounded items-center shadow shadow-green-400"
            >
                <Text className="text-black font-sans font-bold text-xl uppercase tracking-widest">
                    НАЧАТЬ СЕЙЧАС
                </Text>
            </TouchableOpacity>

            {onCancel && (
                <TouchableOpacity
                    onPress={onCancel}
                    className="w-full py-4 items-center"
                >
                    <Text className="text-gray-500 font-mono text-sm uppercase">ОТМЕНА</Text>
                </TouchableOpacity>
            )}
        </View>

    );
};

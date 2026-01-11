import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface LobbyCardProps {
    title: string;
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    actionLabel?: string;
    loading?: boolean;
    className?: string;
}

export const LobbyCard: React.FC<LobbyCardProps> = ({
    title,
    icon,
    onPress,
    disabled = false,
    children,
    actionLabel,
    loading = false,
    className = ""
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`w-[48%] bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-4 justify-between ${disabled ? 'opacity-50' : ''} ${className}`}
            style={{ minHeight: 160 }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider flex-1 mr-2">{title}</Text>
                <View className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
                    {typeof icon === 'string' ? <Text className="text-lg">{icon}</Text> : icon}
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 justify-center">
                {children}
            </View>

            {/* Footer / Action */}
            {actionLabel && (
                <View className="mt-3 pt-3 border-t border-gray-800">
                    <View className="flex-row items-center justify-between">
                        <Text className={`font-bold text-xs uppercase tracking-widest ${loading ? 'text-gray-500' : 'text-flow-green'}`}>
                            {loading ? 'ЗАГРУЗКА...' : actionLabel}
                        </Text>
                        <Text className="text-gray-600 text-xs">➜</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

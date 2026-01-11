import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { WorkoutTemplate, WeeklySchedule, WorkoutSettings, UserProfile } from '../types';
import { DAYS_OF_WEEK, EXERCISE_DB } from '../data';
import { Wizard } from './Wizard';
import { WorkoutSettingsTab } from './WorkoutSettingsTab';
import { ProfileEditor } from './ProfileEditor';
import { updateLocalHistory, loadLocalHistory, resetExerciseHistory, HistoryState } from '../utils/historyStore';

interface SettingsProps {
    templates: WorkoutTemplate[];
    schedule: WeeklySchedule;
    workoutSettings: WorkoutSettings;
    onUpdateTemplate: (tpl: WorkoutTemplate) => void;
    onUpdateSchedule: (day: number, tplId: string) => void;
    onUpdateWorkoutSettings: (settings: WorkoutSettings) => void;
    onHistoryChange: () => void; // Call to refresh App history
    onClose: () => void;
    userProfile: UserProfile | null;
    onUpdateProfile: (p: UserProfile) => void;
}

interface SelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    options: WorkoutTemplate[];
}

const SelectionModal: React.FC<SelectionModalProps> = ({ visible, onClose, onSelect, options }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity className="flex-1 bg-black/80 justify-center items-center p-6" activeOpacity={1} onPress={onClose}>
            <View className="bg-gray-900 w-full rounded-xl border border-gray-700 max-h-[50%]">
                <ScrollView>
                    <TouchableOpacity onPress={() => onSelect('')} className="p-4 border-b border-gray-800">
                        <Text className="text-white font-sans uppercase">ОТДЫХ</Text>
                    </TouchableOpacity>
                    {options.map(t => (
                        <TouchableOpacity key={t.id} onPress={() => onSelect(t.id)} className="p-4 border-b border-gray-800">
                            <Text className="text-white font-sans uppercase">{t.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </TouchableOpacity>
    </Modal>
);

export const Settings: React.FC<SettingsProps> = ({
    templates, schedule, workoutSettings,
    onUpdateTemplate, onUpdateSchedule, onUpdateWorkoutSettings,
    onHistoryChange, onClose,
    userProfile, onUpdateProfile
}) => {
    const [activeTab, setActiveTab] = useState<'ARSENAL' | 'SCHEDULE' | 'PARAMS' | 'HISTORY' | 'PROFILE'>('ARSENAL');
    const [showWizard, setShowWizard] = useState(false);
    const [wizardSlotId, setWizardSlotId] = useState('');
    const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | undefined>(undefined);

    // For Schedule Dropdown
    const [selectionDay, setSelectionDay] = useState<number | null>(null);

    // History State
    const [historyStats, setHistoryStats] = useState<HistoryState>({});
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Load History
    useEffect(() => {
        if (activeTab === 'HISTORY') {
            loadHistoryData();
        }
    }, [activeTab]);

    const loadHistoryData = async () => {
        setLoadingHistory(true);
        try {
            const h = await loadLocalHistory();
            setHistoryStats(h);
        } catch (e) {
            console.error("Failed to load history", e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleResetClick = (id: string, name: string) => {
        Alert.alert(
            "Сбросить историю?",
            `Вы уверены, что хотите удалить историю для "${name}"? Прогресс начнется с "Старт 0".`,
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Сбросить",
                    style: "destructive",
                    onPress: async () => {
                        await resetExerciseHistory(id);
                        if (onHistoryChange) onHistoryChange();
                        loadHistoryData(); // Refresh UI
                    }
                }
            ]
        );
    };

    const handleCreateClick = (id: string) => {
        setWizardSlotId(id);
        setEditingTemplate(undefined);
        setShowWizard(true);
    };

    const handleEditClick = (tpl: WorkoutTemplate) => {
        setWizardSlotId(tpl.id);
        setEditingTemplate(tpl);
        setShowWizard(true);
    };

    // Generate 6 slots (A-F)
    const slots = ['tpl_a', 'tpl_b', 'tpl_c', 'tpl_d', 'tpl_e', 'tpl_f'];

    return (
        <View className="h-full w-full bg-black flex-col">
            {/* Top Bar */}
            <View className="px-6 pt-4 pb-4 border-b border-gray-800 flex-row justify-between items-center bg-black z-20">
                <Text className="text-2xl font-sans font-bold tracking-widest text-gray-200">ШТАБ</Text>
                <TouchableOpacity onPress={onClose} className="border border-flow-green px-3 py-1 rounded">
                    <Text className="text-flow-green font-mono uppercase text-sm">НАЗАД</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-gray-800">
                <TouchableOpacity
                    onPress={() => setActiveTab('ARSENAL')}
                    className={`flex-1 py-4 items-center justify-center border-b-2 ${activeTab === 'ARSENAL' ? 'bg-gray-900 border-flow-green' : 'border-transparent'}`}
                >
                    <Text className={`font-mono font-bold uppercase text-[10px] ${activeTab === 'ARSENAL' ? 'text-flow-green' : 'text-gray-600'}`}>АРСЕНАЛ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('SCHEDULE')}
                    className={`flex-1 py-4 items-center justify-center border-b-2 ${activeTab === 'SCHEDULE' ? 'bg-gray-900 border-flow-green' : 'border-transparent'}`}
                >
                    <Text className={`font-mono font-bold uppercase text-[10px] ${activeTab === 'SCHEDULE' ? 'text-flow-green' : 'text-gray-600'}`}>РАСПИСАНИЕ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('PARAMS')}
                    className={`flex-1 py-4 items-center justify-center border-b-2 ${activeTab === 'PARAMS' ? 'bg-gray-900 border-flow-green' : 'border-transparent'}`}
                >
                    <Text className={`font-mono font-bold uppercase text-[10px] ${activeTab === 'PARAMS' ? 'text-flow-green' : 'text-gray-600'}`}>ПАРАМЕТРЫ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('PROFILE')}
                    className={`flex-1 py-4 items-center justify-center border-b-2 ${activeTab === 'PROFILE' ? 'bg-gray-900 border-flow-green' : 'border-transparent'}`}
                >
                    <Text className={`font-mono font-bold uppercase text-[10px] ${activeTab === 'PROFILE' ? 'text-flow-green' : 'text-gray-600'}`}>ПРОФИЛЬ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('HISTORY')}
                    className={`flex-1 py-4 items-center justify-center border-b-2 ${activeTab === 'HISTORY' ? 'bg-gray-900 border-flow-green' : 'border-transparent'}`}
                >
                    <Text className={`font-mono font-bold uppercase text-[10px] ${activeTab === 'HISTORY' ? 'text-flow-green' : 'text-gray-600'}`}>ИСТОРИЯ</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 bg-black">
                <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 80 }}>
                    {/* ARSENAL TAB */}
                    {activeTab === 'ARSENAL' && (
                        <View className="gap-4">
                            {slots.map((slotId, idx) => {
                                const tpl = templates.find(t => t.id === slotId);
                                const label = String.fromCharCode(65 + idx); // A, B, C...

                                return (
                                    <View key={slotId} className={`rounded-xl border-2 min-h-[100px] flex-row items-center justify-between p-6 ${tpl ? 'border-gray-800 bg-gray-900' : 'border-dashed border-gray-800'}`}>
                                        {tpl ? (
                                            <View className="w-full">
                                                <View className="flex-row justify-between items-start mb-2">
                                                    <Text className="text-gray-500 font-mono text-xs">SLOT {label}</Text>
                                                    <TouchableOpacity
                                                        onPress={() => handleEditClick(tpl)}
                                                        className="border border-gray-700 px-2 py-1 rounded"
                                                    >
                                                        <Text className="text-gray-400 font-mono text-xs uppercase">EDIT</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <Text className="text-xl font-sans font-bold text-white uppercase">{tpl.name}</Text>
                                                <Text className="text-xs text-gray-400 font-mono mt-1">{tpl.exercises.length} УПРАЖНЕНИЙ</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => handleCreateClick(slotId)}
                                                className="w-full h-full flex-row items-center justify-center gap-2"
                                            >
                                                <View className="w-8 h-8 rounded-full border border-gray-600 items-center justify-center">
                                                    <Text className="text-gray-600 text-lg">+</Text>
                                                </View>
                                                <Text className="text-gray-600 font-mono">СОЗДАТЬ СЛОТ {label}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* SCHEDULE TAB */}
                    {activeTab === 'SCHEDULE' && (
                        <View className="gap-2">
                            {[1, 2, 3, 4, 5, 6, 0].map((dataIndex) => {
                                const dayName = DAYS_OF_WEEK[dataIndex];
                                const assignedTplId = schedule[dataIndex];
                                const tpl = templates.find(t => t.id === assignedTplId);

                                return (
                                    <View key={dataIndex} className="flex-row items-center gap-4 bg-gray-900/50 p-4 rounded border border-gray-800">
                                        <Text className="w-10 font-mono font-bold text-gray-500">{dayName}</Text>
                                        <TouchableOpacity
                                            className="flex-1 bg-black p-2 rounded border border-gray-700"
                                            onPress={() => setSelectionDay(dataIndex)}
                                        >
                                            <Text className="text-white font-sans uppercase text-sm">
                                                {tpl ? tpl.name : 'ОТДЫХ'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* PARAMS TAB */}
                    {activeTab === 'PARAMS' && (
                        <View>
                            <WorkoutSettingsTab
                                settings={workoutSettings}
                                onUpdate={onUpdateWorkoutSettings}
                            />
                        </View>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'PROFILE' && (
                        <View>
                            <ProfileEditor
                                profile={userProfile}
                                onSave={onUpdateProfile}
                            />
                        </View>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'HISTORY' && (
                        <View>
                            {loadingHistory ? (
                                <ActivityIndicator size="large" color="#39FF14" />
                            ) : (
                                EXERCISE_DB ? Object.entries(EXERCISE_DB).map(([group, exercises]) => {
                                    // FILTER: Only show exercises THAT HAVE HISTORY
                                    const exercisesWithHistory = exercises.filter(ex => historyStats && !!historyStats[ex.id]);

                                    if (exercisesWithHistory.length === 0) return null;

                                    return (
                                        <View key={group} className="mb-8">
                                            <Text className="text-flow-green font-mono text-sm uppercase mb-3 tracking-widest bg-gray-900/50 p-2 rounded">{group}</Text>
                                            <View className="gap-2">
                                                {exercisesWithHistory.map(ex => {
                                                    const stats = historyStats[ex.id];
                                                    return (
                                                        <View key={ex.id} className="bg-black border border-gray-800 p-4 rounded-lg flex-row justify-between items-center">
                                                            <View className="flex-1 pr-4">
                                                                <Text className="text-white font-sans font-bold text-sm mb-1">{ex.name}</Text>
                                                                <View className="flex-row items-center gap-3">
                                                                    <View className="bg-gray-900 px-2 py-1 rounded">
                                                                        <Text className="text-xs text-gray-400 font-mono">
                                                                            BEC: <Text className="text-white">{stats.weight}</Text>
                                                                        </Text>
                                                                    </View>
                                                                    <View className="bg-gray-900 px-2 py-1 rounded">
                                                                        <Text className="text-xs text-gray-400 font-mono">
                                                                            ЦИКЛ: <Text className="text-flow-green">{stats.cycleIndex}</Text>
                                                                        </Text>
                                                                    </View>
                                                                    <Text className="text-gray-600 text-[10px] font-mono">TR: {stats.count}</Text>
                                                                </View>
                                                            </View>

                                                            <TouchableOpacity
                                                                onPress={() => handleResetClick(ex.id, ex.name)}
                                                                className="w-10 h-10 bg-red-900/10 rounded-full border border-red-900/50 items-center justify-center"
                                                            >
                                                                <Text className="text-red-500 font-bold text-xs">X</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    );
                                }) : <Text className="text-red-500 mt-10 text-center">Ошибка: База упражнений не найдена</Text>
                            )}

                            {!loadingHistory && historyStats && Object.keys(historyStats).length === 0 && (
                                <Text className="text-gray-600 font-mono text-center mt-10">ИСТОРИЯ ПУСТА</Text>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>

            {showWizard && (
                <Wizard
                    slotId={wizardSlotId}
                    initialTemplate={editingTemplate}
                    onClose={() => setShowWizard(false)}
                    onSave={onUpdateTemplate}
                />
            )}

            {/* Selection Modal for Schedule */}
            <SelectionModal
                visible={selectionDay !== null}
                options={templates}
                onClose={() => setSelectionDay(null)}
                onSelect={(id) => {
                    if (selectionDay !== null) onUpdateSchedule(selectionDay, id);
                    setSelectionDay(null);
                }}
            />

        </View>
    );
};

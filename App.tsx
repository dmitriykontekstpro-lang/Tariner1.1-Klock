import './global.css';
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './src/lib/supabaseClient';

import {
  UserProfile,
  WorkoutTemplate,
  WeeklySchedule,
  ExerciseHistory,
  TimelineBlock
} from './src/types';
import { INITIAL_TEMPLATES, INITIAL_SCHEDULE } from './src/data';
import { initUserId } from './src/lib/supabaseClient';
import { loadLocalHistory, HistoryState, getLastWorkoutDate } from './src/utils/historyStore';
import { startFoodDiarySyncService } from './src/utils/backgroundSync';

// Screens
import { OnboardingScreen } from './src/components/Onboarding/OnboardingScreen';
import { Lobby } from './src/components/Lobby';
import { PrepScreen } from './src/components/PrepScreen';
import { Dashboard as ActiveWorkoutScreen } from './src/components/Dashboard';
import { Settings } from './src/components/Settings';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // User State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Workout State
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(INITIAL_TEMPLATES);
  const [schedule, setSchedule] = useState<WeeklySchedule>(INITIAL_SCHEDULE);
  const [history, setHistory] = useState<HistoryState>({});

  // Navigation State
  const [view, setView] = useState<'LOBBY' | 'PREP' | 'WORKOUT' | 'SETTINGS'>('LOBBY');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  // Active Workout Session State
  const [activeTimeline, setActiveTimeline] = useState<TimelineBlock[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Init
  useEffect(() => {
    const init = async () => {
      await initUserId();
      checkWorkoutStatus();
      try {
        // Check Onboarding
        const savedProfile = await AsyncStorage.getItem('user_profile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }

        // Load workout settings & history
        const saved = await AsyncStorage.getItem('workout_settings');
        if (saved) setWorkoutSettings(JSON.parse(saved));

        const savedTemplates = await AsyncStorage.getItem('saved_templates');
        if (savedTemplates) {
          const parsed = JSON.parse(savedTemplates);
          if (Array.isArray(parsed)) {
            setTemplates(parsed);
          }
        }

        const savedSchedule = await AsyncStorage.getItem('saved_schedule');
        if (savedSchedule) setSchedule(JSON.parse(savedSchedule));

        const h = await loadLocalHistory();
        setHistory(h);

      } catch (e) {
        console.error('Failed to load settings', e);
      }
      setAppReady(true);

      // Start Food Diary background sync
      startFoodDiarySyncService();
    };
    init();
  }, []);

  // Get Today's Logic
  const todayDate = new Date();
  const todayIndex = todayDate.getDay();
  const todayTemplateId = schedule[todayIndex];
  const todayTemplate = templates.find(t => t.id === todayTemplateId);

  // Check if workout is done today
  const [isWorkoutDoneToday, setIsWorkoutDoneToday] = useState(false);

  const checkWorkoutStatus = async () => {
    const lastDate = await getLastWorkoutDate();
    const todayStr = new Date().toISOString().split('T')[0];
    setIsWorkoutDoneToday(lastDate === todayStr);
  };

  // Handlers
  const handleCompleteOnboarding = async (profile: UserProfile) => {
    setUserProfile(profile);
    await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const handleStartWorkout = (tpl: WorkoutTemplate) => {
    setSelectedTemplate(tpl);
    setView('PREP');
  };

  const handleConfirmStart = (blocks: TimelineBlock[]) => {
    setActiveTimeline(blocks);
    setView('WORKOUT');
  };

  const handleWorkoutFinish = async () => {
    // Reload history to check "Done" status
    const h = await loadLocalHistory();
    setHistory(h);
    await checkWorkoutStatus();
    setView('LOBBY');
  };

  const handleUpdateSchedule = async (dayIndex: number, tplId: string) => {
    const updated = await new Promise<WeeklySchedule>((resolve) => {
      setSchedule(prev => {
        const copy = { ...prev };
        copy[dayIndex] = tplId;
        resolve(copy);
        return copy;
      });
    });
    await AsyncStorage.setItem('saved_schedule', JSON.stringify(updated));
  };

  const [workoutSettings, setWorkoutSettings] = useState({
    restBetweenSets: 90,
    soundEnabled: true
  });

  if (!appReady) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#39FF14" />
      </View>
    );
  }

  // 1. Onboarding
  if (showOnboarding && !userProfile) {
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top', 'left', 'right']}>

          {view === 'LOBBY' && (
            <Lobby
              userProfile={userProfile}
              todayTemplate={todayTemplate}
              isWorkoutDoneToday={isWorkoutDoneToday}
              onStartWorkout={() => todayTemplate && handleStartWorkout(todayTemplate)}
              onOpenSettings={() => setView('SETTINGS')}
            />
          )}

          {view === 'PREP' && selectedTemplate && (
            <PrepScreen
              template={selectedTemplate}
              onStart={(blocks) => handleConfirmStart(blocks)}
              onCancel={() => setView('LOBBY')}
            />
          )}

          {view === 'WORKOUT' && (
            <ActiveWorkoutScreen
              timeline={activeTimeline}
              onFinish={handleWorkoutFinish}
              soundEnabled={workoutSettings.soundEnabled}
            />
          )}

          {view === 'SETTINGS' && (
            <Settings
              onBack={() => setView('LOBBY')}
              schedule={schedule}
              templates={templates}
              onUpdateSchedule={handleUpdateSchedule}
              settings={workoutSettings}
              onUpdateSettings={async (s) => {
                setWorkoutSettings(s);
                await AsyncStorage.setItem('workout_settings', JSON.stringify(s));
              }}
            />
          )}

        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

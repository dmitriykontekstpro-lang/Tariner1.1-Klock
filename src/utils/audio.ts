import { Vibration } from 'react-native';
import { Audio } from 'expo-av';

const strongClick = require('../../assets/metronome_strong.wav');
const weakClick = require('../../assets/metronome_weak.wav');
const beepSound = require('../../assets/countdown_beep.wav');

// Cache sound objects
let soundObjects: Record<string, Audio.Sound> = {};

const loadSound = async (key: string, source: any) => {
    if (soundObjects[key]) {
        try {
            await soundObjects[key].replayAsync();
        } catch (e) {
            // Reload if replay fails
            const { sound } = await Audio.Sound.createAsync(source);
            soundObjects[key] = sound;
            await sound.playAsync();
        }
    } else {
        const { sound } = await Audio.Sound.createAsync(source);
        soundObjects[key] = sound;
        await sound.playAsync();
    }
};

export const playMetronomeClick = async (strong: boolean) => {
    try {
        if (strong) {
            Vibration.vibrate(50); // Light haptic with sound
            await loadSound('strong', strongClick);
        } else {
            // No haptic or very light for weak beat
            await loadSound('weak', weakClick);
        }
    } catch (e) {
        // Fallback to vibration if sound fails
        Vibration.vibrate(strong ? 50 : 30);
    }
};

export const playCountdownBeep = async () => {
    try {
        await loadSound('beep', beepSound);
    } catch (e) {
        console.error("Beep failed", e);
    }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../themes/colors';

const KEYS = {
  brokerUrl: '@iot-control/broker-url',
  theme: '@iot-control/theme',
} as const;

export async function loadBrokerUrl(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.brokerUrl);
}

export async function saveBrokerUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.brokerUrl, url);
}

export async function loadTheme(): Promise<ThemeMode | null> {
  const value = await AsyncStorage.getItem(KEYS.theme);
  return value === 'light' || value === 'dark' ? value : null;
}

export async function saveTheme(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(KEYS.theme, mode);
}

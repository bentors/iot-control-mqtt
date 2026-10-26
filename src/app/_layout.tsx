import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { MqttProvider } from '../context/MqttContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { loadBrokerUrl, loadTheme } from '../services/storageService';
import { DEFAULT_BROKER_URL } from '../services/topics';
import type { ThemeMode } from '../themes/colors';

interface Preferences {
  brokerUrl: string;
  theme: ThemeMode;
}

function ThemedStack() {
  const { mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  useEffect(() => {
    const fallbackTheme: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
    Promise.all([loadBrokerUrl(), loadTheme()])
      .then(([brokerUrl, theme]) =>
        setPrefs({ brokerUrl: brokerUrl ?? DEFAULT_BROKER_URL, theme: theme ?? fallbackTheme }),
      )
      .catch(() => setPrefs({ brokerUrl: DEFAULT_BROKER_URL, theme: fallbackTheme }));
    // Carrega só na inicialização; mudanças do tema do sistema depois disso não sobrescrevem a preferência.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!prefs) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider initialMode={prefs.theme}>
      <MqttProvider initialBrokerUrl={prefs.brokerUrl}>
        <ThemedStack />
      </MqttProvider>
    </ThemeProvider>
  );
}

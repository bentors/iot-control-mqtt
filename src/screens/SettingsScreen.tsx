import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';
import { BASE_TOPIC, DEFAULT_BROKER_URL } from '../services/topics';

export default function SettingsScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const { status, brokerUrl, connect, disconnect } = useMqtt();
  const [url, setUrl] = useState(brokerUrl);

  useEffect(() => setUrl(brokerUrl), [brokerUrl]);

  // Em 'error' o cliente continua tentando reconectar, então Desconectar também deve aparecer.
  const isActive = status !== 'disconnected';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ConnectionStatus />

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>URL WebSocket do broker</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder={DEFAULT_BROKER_URL}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <Text style={[styles.hint, { color: colors.muted }]}>
          Use ws:// ou wss:// (ex.: {DEFAULT_BROKER_URL}). A porta 1883 é MQTT TCP e não funciona aqui.
        </Text>
        <View style={styles.row}>
          {isActive ? (
            <Button title="Desconectar" variant="outline" onPress={disconnect} />
          ) : (
            <Button title="Conectar" onPress={() => connect(url)} disabled={url.trim() === ''} />
          )}
          <Button title="Padrão" variant="outline" onPress={() => setUrl(DEFAULT_BROKER_URL)} />
        </View>
        <Text style={[styles.hint, { color: colors.muted }]}>Tópico base: {BASE_TOPIC}</Text>
      </View>

      <View style={[styles.card, styles.themeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Tema escuro</Text>
        <Switch value={mode === 'dark'} onValueChange={toggleTheme} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

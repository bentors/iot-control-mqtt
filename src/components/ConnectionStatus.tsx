import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';
import type { ConnectionStatus as Status } from '../types/mqtt';
import type { Palette } from '../themes/colors';
import { Button } from './Button';

const LABELS: Record<Status, string> = {
  connecting: 'Conectando…',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro de conexão',
};

function statusColor(status: Status, colors: Palette): string {
  if (status === 'connected') return colors.success;
  if (status === 'connecting') return colors.warning;
  if (status === 'error') return colors.danger;
  return colors.muted;
}

export function ConnectionStatus() {
  const { colors } = useTheme();
  const { status, error, brokerUrl, connect } = useMqtt();
  const color = statusColor(status, colors);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        {status === 'connecting' ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <View style={[styles.dot, { backgroundColor: color }]} />
        )}
        <Text style={[styles.label, { color }]}>{LABELS[status]}</Text>
      </View>
      <Text style={[styles.url, { color: colors.muted }]} numberOfLines={1}>
        {brokerUrl}
      </Text>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
      {(status === 'error' || status === 'disconnected') && (
        <View style={styles.action}>
          <Button title="Reconectar" variant="outline" onPress={() => connect(brokerUrl)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  url: {
    fontSize: 13,
  },
  error: {
    fontSize: 14,
  },
  action: {
    flexDirection: 'row',
    marginTop: 6,
  },
});

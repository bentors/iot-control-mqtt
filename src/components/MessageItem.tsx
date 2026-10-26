import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { HistoryMessage } from '../types/mqtt';
import { formatTime } from '../utils/format';

interface MessageItemProps {
  message: HistoryMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const { colors } = useTheme();
  const sent = message.direction === 'sent';
  const accent = sent ? colors.primary : colors.success;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.direction}>
          <Ionicons name={sent ? 'arrow-up-circle' : 'arrow-down-circle'} size={18} color={accent} />
          <Text style={[styles.directionText, { color: accent }]}>{sent ? 'Enviada' : 'Recebida'}</Text>
          {!message.valid && (
            <Text style={[styles.invalid, { color: colors.danger, borderColor: colors.danger }]}>inválida</Text>
          )}
        </View>
        <Text style={[styles.time, { color: colors.muted }]}>{formatTime(message.timestamp)}</Text>
      </View>
      <Text style={[styles.topic, { color: colors.muted }]}>{message.topic}</Text>
      <Text style={[styles.payload, { color: colors.text }]}>{message.payload}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  direction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  invalid: {
    fontSize: 11,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  time: {
    fontSize: 12,
  },
  topic: {
    fontSize: 12,
  },
  payload: {
    fontSize: 15,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
});

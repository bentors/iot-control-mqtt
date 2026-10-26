import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { SensorReading } from '../types/mqtt';
import { formatTime } from '../utils/format';

interface SensorCardProps {
  title: string;
  unit: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  reading: SensorReading | null;
}

export function SensorCard({ title, unit, icon, reading }: SensorCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>
        {reading ? `${reading.value.toFixed(1)} ${unit}` : '--'}
      </Text>
      <Text style={[styles.time, { color: colors.muted }]}>
        {reading ? `Atualizado às ${formatTime(reading.timestamp)}` : 'Aguardando dados…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
  },
});

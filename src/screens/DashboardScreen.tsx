import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { SensorCard } from '../components/SensorCard';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/format';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { temperature, humidity, lamp, pendingCommand, commandError, sendLampCommand } = useMqtt();
  const isOn = lamp?.state === 'ON';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <ConnectionStatus />

      <View style={styles.row}>
        <SensorCard title="Temperatura" unit="°C" icon="thermometer-outline" reading={temperature} />
        <SensorCard title="Umidade" unit="%" icon="water-outline" reading={humidity} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.lampHeader}>
          <Ionicons
            name={isOn ? 'bulb' : 'bulb-outline'}
            size={44}
            color={isOn ? colors.warning : colors.muted}
          />
          <View style={styles.lampInfo}>
            <Text style={[styles.lampTitle, { color: colors.muted }]}>Lâmpada</Text>
            <Text style={[styles.lampState, { color: colors.text }]}>
              {lamp ? (isOn ? 'Ligada' : 'Desligada') : 'Estado desconhecido'}
            </Text>
            {lamp && (
              <Text style={[styles.small, { color: colors.muted }]}>
                Confirmado às {formatTime(lamp.timestamp)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <Button title="Ligar" onPress={() => sendLampCommand('ON')} disabled={pendingCommand !== null} />
          <Button
            title="Desligar"
            variant="outline"
            onPress={() => sendLampCommand('OFF')}
            disabled={pendingCommand !== null}
          />
        </View>

        {pendingCommand && (
          <Text style={[styles.small, { color: colors.warning }]}>
            Comando {pendingCommand} enviado. Aguardando confirmação do dispositivo…
          </Text>
        )}
        {commandError && <Text style={[styles.small, { color: colors.danger }]}>{commandError}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  lampHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  lampInfo: {
    flex: 1,
    gap: 2,
  },
  lampTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  lampState: {
    fontSize: 22,
    fontWeight: '700',
  },
  small: {
    fontSize: 13,
  },
});

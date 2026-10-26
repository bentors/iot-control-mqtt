import { FlatList, StyleSheet, Text } from 'react-native';
import { MessageItem } from '../components/MessageItem';
import { useMqtt } from '../context/MqttContext';
import { useTheme } from '../context/ThemeContext';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { history } = useMqtt();

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem message={item} />}
      ListHeaderComponent={
        <Text style={[styles.header, { color: colors.muted }]}>
          Últimas 10 mensagens (mais recentes primeiro)
        </Text>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.muted }]}>
          Nenhuma mensagem ainda. Conecte-se ao broker e inicie o simulador.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },
  header: {
    fontSize: 13,
  },
  empty: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 32,
  },
});

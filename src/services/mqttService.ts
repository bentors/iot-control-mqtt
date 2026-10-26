import mqtt, { type MqttClient } from 'mqtt';
import type { ConnectionStatus } from '../types/mqtt';
import { SUBSCRIBED_TOPICS } from './topics';

type StatusListener = (status: ConnectionStatus, error: string | null) => void;
type MessageListener = (topic: string, payload: string) => void;

const RECONNECT_PERIOD_MS = 5000;

let client: MqttClient | null = null;
const statusListeners = new Set<StatusListener>();
const messageListeners = new Set<MessageListener>();

function emitStatus(status: ConnectionStatus, error: string | null = null) {
  statusListeners.forEach((listener) => listener(status, error));
}

/** Registra um listener de status; retorna a função que o remove. */
export function onStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

/** Registra um listener de mensagens; retorna a função que o remove. */
export function onMessage(listener: MessageListener): () => void {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
}

export function connect(url: string) {
  disconnect();

  if (!/^wss?:\/\//.test(url)) {
    emitStatus('error', 'A URL deve começar com ws:// ou wss://');
    return;
  }

  emitStatus('connecting');
  const c = mqtt.connect(url, {
    clientId: `iot-control-${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: RECONNECT_PERIOD_MS,
    connectTimeout: 10_000,
    clean: true,
  });
  client = c;

  c.on('connect', () => {
    emitStatus('connected');
    c.subscribe(SUBSCRIBED_TOPICS, { qos: 0 }, (err) => {
      if (err) emitStatus('error', `Falha ao inscrever nos tópicos: ${err.message}`);
    });
  });
  c.on('reconnect', () => emitStatus('connecting'));
  c.on('error', (err) => emitStatus('error', err.message));
  // 'close' só chega aqui se a desconexão não foi pedida pelo usuário (disconnect() remove os listeners antes).
  c.on('close', () =>
    emitStatus('error', `Conexão perdida. Tentando reconectar em ${RECONNECT_PERIOD_MS / 1000}s…`),
  );
  c.on('message', (topic, buffer) => {
    const payload = buffer.toString();
    messageListeners.forEach((listener) => listener(topic, payload));
  });
}

export function disconnect() {
  if (!client) return;
  const c = client;
  client = null;
  c.removeAllListeners();
  if (c.connected) c.unsubscribe(SUBSCRIBED_TOPICS);
  c.end(true);
  emitStatus('disconnected');
}

export function isConnected(): boolean {
  return client?.connected ?? false;
}

/** Publica e resolve quando o broker aceita; rejeita se estiver desconectado. */
export function publish(topic: string, payload: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!client?.connected) {
      reject(new Error('Sem conexão com o broker. Conecte-se antes de enviar comandos.'));
      return;
    }
    client.publish(topic, payload, { qos: 0 }, (err) => (err ? reject(err) : resolve()));
  });
}

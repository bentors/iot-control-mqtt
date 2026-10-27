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

export const isValidBrokerUrl = (url: string): boolean => /^wss?:\/\/\S+$/.test(url);

/** Inicia a conexão; retorna false se a URL for inválida. */
export function connect(url: string): boolean {
  disconnect();

  if (!isValidBrokerUrl(url)) {
    emitStatus('error', 'A URL deve começar com ws:// ou wss://');
    return false;
  }

  emitStatus('connecting');
  const c = mqtt.connect(url, {
    clientId: `iot-control-${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: RECONNECT_PERIOD_MS,
    connectTimeout: 10_000,
    clean: true,
  });
  client = c;
  let lastError: string | null = null;

  // Os listeners não são removidos no disconnect() (isso apagaria os handlers internos do mqtt.js,
  // e um 'error' tardio sem listener derrubaria o app); eventos de um cliente antigo são ignorados aqui.
  const isCurrent = () => client === c;

  c.on('connect', () => {
    if (!isCurrent()) return;
    lastError = null;
    emitStatus('connected');
    c.subscribe(SUBSCRIBED_TOPICS, { qos: 0 }, (err) => {
      if (err && isCurrent()) emitStatus('error', `Falha ao inscrever nos tópicos: ${err.message}`);
    });
  });
  c.on('reconnect', () => isCurrent() && emitStatus('connecting'));
  c.on('error', (err) => {
    if (!isCurrent()) return;
    lastError = err.message;
    emitStatus('error', err.message);
  });
  c.on('close', () => {
    if (!isCurrent()) return;
    const retry = `Tentando reconectar em ${RECONNECT_PERIOD_MS / 1000}s…`;
    emitStatus('error', lastError ? `${lastError}. ${retry}` : `Conexão perdida. ${retry}`);
  });
  c.on('message', (topic, buffer) => {
    if (!isCurrent()) return;
    const payload = buffer.toString();
    messageListeners.forEach((listener) => listener(topic, payload));
  });
  return true;
}

/** Encerra a conexão (se houver) e sempre volta o status para 'disconnected'. */
export function disconnect() {
  const c = client;
  client = null;
  if (c) {
    if (c.connected) c.unsubscribe(SUBSCRIBED_TOPICS);
    c.end(true);
  }
  emitStatus('disconnected');
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

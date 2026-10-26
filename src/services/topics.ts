// Identificador exclusivo do grupo. Manter igual ao BASE_TOPIC de simulator/simulator.js.
export const BASE_TOPIC = 'fiap/3ess/triton';

export const TOPICS = {
  temperature: `${BASE_TOPIC}/sensor/temperatura`,
  humidity: `${BASE_TOPIC}/sensor/umidade`,
  lampCommand: `${BASE_TOPIC}/lampada/comando`,
  lampState: `${BASE_TOPIC}/lampada/estado`,
} as const;

export const SUBSCRIBED_TOPICS = [TOPICS.temperature, TOPICS.humidity, TOPICS.lampState];

// HiveMQ público via WebSocket seguro (porta 8884). A porta 1883 é MQTT TCP e não funciona no app.
export const DEFAULT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

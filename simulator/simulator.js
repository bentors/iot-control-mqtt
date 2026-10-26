// Simulador do dispositivo IoT: publica temperatura/umidade e responde aos comandos da lâmpada.
// Uso: npm run simulator   (variáveis opcionais: MQTT_URL, BASE_TOPIC, INTERVAL_MS)
const mqtt = require('mqtt');

const MQTT_URL = process.env.MQTT_URL || 'wss://broker.hivemq.com:8884/mqtt';
// Manter igual ao BASE_TOPIC de src/services/topics.ts
const BASE_TOPIC = process.env.BASE_TOPIC || 'fiap/3ess/iotctl-x7k3q';
const INTERVAL_MS = Number(process.env.INTERVAL_MS) || 5000;

const TOPICS = {
  temperature: `${BASE_TOPIC}/sensor/temperatura`,
  humidity: `${BASE_TOPIC}/sensor/umidade`,
  lampCommand: `${BASE_TOPIC}/lampada/comando`,
  lampState: `${BASE_TOPIC}/lampada/estado`,
};

let temperature = 24;
let humidity = 58;
let lampState = 'OFF';

const drift = (value, step, min, max) =>
  Math.min(max, Math.max(min, value + (Math.random() * 2 - 1) * step));

const client = mqtt.connect(MQTT_URL, {
  clientId: `iot-simulator-${Math.random().toString(16).slice(2, 10)}`,
  reconnectPeriod: 3000,
});

function send(topic, data, retain = false) {
  const payload = JSON.stringify(data);
  client.publish(topic, payload, { qos: 0, retain });
  console.log(`[${new Date().toLocaleTimeString('pt-BR')}] -> ${topic} ${payload}`);
}

function publishReadings() {
  temperature = drift(temperature, 0.8, 15, 35);
  humidity = drift(humidity, 2, 30, 90);
  send(TOPICS.temperature, { value: Number(temperature.toFixed(1)) });
  send(TOPICS.humidity, { value: Math.round(humidity) });
}

client.on('connect', () => {
  console.log(`Conectado a ${MQTT_URL} | tópico base: ${BASE_TOPIC}`);
  client.subscribe(TOPICS.lampCommand);
  // retain: o app recebe o estado atual da lâmpada assim que se inscreve.
  send(TOPICS.lampState, { state: lampState }, true);
  publishReadings();
});

client.on('message', (topic, buffer) => {
  const raw = buffer.toString();
  console.log(`[${new Date().toLocaleTimeString('pt-BR')}] <- ${topic} ${raw}`);
  let action;
  try {
    action = JSON.parse(raw).action;
  } catch {
    // payload não é JSON
  }
  if (action !== 'ON' && action !== 'OFF') {
    console.warn('Comando inválido ignorado:', raw);
    return;
  }
  lampState = action;
  send(TOPICS.lampState, { state: lampState }, true);
});

client.on('error', (err) => console.error('Erro MQTT:', err.message));
client.on('reconnect', () => console.log('Reconectando…'));

const timer = setInterval(() => client.connected && publishReadings(), INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(timer);
  client.end(false, () => process.exit(0));
});

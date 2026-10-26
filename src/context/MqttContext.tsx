import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as mqttService from '../services/mqttService';
import { saveBrokerUrl } from '../services/storageService';
import { parseLampState, parseSensorValue } from '../services/payload';
import { TOPICS } from '../services/topics';
import type {
  ConnectionStatus,
  HistoryMessage,
  LampReading,
  LampState,
  MessageDirection,
  SensorReading,
} from '../types/mqtt';

const HISTORY_LIMIT = 10;
const COMMAND_TIMEOUT_MS = 5000;

interface MqttContextValue {
  status: ConnectionStatus;
  error: string | null;
  brokerUrl: string;
  temperature: SensorReading | null;
  humidity: SensorReading | null;
  lamp: LampReading | null;
  pendingCommand: LampState | null;
  commandError: string | null;
  history: HistoryMessage[];
  connect: (url: string) => void;
  disconnect: () => void;
  sendLampCommand: (action: LampState) => Promise<void>;
}

const MqttContext = createContext<MqttContextValue | null>(null);

interface MqttProviderProps {
  initialBrokerUrl: string;
  children: ReactNode;
}

export function MqttProvider({ initialBrokerUrl, children }: MqttProviderProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [brokerUrl, setBrokerUrl] = useState(initialBrokerUrl);
  const [temperature, setTemperature] = useState<SensorReading | null>(null);
  const [humidity, setHumidity] = useState<SensorReading | null>(null);
  const [lamp, setLamp] = useState<LampReading | null>(null);
  const [pendingCommand, setPendingCommand] = useState<LampState | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryMessage[]>([]);

  const addHistory = (topic: string, payload: string, direction: MessageDirection, valid: boolean) => {
    const timestamp = Date.now();
    const message: HistoryMessage = {
      id: `${timestamp}-${Math.random().toString(36).slice(2)}`,
      topic,
      payload,
      direction,
      timestamp,
      valid,
    };
    setHistory((prev) => [message, ...prev].slice(0, HISTORY_LIMIT));
  };

  // Registra os listeners do serviço uma única vez e os remove ao desmontar (sem eventos duplicados).
  useEffect(() => {
    const offStatus = mqttService.onStatus((nextStatus, nextError) => {
      setStatus(nextStatus);
      setError(nextError);
    });

    const offMessage = mqttService.onMessage((topic, payload) => {
      const timestamp = Date.now();
      let valid = true;

      if (topic === TOPICS.temperature || topic === TOPICS.humidity) {
        const value = parseSensorValue(payload);
        valid = value !== null;
        if (value !== null) {
          const setter = topic === TOPICS.temperature ? setTemperature : setHumidity;
          setter({ value, timestamp });
        }
      } else if (topic === TOPICS.lampState) {
        const state = parseLampState(payload);
        valid = state !== null;
        if (state !== null) {
          setLamp({ state, timestamp });
          setPendingCommand(null);
          setCommandError(null);
        }
      }

      addHistory(topic, payload, 'received', valid);
    });

    mqttService.connect(initialBrokerUrl);

    return () => {
      offStatus();
      offMessage();
      mqttService.disconnect();
    };
  }, [initialBrokerUrl]);

  // Se o dispositivo não confirmar o estado a tempo, avisa o usuário.
  useEffect(() => {
    if (!pendingCommand) return;
    const timer = setTimeout(() => {
      setPendingCommand(null);
      setCommandError('O dispositivo não confirmou o comando. Verifique se o simulador está rodando.');
    }, COMMAND_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [pendingCommand]);

  const connect = (url: string) => {
    const trimmed = url.trim();
    setBrokerUrl(trimmed);
    saveBrokerUrl(trimmed).catch(() => {});
    mqttService.connect(trimmed);
  };

  const sendLampCommand = async (action: LampState) => {
    const payload = JSON.stringify({ action });
    setCommandError(null);
    try {
      await mqttService.publish(TOPICS.lampCommand, payload);
      addHistory(TOPICS.lampCommand, payload, 'sent', true);
      setPendingCommand(action);
    } catch (err) {
      setCommandError(err instanceof Error ? err.message : 'Falha ao publicar comando.');
    }
  };

  return (
    <MqttContext.Provider
      value={{
        status,
        error,
        brokerUrl,
        temperature,
        humidity,
        lamp,
        pendingCommand,
        commandError,
        history,
        connect,
        disconnect: mqttService.disconnect,
        sendLampCommand,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
}

export function useMqtt(): MqttContextValue {
  const ctx = useContext(MqttContext);
  if (!ctx) throw new Error('useMqtt deve ser usado dentro de MqttProvider');
  return ctx;
}

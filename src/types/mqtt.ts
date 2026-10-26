export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export type LampState = 'ON' | 'OFF';

export type MessageDirection = 'sent' | 'received';

export interface HistoryMessage {
  id: string;
  topic: string;
  payload: string;
  direction: MessageDirection;
  timestamp: number;
  valid: boolean;
}

export interface SensorReading {
  value: number;
  timestamp: number;
}

export interface LampReading {
  state: LampState;
  timestamp: number;
}

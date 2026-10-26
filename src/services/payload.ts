import type { LampState } from '../types/mqtt';

function parseObject(payload: string): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(payload);
    return typeof data === 'object' && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** `{"value": 24.5}` -> 24.5; qualquer outra coisa -> null. */
export function parseSensorValue(payload: string): number | null {
  const value = parseObject(payload)?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** `{"state": "ON"}` -> 'ON'; qualquer outra coisa -> null. */
export function parseLampState(payload: string): LampState | null {
  const state = parseObject(payload)?.state;
  return state === 'ON' || state === 'OFF' ? state : null;
}

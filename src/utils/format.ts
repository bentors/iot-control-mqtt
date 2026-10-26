export const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString('pt-BR');

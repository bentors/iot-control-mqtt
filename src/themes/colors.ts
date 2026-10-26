export type ThemeMode = 'light' | 'dark';

export interface Palette {
  background: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  success: string;
  warning: string;
  danger: string;
}

export const colors: Record<ThemeMode, Palette> = {
  light: {
    background: '#F2F4F7',
    card: '#FFFFFF',
    border: '#D9DEE5',
    text: '#111827',
    muted: '#6B7280',
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    success: '#15803D',
    warning: '#B45309',
    danger: '#B91C1C',
  },
  dark: {
    background: '#0B0F17',
    card: '#151B26',
    border: '#273042',
    text: '#F3F4F6',
    muted: '#9CA3AF',
    primary: '#3B82F6',
    onPrimary: '#FFFFFF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
};

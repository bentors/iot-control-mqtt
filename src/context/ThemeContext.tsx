import { createContext, useContext, useState, type ReactNode } from 'react';
import { colors, type Palette, type ThemeMode } from '../themes/colors';
import { saveTheme } from '../services/storageService';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  initialMode: ThemeMode;
  children: ReactNode;
}

export function ThemeProvider({ initialMode, children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleTheme = () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    saveTheme(next).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ mode, colors: colors[mode], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}

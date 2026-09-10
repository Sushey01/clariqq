import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'clariq_theme_v1';
const TYPE_KEY = 'clariq_type_size_v1';

const ThemeContext = createContext(null);

function systemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function readStored(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStored(THEME_KEY, systemTheme()));
  const [typeSize, setTypeSizeState] = useState(() => readStored(TYPE_KEY, 'default'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (typeSize === 'comfortable') {
      document.documentElement.setAttribute('data-type-size', 'comfortable');
    } else {
      document.documentElement.removeAttribute('data-type-size');
    }
    try {
      localStorage.setItem(TYPE_KEY, typeSize);
    } catch {
      /* ignore */
    }
  }, [typeSize]);

  const value = useMemo(
    () => ({
      theme,
      typeSize,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
      setTypeSize: setTypeSizeState,
    }),
    [theme, typeSize]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}

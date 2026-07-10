// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#3b82f6',
      primaryDark: '#2563eb',
      primaryLight: '#eff6ff',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      shadow: 'rgba(59,130,246,0.10)',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#60a5fa',
      primaryDark: '#3b82f6',
      primaryLight: '#1e3a8a',
      secondary: '#a78bfa',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      shadow: 'rgba(0,0,0,0.35)',
    },
  },
};

const applyThemeToDom = (themeName) => {
  const colors = themes[themeName]?.colors || themes.light.colors;
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Legacy CSS tokens used in index.css
  root.style.setProperty('--bg', colors.background);
  root.style.setProperty('--card', colors.surface);
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--muted', colors.textSecondary);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--blue', colors.primary);
  root.style.setProperty('--blue-dark', colors.primaryDark);
  root.style.setProperty('--blue-light', colors.primaryLight);
  root.style.setProperty('--shadow', `0 4px 24px ${colors.shadow}`);

  if (themeName === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('unihub-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Prefer system preference on first visit
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    applyThemeToDom(currentTheme);
    localStorage.setItem('unihub-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setThemeByName = useCallback((themeName) => {
    if (themes[themeName]) setCurrentTheme(themeName);
  }, []);

  const theme = themes[currentTheme];
  const isDark = currentTheme === 'dark';

  const value = {
    theme,
    currentTheme,
    isDark,
    isLight: !isDark,
    toggleTheme,
    setThemeByName,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;

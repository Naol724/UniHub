// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const ThemeContext = createContext();

// Theme configuration
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
      shadow: 'rgba(59,130,246,0.10)'
    }
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
      shadow: 'rgba(0,0,0,0.25)'
    }
  }
};

// Provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('unihub-theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'light';
  });

  const [theme, setTheme] = useState(themes[currentTheme]);

  // Update theme when currentTheme changes
  useEffect(() => {
    setTheme(themes[currentTheme]);
    localStorage.setItem('unihub-theme', currentTheme);
    
    // Update CSS variables
    const root = document.documentElement;
    const colors = theme.colors;
    
    Object.keys(colors).forEach(key => {
      root.style.setProperty(`--color-${key}`, colors[key]);
    });
  }, [currentTheme, theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Set specific theme function
  const setThemeByName = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  // Get current theme info
  const getThemeInfo = () => {
    return {
      current: currentTheme,
      isDark: currentTheme === 'dark',
      isLight: currentTheme === 'light',
      colors: theme.colors,
      availableThemes: Object.keys(themes)
    };
  };

  const value = {
    theme,
    currentTheme,
    toggleTheme,
    setThemeByName,
    getThemeInfo,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to get theme color
export const getThemeColor = (colorName, themeContext) => {
  if (!themeContext || !themeContext.theme.colors[colorName]) {
    console.warn(`Theme color "${colorName}" not found`);
    return '#000000';
  }
  return themeContext.theme.colors[colorName];
};

export default ThemeContext;

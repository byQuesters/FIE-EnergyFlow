// contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Actualizar tema cuando cambia el modo o el sistema
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error al cargar preferencia de tema:', error);
    }
  };

  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem('theme_preference', mode);
    } catch (error) {
      console.error('Error al guardar preferencia de tema:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const setTheme = (mode) => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  // Definición de colores para tema claro
  const lightTheme = {
    // Colores principales
    primary: '#93ab6b',
    primaryLight: '#b7c586',
    primaryDark: '#7a9253',
    accent: '#ab70c1',
    accentLight: '#c391d4',
    
    // Fondos
    background: '#f8fafc',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#f1f5f9',
    
    // Texto
    text: '#1e293b',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    
    // Bordes
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    // Edificios
    buildingPrimary: '#0f2d55',
    buildingSecondary: '#8db8d6',
    buildingBorder: '#082743',
    buildingLabel: '#e6eefc',
    
    // Mapa
    mapGrass: '#dff0c7',
    mapGrassLight: '#e6f5d2',
    mapRoad: '#2e3033',
    mapRoadLine: '#ffd24a',
    mapWalkway: '#aeb4b9',
    mapParking: '#262a2f',
    mapCourt: '#f6a65b',
    mapTree: '#3e7c3e',
    
    // Estados
    statusLow: '#3b82f6',
    statusNormal: '#10b981',
    statusHigh: '#f59e0b',
    statusCritical: '#ef4444',
    
    // Sombras
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
  };

  // Definición de colores para tema oscuro
  const darkTheme = {
    // Colores principales
    primary: '#7a9253',
    primaryLight: '#93ab6b',
    primaryDark: '#5f7340',
    accent: '#ab70c1',
    accentLight: '#c391d4',
    
    // Fondos
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    
    // Texto
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    
    // Bordes
    border: '#334155',
    borderLight: '#475569',
    
    // Edificios
    buildingPrimary: '#1e3a5f',
    buildingSecondary: '#5a8ab8',
    buildingBorder: '#0f2847',
    buildingLabel: '#e6eefc',
    
    // Mapa
    mapGrass: '#1a3a1a',
    mapGrassLight: '#2d4d2d',
    mapRoad: '#1c1e21',
    mapRoadLine: '#d4a819',
    mapWalkway: '#4a5158',
    mapParking: '#1a1d22',
    mapCourt: '#c47d3f',
    mapTree: '#2d5c2d',
    
    // Estados
    statusLow: '#60a5fa',
    statusNormal: '#34d399',
    statusHigh: '#fbbf24',
    statusCritical: '#f87171',
    
    // Sombras
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value = {
    isDark,
    themeMode,
    theme,
    colors: theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
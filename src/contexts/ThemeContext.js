import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const lightTheme = {
  dark: false,
  colors: {
    background: '#f8fafc',
    card: '#ffffff',
    text: '#374151',
    textSecondary: '#6b7280',
    textInverse: '#ffffff',
    border: '#e5e7eb',
    
    // Gradientes y Elementos Especiales
    headerGradient: ['#93ab6bff', '#b7c586ff'],
    primary: '#93ab6b',
    activeTab: '#a3bb7c',
    inactiveTab: '#f3f3f3',
    
    // Mapa
    mapBackground: ['#dff0c7', '#cfe6ae', '#e6f5d2'],

    // Gráficas (AGREGADOS)
    chartBackground: '#ffffff',
    chartLine: '#3b82f6',
  }
};

const darkTheme = {
  dark: true,
  colors: {
    background: '#111827', // Fondo oscuro principal
    card: '#1f2937',       // Fondo de tarjetas
    text: '#f3f4f6',       // Texto claro
    textSecondary: '#9ca3af', // Texto secundario
    textInverse: '#ffffff',
    border: '#374151',
    
    // Gradientes Dark Mode
    headerGradient: ['#14532d', '#166534'],
    primary: '#bef264',    // Verde lima para resaltar
    activeTab: '#3f6212',
    inactiveTab: '#1f2937',
    
    // Mapa Nocturno
    mapBackground: ['#064e3b', '#065f46', '#047857'],

    // Gráficas (AGREGADOS)
    chartBackground: '#1f2937',
    chartLine: '#60a5fa',
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeType, setThemeType] = useState('light'); // Default light

  const toggleTheme = () => {
    setThemeType(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = themeType === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
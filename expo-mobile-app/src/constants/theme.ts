import { MD3LightTheme } from 'react-native-paper';
import { COLORS } from './config';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.PRIMARY,
    primaryContainer: COLORS.PRIMARY_LIGHT,
    onPrimary: '#FFFFFF',
    onPrimaryContainer: COLORS.PRIMARY_DARK,
    secondary: COLORS.SECONDARY,
    onSecondary: '#FFFFFF',
    tertiary: COLORS.WARNING,
    onTertiary: '#FFFFFF',
    error: COLORS.ERROR,
    onError: '#FFFFFF',
    background: COLORS.BACKGROUND,
    onBackground: COLORS.TEXT_PRIMARY,
    surface: COLORS.SURFACE,
    onSurface: COLORS.TEXT_PRIMARY,
    surfaceVariant: '#F0F0F0',
    onSurfaceVariant: COLORS.TEXT_SECONDARY,
    outline: '#CCCCCC',
    outlineVariant: '#E0E0E0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: COLORS.TEXT_PRIMARY,
    inverseOnSurface: COLORS.BACKGROUND,
    inversePrimary: COLORS.PRIMARY_LIGHT,
    elevation: {
      level0: 'transparent',
      level1: '#F7F7F7',
      level2: '#F2F2F2',
      level3: '#EEEEEE',
      level4: '#EBEBEB',
      level5: '#E8E8E8',
    },
    surfaceDisabled: '#F5F5F5',
    onSurfaceDisabled: '#CCCCCC',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  roundness: 12,
  fonts: {
    ...MD3LightTheme.fonts,
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'System',
      fontWeight: 'bold' as const,
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'System',
      fontWeight: 'bold' as const,
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: 'System',
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: 'System',
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: 'System',
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
  },
};

// Tema oscuro
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: COLORS.PRIMARY_LIGHT,
    primaryContainer: COLORS.PRIMARY_DARK,
    onPrimary: COLORS.PRIMARY_DARK,
    onPrimaryContainer: '#FFFFFF',
    background: '#121212',
    onBackground: '#FFFFFF',
    surface: '#1E1E1E',
    onSurface: '#FFFFFF',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#CCCCCC',
    outline: '#666666',
    outlineVariant: '#444444',
    elevation: {
      level0: 'transparent',
      level1: '#222222',
      level2: '#2A2A2A',
      level3: '#323232',
      level4: '#383838',
      level5: '#3E3E3E',
    },
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#121212',
    inversePrimary: COLORS.PRIMARY,
  },
};

// Estilos de sombra personalizados
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12.27,
    elevation: 8,
  },
};

// Espaciado consistente
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamaños de fuente consistentes
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Radios de borde
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
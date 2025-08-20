// Configuración de la aplicación
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' // URL de desarrollo (cuando se ejecute el servidor web)
  : 'https://your-production-domain.com'; // URL de producción

// Configuración de autenticación
export const AUTH_CONFIG = {
  TOKEN_KEY: 'userToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  TOKEN_EXPIRY_KEY: 'tokenExpiry',
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'Energy Flow',
  VERSION: '1.0.0',
  COMPANY: 'Universidad de Colima',
  CONTACT_EMAIL: 'liot@ucol.mx',
  SUPPORT_PHONE: '+52 312 316 1000',
};

// Configuración de actualización de datos
export const DATA_CONFIG = {
  REFRESH_INTERVAL: 20000, // 20 segundos
  TIMEOUT: 15000, // 15 segundos
  MAX_RETRIES: 3,
  HISTORICAL_DATA_LIMIT: 100,
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  ENERGY_THRESHOLD: 5000, // Watts
  VOLTAGE_MIN: 200, // Volts
  VOLTAGE_MAX: 240, // Volts
  CURRENT_MAX: 50, // Amperes
};

// Configuración de colores (coincide con el tema web)
export const COLORS = {
  PRIMARY: '#7b8f35', // Verde UCOL
  PRIMARY_DARK: '#5a6a26',
  PRIMARY_LIGHT: '#ccdb94',
  SECONDARY: '#2196F3',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F5F5F5',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
};

// URLs de documentación y soporte
export const SUPPORT_URLS = {
  DOCUMENTATION: 'https://docs.ucol.mx/energy-flow',
  PRIVACY_POLICY: 'https://ucol.mx/privacy',
  TERMS_OF_SERVICE: 'https://ucol.mx/terms',
  SUPPORT: 'https://support.ucol.mx',
};

// Configuración de características de la app
export const FEATURES = {
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: true,
  BIOMETRIC_AUTH: false,
  DATA_EXPORT: true,
  DARK_MODE: true,
  ANALYTICS: false, // Para cumplir con privacidad
};

// Configuración de almacenamiento
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  CACHED_DATA: 'cachedEnergyData',
  LAST_SYNC: 'lastSyncTime',
  OFFLINE_QUEUE: 'offlineQueue',
};

// Configuración de building IDs (debe coincidir con la base de datos)
export const BUILDING_IDS = {
  MAIN_BUILDING: '1',
  ENGINEERING_LAB: '2',
  LIBRARY: '3',
  COMPUTER_CENTER: '4',
  AUDITORIUM: '5',
  CHEMISTRY_LAB: '6',
  CAFETERIA: '7',
} as const;

// Configuración de mapas
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  MAX_ZOOM: 20,
  MIN_ZOOM: 10,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors',
};

// Configuración de gráficas
export const CHART_CONFIG = {
  ANIMATION_DURATION: 300,
  DEFAULT_HEIGHT: 220,
  COLORS: {
    POWER: '#2196F3',
    ENERGY: '#4CAF50',
    VOLTAGE: '#FF9800',
    CURRENT: '#9C27B0',
    EFFICIENCY: '#00BCD4',
  },
  GRADIENTS: {
    POWER: ['#64B5F6', '#1976D2'],
    ENERGY: ['#81C784', '#388E3C'],
    VOLTAGE: ['#FFB74D', '#F57C00'],
    CURRENT: ['#BA68C8', '#7B1FA2'],
  },
};

// Tipos de export
export const EXPORT_FORMATS = {
  CSV: 'csv',
  PDF: 'pdf',
  EXCEL: 'xlsx',
} as const;
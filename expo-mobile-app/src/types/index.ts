// Tipos de autenticación
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
}

// Tipos de datos energéticos
export interface EnergyData {
  I_RMSA: number;
  I_RMSB: number;
  I_RMSC: number;
  V_RMSA: number;
  V_RMSB: number;
  V_RMSC: number;
  V_RMSAB: number;
  V_RMSBC: number;
  V_RMSCA: number;
  PPROM_A: number;
  PPROM_B: number;
  PPROM_C: number;
  kWhA: number;
  kWhB: number;
  kWhC: number;
  timestamp: string;
}

export interface HistoricalDataPoint {
  timestamp: string;
  totalPower: number;
  totalEnergy: number;
  avgVoltage: number;
  avgCurrent: number;
  CO2: number;
  powerA: number;
  powerB: number;
  powerC: number;
}

// Tipos de edificios
export interface Building {
  id: string;
  name: string;
  description: string;
  location: string;
  floors: number;
  status: 'active' | 'inactive' | 'maintenance';
  currentPower: number;
  totalEnergy: number;
  efficiency: number;
  lastUpdate: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Tipos de respuesta de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

// Tipos de configuración de usuario
export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  autoRefresh: boolean;
  dataUsage: boolean;
  energyAlerts: boolean;
  maintenanceAlerts: boolean;
  refreshInterval: number;
  language: 'es' | 'en';
}

// Tipos de notificaciones
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: 'energy' | 'maintenance' | 'system' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  data?: {
    buildingId?: string;
    energyValue?: number;
    threshold?: number;
    [key: string]: any;
  };
}

// Tipos de estadísticas
export interface DataStats {
  realtimePoints: number;
  totalPoints: number;
  consecutiveErrors: number;
  lastSuccessfulFetch: string | null;
  averageResponseTime?: number;
  uptime?: number;
}

// Tipos de exportación
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'xlsx';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  buildingIds?: string[];
  includeCharts?: boolean;
  includeStatistics?: boolean;
}

// Tipos de gráficas
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: ChartDataPoint[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

// Tipos de navegación
export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
};

export type TabsParamList = {
  dashboard: undefined;
  map: undefined;
  buildings: undefined;
  settings: undefined;
};

// Tipos de estado global
export interface RootState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    token: string | null;
  };
  energy: {
    realTimeData: EnergyData;
    historicalData: HistoricalDataPoint[];
    isLoading: boolean;
    error: string | null;
    isConnected: boolean;
    lastUpdateTime: string | null;
    dataStats: DataStats;
  };
}

// Tipos de errores
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  recoverable?: boolean;
}

// Tipos de conectividad
export interface ConnectionStatus {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isInternetReachable: boolean | null;
  details?: {
    strength?: number;
    speed?: number;
    carrier?: string;
  };
}

// Tipos de eventos del sistema
export interface SystemEvent {
  id: string;
  type: 'data_update' | 'connection_change' | 'error' | 'user_action';
  timestamp: string;
  data: any;
  source: string;
}

// Tipos de métricas de rendimiento
export interface PerformanceMetrics {
  appStartTime: number;
  firstDataLoad: number;
  averageApiResponseTime: number;
  errorRate: number;
  crashCount: number;
  memoryUsage: number;
  batteryLevel?: number;
  networkUsage: {
    sent: number;
    received: number;
  };
}

// Tipos de configuración de desarrollo
export interface DevConfig {
  enableDebugMode: boolean;
  mockApiResponses: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  showPerformanceMetrics: boolean;
  enableHotReload: boolean;
}
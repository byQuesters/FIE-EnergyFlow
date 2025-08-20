import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { energyService } from '@/services/energyService';

interface EnergyData {
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

interface HistoricalDataPoint {
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

interface EnergyState {
  realTimeData: EnergyData;
  historicalData: HistoricalDataPoint[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdateTime: string | null;
  dataStats: {
    realtimePoints: number;
    totalPoints: number;
    consecutiveErrors: number;
    lastSuccessfulFetch: string | null;
  };
}

const initialState: EnergyState = {
  realTimeData: {
    I_RMSA: 0,
    I_RMSB: 0,
    I_RMSC: 0,
    V_RMSA: 0,
    V_RMSB: 0,
    V_RMSC: 0,
    V_RMSAB: 0,
    V_RMSBC: 0,
    V_RMSCA: 0,
    PPROM_A: 0,
    PPROM_B: 0,
    PPROM_C: 0,
    kWhA: 0,
    kWhB: 0,
    kWhC: 0,
    timestamp: new Date().toISOString(),
  },
  historicalData: [],
  isLoading: false,
  error: null,
  isConnected: false,
  lastUpdateTime: null,
  dataStats: {
    realtimePoints: 0,
    totalPoints: 0,
    consecutiveErrors: 0,
    lastSuccessfulFetch: null,
  },
};

// Async thunks
export const fetchEnergyData = createAsyncThunk(
  'energy/fetchEnergyData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await energyService.getCurrentData();
      
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener datos');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const fetchHistoricalData = createAsyncThunk(
  'energy/fetchHistoricalData',
  async (params: { startDate?: string; endDate?: string; buildingId?: string }, { rejectWithValue }) => {
    try {
      const response = await energyService.getHistoricalData(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al obtener datos históricos');
    }
  }
);

const energySlice = createSlice({
  name: 'energy',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateDataStats: (state, action: PayloadAction<Partial<EnergyState['dataStats']>>) => {
      state.dataStats = { ...state.dataStats, ...action.payload };
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    addHistoricalPoint: (state, action: PayloadAction<HistoricalDataPoint>) => {
      state.historicalData = [action.payload, ...state.historicalData.slice(0, 99)];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current energy data
      .addCase(fetchEnergyData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnergyData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.realTimeData = action.payload.data;
        state.isConnected = true;
        state.error = null;
        state.lastUpdateTime = new Date().toISOString();
        
        // Actualizar estadísticas
        state.dataStats.realtimePoints += 1;
        state.dataStats.totalPoints += 1;
        state.dataStats.consecutiveErrors = 0;
        state.dataStats.lastSuccessfulFetch = new Date().toISOString();
        
        // Crear punto histórico
        const newPoint: HistoricalDataPoint = {
          timestamp: action.payload.data.timestamp,
          totalPower: Math.abs(action.payload.data.PPROM_A || 0) + 
                     Math.abs(action.payload.data.PPROM_B || 0) + 
                     Math.abs(action.payload.data.PPROM_C || 0),
          totalEnergy: (action.payload.data.kWhA || 0) + 
                      (action.payload.data.kWhB || 0) + 
                      (action.payload.data.kWhC || 0),
          avgVoltage: ((action.payload.data.V_RMSA || 0) + 
                      (action.payload.data.V_RMSB || 0) + 
                      (action.payload.data.V_RMSC || 0)) / 3,
          avgCurrent: ((action.payload.data.I_RMSA || 0) + 
                      (action.payload.data.I_RMSB || 0) + 
                      (action.payload.data.I_RMSC || 0)) / 3,
          CO2: Math.round(((action.payload.data.kWhA || 0) + 
                          (action.payload.data.kWhB || 0) + 
                          (action.payload.data.kWhC || 0)) * 0.233),
          powerA: Math.abs(action.payload.data.PPROM_A || 0),
          powerB: Math.abs(action.payload.data.PPROM_B || 0),
          powerC: Math.abs(action.payload.data.PPROM_C || 0),
        };
        
        // Agregar a datos históricos (máximo 100 puntos)
        state.historicalData = [newPoint, ...state.historicalData.slice(0, 99)];
      })
      .addCase(fetchEnergyData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isConnected = false;
        
        // Incrementar contador de errores
        state.dataStats.consecutiveErrors += 1;
      })
      
      // Fetch historical data
      .addCase(fetchHistoricalData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Procesar datos históricos si es necesario
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  updateDataStats, 
  setConnectionStatus, 
  addHistoricalPoint 
} = energySlice.actions;

export default energySlice.reducer;
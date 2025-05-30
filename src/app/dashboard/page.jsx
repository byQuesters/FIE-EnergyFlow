
// /app/dashboard/page.jsx
'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  RadialBarChart, RadialBar, Legend
} from 'recharts'

import * as React from "react";

export default function Dashboard() {
  const [mounted, setMounted] = React.useState(false);
  const [realTimeData, setRealTimeData] = React.useState({
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
    timestamp: new Date().toISOString()
  });

  const [historicalData, setHistoricalData] = React.useState([]);
  const [realtimeChartData, setRealtimeChartData] = React.useState([]);
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState('Conectando...');
  const [lastError, setLastError] = React.useState(null);
  const [dataStats, setDataStats] = React.useState({
    realtimePoints: 0,
    synthesizedPoints: 0,
    totalPoints: 0,
    lastSuccessfulFetch: null,
    consecutiveErrors: 0
  });

  // Test API connectivity
  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/get-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });
      
      const result = await response.json();
      console.log('API Test Result:', result);
      return result.success;
    } catch (error) {
      console.error('API Test Error:', error);
      return false;
    }
  };

  // Función para obtener datos de Particle
  const fetchParticleData = async () => {
    try {
      setLastError(null);
      
      // First test if API is reachable
      const apiWorking = await testApiConnection();
      if (!apiWorking) {
        throw new Error('API endpoint not responding');
      }

      const response = await fetch('/api/get-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(20000)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        setRealTimeData(result.data);
        setIsConnected(true);
        setConnectionStatus('Conectado');
        
        // Reset error counter
        setDataStats(prev => ({
          ...prev,
          consecutiveErrors: 0,
          lastSuccessfulFetch: new Date().toISOString()
        }));
        
        // Actualizar datos históricos
        setHistoricalData(prev => {
          const updated = [result.data, ...prev];
          return updated.length > 100 ? updated.slice(0, 100) : updated;
        });

        // Actualizar datos del gráfico en tiempo real
        setRealtimeChartData(prev => {
          const newPoint = {
            time: new Date(result.data.timestamp).toLocaleTimeString(),
            timestamp: result.data.timestamp,
            totalPower: Math.abs(result.data.PPROM_A || 0) + Math.abs(result.data.PPROM_B || 0) + Math.abs(result.data.PPROM_C || 0),
            totalEnergy: (result.data.kWhA || 0) + (result.data.kWhB || 0) + (result.data.kWhC || 0),
            avgVoltage: ((result.data.V_RMSA || 0) + (result.data.V_RMSB || 0) + (result.data.V_RMSC || 0)) / 3,
            avgCurrent: ((result.data.I_RMSA || 0) + (result.data.I_RMSB || 0) + (result.data.I_RMSC || 0)) / 3,
            CO2: Math.round(((result.data.kWhA || 0) + (result.data.kWhB || 0) + (result.data.kWhC || 0)) * 0.233),
            powerA: Math.abs(result.data.PPROM_A || 0),
            powerB: Math.abs(result.data.PPROM_B || 0),
            powerC: Math.abs(result.data.PPROM_C || 0)
          };
          
          const updated = [newPoint, ...prev];
          return updated.length > 20 ? updated.slice(0, 20) : updated;
        });

        // Actualizar estadísticas
        setDataStats(prev => ({
          ...prev,
          realtimePoints: prev.realtimePoints + 1,
          totalPoints: prev.totalPoints + 1
        }));
        
      } else {
        setIsConnected(false);
        const errorMsg = result.error || 'Unknown error';
        setConnectionStatus(`Error: ${errorMsg}`);
        setLastError({
          message: errorMsg,
          details: result.details,
          timestamp: new Date().toISOString()
        });
        
        // Increment error counter
        setDataStats(prev => ({
          ...prev,
          consecutiveErrors: prev.consecutiveErrors + 1
        }));
        
        console.error('API returned error:', result);
      }
    } catch (error) {
      setIsConnected(false);
      const errorMsg = error.name === 'TimeoutError' 
        ? 'Timeout - La conexión tardó demasiado'
        : `Error de conexión: ${error.message}`;
      
      setConnectionStatus(errorMsg);
      setLastError({
        message: error.message,
        type: error.name,
        timestamp: new Date().toISOString()
      });
      
      // Increment error counter
      setDataStats(prev => ({
        ...prev,
        consecutiveErrors: prev.consecutiveErrors + 1
      }));
      
      console.error('Network/Fetch error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  };

  React.useEffect(() => {
    setMounted(true);
    
    // Initial data fetch
    console.log('Starting initial data fetch...');
    fetchParticleData();
    
    // Set up periodic fetching every 10 seconds
    const interval = setInterval(() => {
      console.log('Fetching periodic data...');
      fetchParticleData();
    }, 20000);
    
    return () => {
      console.log('Cleaning up interval');
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando Dashboard...</p>
      </div>
    </div>
  );

  // Data for static charts (instantaneous)
  const energyData = [
    { phase: 'Fase A', kWh: realTimeData.kWhA, current: realTimeData.I_RMSA, voltage: realTimeData.V_RMSA },
    { phase: 'Fase B', kWh: realTimeData.kWhB, current: realTimeData.I_RMSB, voltage: realTimeData.V_RMSB },
    { phase: 'Fase C', kWh: realTimeData.kWhC, current: realTimeData.I_RMSC, voltage: realTimeData.V_RMSC },
  ];

  const powerData = [
    { name: 'Potencia A', value: Math.abs(realTimeData.PPROM_A), fill: '#a3bf42' },
    { name: 'Potencia B', value: Math.abs(realTimeData.PPROM_B), fill: '#ffbb76' },
    { name: 'Potencia C', value: Math.abs(realTimeData.PPROM_C), fill: '#b699ff' },
  ];

  const voltageLineData = [
    { name: 'AB', voltage: realTimeData.V_RMSAB },
    { name: 'BC', voltage: realTimeData.V_RMSBC },
    { name: 'CA', voltage: realTimeData.V_RMSCA },
  ];

  const currentData = [
    { name: 'Fase A', current: realTimeData.I_RMSA, fill: '#8884d8' },
    { name: 'Fase B', current: realTimeData.I_RMSB, fill: '#82ca9d' },
    { name: 'Fase C', current: realTimeData.I_RMSC, fill: '#ffc658' },
  ];

  const efficiencyData = [
    { name: 'Eficiencia Actual', value: 85, fill: '#00C49F' },
    { name: 'Pérdidas', value: 15, fill: '#FF8042' }
  ];

  // Prepare data for real-time charts (chronological order)
  const chartDataForDisplay = [...realtimeChartData].reverse();

  // Total calculations
  const totalPower = Math.abs(realTimeData.PPROM_A) + Math.abs(realTimeData.PPROM_B) + Math.abs(realTimeData.PPROM_C);
  const totalEnergy = realTimeData.kWhA + realTimeData.kWhB + realTimeData.kWhC;
  const avgVoltage = (realTimeData.V_RMSA + realTimeData.V_RMSB + realTimeData.V_RMSC) / 3;
  const avgCurrent = (realTimeData.I_RMSA + realTimeData.I_RMSB + realTimeData.I_RMSC) / 3;

  return (
    <div className="flex flex-col lg:flex-row bg-white dark:bg-zinc-900 text-black dark:text-white overflow-hidden h-[89vh] text-foreground shadow border-b-[.3vh] border-[#ccdb94] dark:border-gray-700">
      
      {/* Left Panel - Real-time Metrics */}
      <div className="sidebar w-full lg:w-1/4 p-4 border-r-[.5vh] border-[#ccdb94] dark:border-gray-700 overflow-y-auto bg-gray-200 dark:bg-gray-800 scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-black hover:scrollbar-thumb-gray-400/70 dark:scrollbar-thumb-gray-600/50 dark:hover:scrollbar-thumb-gray-500/70">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">MONITOR EDIFICIO - LIOT</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">{connectionStatus}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Última actualización: {new Date(realTimeData.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Potencia Total</h3>
            <p className="text-2xl font-bold">{totalPower.toFixed(1)} W</p>
            <p className="text-xs opacity-75">Consumo actual</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Energía Total</h3>
            <p className="text-2xl font-bold">{totalEnergy.toFixed(1)} kWh</p>
            <p className="text-xs opacity-75">Acumulado</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Voltaje Promedio</h3>
            <p className="text-2xl font-bold">{avgVoltage.toFixed(1)} V</p>
            <p className="text-xs opacity-75">Fases A, B, C</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <h3 className="text-sm font-medium opacity-90">Corriente Promedio</h3>
            <p className="text-2xl font-bold">{avgCurrent.toFixed(1)} A</p>
            <p className="text-xs opacity-75">Fases A, B, C</p>
          </div>
        </div>

        {/* Phase Details */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Detalles por Fase</h3>
          <div className="space-y-3">
            {['A', 'B', 'C'].map((phase) => (
              <div key={phase} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Fase {phase}</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Voltaje</p>
                    <p className="font-semibold">{realTimeData[`V_RMS${phase}`].toFixed(1)}V</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Corriente</p>
                    <p className="font-semibold">{realTimeData[`I_RMS${phase}`].toFixed(1)}A</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Potencia</p>
                    <p className={`font-semibold ${realTimeData[`PPROM_${phase}`] < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {realTimeData[`PPROM_${phase}`].toFixed(0)}W
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Impacto Ambiental</h3>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">
            {Math.round(Math.abs(totalEnergy) * 0.233)} kg CO₂
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">Emisiones estimadas</p>
        </div>

        {/* Connection Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">Estado de Conexión</h3>
          <div className="space-y-1 text-xs">
            <p className="text-blue-600 dark:text-blue-400">
              Estado: <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Datos recibidos: {dataStats.realtimePoints}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Charts */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/40 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/60 dark:scrollbar-thumb-gray-600/40 dark:hover:scrollbar-thumb-gray-500/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Real-time Power Trend */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Tendencia de Potencia en Tiempo Real</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartDataForDisplay}>
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `Hora: ${label}`}
                  formatter={(value, name) => [`${value.toFixed(1)} W`, 'Potencia Total']}
                />
                <Area type="monotone" dataKey="totalPower" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Power Distribution by Phase */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Distribución de Potencia</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={powerData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(0)}W`}
                >
                  {powerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toFixed(1)} W`, 'Potencia']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Energy Consumption by Phase */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Consumo Energético por Fase</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={energyData}>
                <XAxis dataKey="phase" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name) => [`${value.toFixed(2)} ${name === 'kWh' ? 'kWh' : name === 'current' ? 'A' : 'V'}`, name === 'kWh' ? 'Energía' : name === 'current' ? 'Corriente' : 'Voltaje']} />
                <Bar dataKey="kWh" fill="#a3bf42" name="kWh" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Voltage Levels */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Voltajes Línea a Línea</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={voltageLineData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)} V`, 'Voltaje']} />
                <Line type="monotone" dataKey="voltage" stroke="#ff7300" strokeWidth={3} dot={{ fill: '#ff7300', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current Comparison */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Comparación de Corrientes</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={currentData}>
                <RadialBar dataKey="current" cornerRadius={10} fill="#8884d8" />
                <Tooltip formatter={(value) => [`${value.toFixed(1)} A`, 'Corriente']} />
                <Legend />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* System Efficiency */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Eficiencia del Sistema</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={efficiencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Estadísticas de Datos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dataStats.realtimePoints}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Puntos de Particle</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{historicalData.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Registros Históricos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{dataStats.totalPoints}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Puntos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
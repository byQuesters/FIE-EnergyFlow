'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  RadialBarChart, RadialBar, Legend
} from 'recharts'

import styles from "./styles.css"

import * as React from "react";

export default function Dashboard() {
  const [mounted, setMounted] = React.useState(false);

  const [realTimeData, setRealTimeData] = React.useState({
    I_RMSA: 12.5,
    I_RMSB: 11.8,
    I_RMSC: 13.2,
    V_RMSA: 220.5,
    V_RMSB: 218.7,
    V_RMSC: 221.3,
    V_RMSAB: 380.2,
    V_RMSBC: 379.8,
    V_RMSCA: 381.1,
    PPROM_A: 2750.8,
    PPROM_B: 2580.3,
    PPROM_C: 2920.1,
    kWhA: 125.4,
    kWhB: 118.7,
    kWhC: 132.9,
    timestamp: new Date().toISOString()
  });

  const [historicalData, setHistoricalData] = React.useState([]);
  const [realtimeChartData, setRealtimeChartData] = React.useState([]);
  const [isConnected, setIsConnected] = React.useState(true);
  const [dataStats, setDataStats] = React.useState({
    realtimePoints: 150,
    synthesizedPoints: 850,
    totalPoints: 1000
  });

  React.useEffect(() => {
    setMounted(true);

    // Simulate initial historical data
    const generateHistoricalData = () => {
      const data = [];
      for (let i = 0; i < 20; i++) {
        const timestamp = new Date(Date.now() - i * 10000).toISOString();
        data.push({
          timestamp,
          I_RMSA: 12 + Math.random() * 2,
          I_RMSB: 11 + Math.random() * 2,
          I_RMSC: 13 + Math.random() * 2,
          V_RMSA: 218 + Math.random() * 5,
          V_RMSB: 217 + Math.random() * 5,
          V_RMSC: 219 + Math.random() * 5,
          PPROM_A: 2700 + Math.random() * 100,
          PPROM_B: 2500 + Math.random() * 100,
          PPROM_C: 2900 + Math.random() * 100,
          kWhA: 120 + Math.random() * 10,
          kWhB: 115 + Math.random() * 10,
          kWhC: 130 + Math.random() * 10
        });
      }
      return data;
    };

    const initialData = generateHistoricalData();
    setHistoricalData(initialData);

    // Initialize real-time chart data
    const initialChartData = initialData.slice(0, 20).reverse().map((item, index) => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      timestamp: item.timestamp,
      totalPower: Math.abs(item.PPROM_A || 0) + Math.abs(item.PPROM_B || 0) + Math.abs(item.PPROM_C || 0),
      totalEnergy: (item.kWhA || 0) + (item.kWhB || 0) + (item.kWhC || 0),
      avgVoltage: ((item.V_RMSA || 0) + (item.V_RMSB || 0) + (item.V_RMSC || 0)) / 3,
      avgCurrent: ((item.I_RMSA || 0) + (item.I_RMSB || 0) + (item.I_RMSC || 0)) / 3,
      CO2: Math.round(((item.kWhA || 0) + (item.kWhB || 0) + (item.kWhC || 0)) * 0.233),
      powerA: Math.abs(item.PPROM_A || 0),
      powerB: Math.abs(item.PPROM_B || 0),
      powerC: Math.abs(item.PPROM_C || 0)
    }));
    
    setRealtimeChartData(initialChartData);

    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      const newData = {
        I_RMSA: 12 + Math.random() * 2,
        I_RMSB: 11 + Math.random() * 2,
        I_RMSC: 13 + Math.random() * 2,
        V_RMSA: 218 + Math.random() * 5,
        V_RMSB: 217 + Math.random() * 5,
        V_RMSC: 219 + Math.random() * 5,
        V_RMSAB: 378 + Math.random() * 5,
        V_RMSBC: 377 + Math.random() * 5,
        V_RMSCA: 379 + Math.random() * 5,
        PPROM_A: 2700 + Math.random() * 100,
        PPROM_B: 2500 + Math.random() * 100,
        PPROM_C: 2900 + Math.random() * 100,
        kWhA: realTimeData.kWhA + Math.random() * 0.1,
        kWhB: realTimeData.kWhB + Math.random() * 0.1,
        kWhC: realTimeData.kWhC + Math.random() * 0.1,
        timestamp: new Date().toISOString()
      };
      
      setRealTimeData(newData);
      
      // Update historical data
      setHistoricalData(prev => {
        const updated = [newData, ...prev];
        return updated.length > 100 ? updated.slice(0, 100) : updated;
      });

      // Update real-time chart data
      setRealtimeChartData(prev => {
        const newPoint = {
          time: new Date(newData.timestamp).toLocaleTimeString(),
          timestamp: newData.timestamp,
          totalPower: Math.abs(newData.PPROM_A || 0) + Math.abs(newData.PPROM_B || 0) + Math.abs(newData.PPROM_C || 0),
          totalEnergy: (newData.kWhA || 0) + (newData.kWhB || 0) + (newData.kWhC || 0),
          avgVoltage: ((newData.V_RMSA || 0) + (newData.V_RMSB || 0) + (newData.V_RMSC || 0)) / 3,
          avgCurrent: ((newData.I_RMSA || 0) + (newData.I_RMSB || 0) + (newData.I_RMSC || 0)) / 3,
          CO2: Math.round(((newData.kWhA || 0) + (newData.kWhB || 0) + (newData.kWhC || 0)) * 0.233),
          powerA: Math.abs(newData.PPROM_A || 0),
          powerB: Math.abs(newData.PPROM_B || 0),
          powerC: Math.abs(newData.PPROM_C || 0)
        };
        
        const updated = [newPoint, ...prev];
        return updated.length > 20 ? updated.slice(0, 20) : updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

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
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Monitor Energético</h2>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
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
            {['A', 'B', 'C'].map((phase, index) => (
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
                    <p className="font-semibold">{Math.abs(realTimeData[`PPROM_${phase}`]).toFixed(0)}W</p>
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
            {Math.round(totalEnergy * 0.233)} kg CO₂
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">Emisiones estimadas</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Puntos en Tiempo Real</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{dataStats.synthesizedPoints}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Puntos Sintetizados</p>
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
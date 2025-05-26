'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

import * as React from "react";
import { useTheme } from "next-themes";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const [realTimeData, setRealTimeData] = React.useState({
    I_RMSA: 0,
    I_RMSB: 0,
    I_RMSC: 0,
    V_RMSA: 0,
    V_RMSB: 0,
    PPROM_A: 0,
    PPROM_B: 0,
    PPROM_C: 0,
    kWhA: 0,
    kWhB: 0,
    kWhC: 0,
    timestamp: new Date().toISOString()
  });
  const [historicalData, setHistoricalData] = React.useState([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/get-data');
        const { latestData, historical } = await response.json();
        setRealTimeData(prev => ({ ...prev, ...latestData }));
        setHistoricalData(historical);
        setIsConnected(true);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setIsConnected(false);
      }
    };

    loadInitialData();

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/save-data', { method: 'POST' });
        const newData = await res.json();
        setRealTimeData(prev => ({ ...prev, ...newData }));
        setHistoricalData(prev => {
          const updated = [newData, ...prev];
          return updated.length > 100 ? updated.slice(0, 100) : updated;
        });
        setIsConnected(true);
      } catch (err) {
        console.error("Error updating data:", err);
        setIsConnected(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const barData = [
    { month: 'Fase A', kWh: realTimeData.kWhA },
    { month: 'Fase B', kWh: realTimeData.kWhB },
    { month: 'Fase C', kWh: realTimeData.kWhC },
  ];

  const pieData = [
    { name: 'Potencia A', value: realTimeData.PPROM_A },
    { name: 'Potencia B', value: realTimeData.PPROM_B },
    { name: 'Potencia C', value: realTimeData.PPROM_C },
  ];

  const lineData = historicalData.slice(0, 5).reverse().map((entry, index) => ({
    month: `#${index + 1}`,
    CO2: Math.round((entry.kWhA + entry.kWhB + entry.kWhC) * 0.233),
  }));

  const donutData = [
    { name: 'Main Power', value: 75 },
    { name: 'Green Energy', value: 25 },
  ];

  const COLORS = ['#a3bf42', '#ffbb76', '#b699ff'];
  return (
    <div className="flex flex-col lg:flex-row bg-white dark:bg-zinc-900 text-black dark:text-white overflow-hidden h-[90vh] text-foreground shadow border-b-[.3vh] border-[#ccdb94] dark:border-gray-700">
      {/* Sidebar - Altura fija de 85vh y scrollable */}
      <aside className="w-full lg:w-[20vw] bg-zinc-100 dark:bg-zinc-800 p-4 flex flex-col gap-4 h-[100%] overflow-y-auto">
        <div className="text-center">
          <h3 className="text-lg font-semibold">⚡ Energy Mode</h3>
          <div className="bg-white dark:bg-zinc-700 p-4 rounded-xl shadow h-[20vh] border-2 border-dashed border-gray-400 dark:border-gray-400 flex flex-col justify-center items-center">
            <h4 className="font-semibold text-center">Best Power Efficiency</h4>
            <p className="text-sm text-center">This mode will help to extend the power storage efficiency.</p>
            <button className="mt-2 px-3 py-1 rounded-md bg-green-500 text-white">Change Plan</button>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold">🔋 Energy Storage</h3>
          <div className="bg-white dark:bg-zinc-700 p-4 rounded-xl shadow h-[auto] border-2 border-dashed border-gray-400 dark:border-gray-400 flex flex-col justify-center items-center">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm text-center">
              <span>Main Power: 75%</span><br />
              <span>Green Energy: 25%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Altura fija de 85vh y scrollable */}
      <div className="flex-1 p-4 flex flex-col gap-4 h-[100%] overflow-y-auto border-l-[.5vh] border-[#ccdb94] dark:border-gray-700">
        <header className="mb-2 text-center">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 ">
            <div className="bg-[#ccdb94] dark:bg-green-800 p-3 rounded-lg shadow flex flex-col items-center justify-center border-2 border-dashed border-black dark:border-gray-400 flex flex-col justify-center items-center" 
                 title="Corriente RMS Fase A">
              <span className="text-xs">Corriente A</span>
              <strong>{realTimeData.I_RMSA.toFixed(2)} A</strong>
            </div>
            <div className="bg-[#ccdb94] dark:bg-green-800 p-3 rounded-lg shadow flex flex-col items-center justify-center border-2 border-dashed border-black dark:border-gray-400 flex flex-col justify-center items-center" 
                 title="Voltaje RMS Fase A">
              <span className="text-xs">Voltaje A</span>
              <strong>{realTimeData.V_RMSA.toFixed(2)} V</strong>
            </div>
            <div className="bg-[#ccdb94] dark:bg-green-800 p-3 rounded-lg shadow flex flex-col items-center justify-center border-2 border-dashed border-black dark:border-gray-400 flex flex-col justify-center items-center" 
                 title="Potencia Promedio A">
              <span className="text-xs">Potencia A</span>
              <strong>{realTimeData.PPROM_A.toFixed(2)} W</strong>
            </div>
            <div className="bg-[#ccdb94] dark:bg-green-800 p-3 rounded-lg shadow flex flex-col items-center justify-center border-2 border-dashed border-black dark:border-gray-400 flex flex-col justify-center items-center" 
                 title="kWh Total">
              <span className="text-xs">Consumo Total</span>
              <strong>{(realTimeData.kWhA + realTimeData.kWhB + realTimeData.kWhC).toFixed(2)} kWh</strong>
            </div>
            <div className="bg-[#ccdb94] dark:bg-green-800 p-3 rounded-lg shadow flex flex-col items-center justify-center border-2 border-dashed border-black dark:border-gray-400 flex flex-col justify-center items-center" 
                 title="Última actualización">
              <span className="text-xs">Última lectura</span>
              <strong>{new Date(realTimeData.timestamp).toLocaleTimeString()}</strong>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primer contenedor - ocupa 2 columnas en md+ */}
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow h-[35vh] flex flex-col border-2 border-dashed border-black dark:border-gray-400 md:col-span-2">
            <h4 className="font-semibold mb-2 text-center">Energía por Fase (kWh)</h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="kWh" fill="#5f5ea3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Segundo contenedor - ocupa 1 columna */}
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow h-[35vh] flex flex-col border-2 border-dashed border-black dark:border-gray-400">
            <h4 className="font-semibold mb-2 text-center">Potencia Promedio</h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow h-[35vh] flex flex-col border-2 border-dashed border-black dark:border-gray-400 flex flex-col justify-center items-center">
          <h4 className="font-semibold mb-2 text-center">Huella de Carbono Estimada (CO₂ kg)</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="CO2" stroke="#ccdb94" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
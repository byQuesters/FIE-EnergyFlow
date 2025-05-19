'use client'
import './styles.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

import * as React from "react";
import { useRouter } from 'next/navigation';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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

  const COLORS = ['#00C49F', '#FF8042', '#8884d8'];

  return (
    <div className="dashboard-container">
      {/* Header flotante */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ModeToggle />
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
        >
          {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>

      <div className="main-content">
        <header className="header">
          <h2>Dashboard</h2>
          <div className="cards">
            <div className="card green" data-title="Corriente RMS Fase A"><strong>{realTimeData.I_RMSA.toFixed(2)} A</strong></div>
            <div className="card green" data-title="Voltaje RMS Fase A"><strong>{realTimeData.V_RMSA.toFixed(2)} V</strong></div>
            <div className="card green" data-title="Potencia Promedio A"><strong>{realTimeData.PPROM_A.toFixed(2)} W</strong></div>
            <div className="card green" data-title="kWh Total"><strong>{(realTimeData.kWhA + realTimeData.kWhB + realTimeData.kWhC).toFixed(2)} kWh</strong></div>
            <div className="card green" data-title="Última actualización"><strong>{new Date(realTimeData.timestamp).toLocaleTimeString()}</strong></div>
          </div>
        </header>

        <div className="top-charts">
          <div className="chart-box">
            <h4>Energía por Fase (kWh)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kWh" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>Potencia Promedio</h4>
            <ResponsiveContainer width="100%" height={250}>
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

        <div className="bottom-chart">
          <div className="chart-box full-width">
            <h4>Huella de Carbono Estimada (CO₂ kg)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="CO2" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <aside className="sidebar">
        <div className="energy-mode">
          <h3>⚡ Energy Mode</h3>
          <div className="mode-box">
            <h4>Best Power Efficiency</h4>
            <p>This mode will help to extend the power storage efficiency.</p>
            <button>Change Plan</button>
          </div>
        </div>

        <div className="energy-storage">
          <h3>🔋 Energy Storage</h3>
          <ResponsiveContainer width="100%" height={200}>
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
          <div className="legend">
            <span>Main Power: 75%</span>
            <span>Green Energy: 25%</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

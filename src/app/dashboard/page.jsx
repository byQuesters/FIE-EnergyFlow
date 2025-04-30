'use client'
import './styles.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { useSearchParams } from 'next/navigation'
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for different buildings
const buildingData = {
  LM: {
    barData: [
      { month: 'Jan', kWh: 350 },
      { month: 'Feb', kWh: 280 },
      { month: 'Mar', kWh: 420 },
      { month: 'Apr', kWh: 310 },
      { month: 'May', kWh: 500 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 60 },
      { name: 'Off Hours', value: 40 },
    ],
    lineData: [
      { month: 'Jan', CO2: 110 },
      { month: 'Feb', CO2: 105 },
      { month: 'Mar', CO2: 120 },
      { month: 'Apr', CO2: 95 },
      { month: 'May', CO2: 90 },
    ],
    stats: {
      efficiency: '75%',
      renewable: '65%',
      emissionReduction: '45%',
      costSavings: '$1,100 / mes',
      carbonFootprint: '120 tCO₂/año'
    }
  },
  LSE: {
    barData: [
      { month: 'Jan', kWh: 450 },
      { month: 'Feb', kWh: 320 },
      { month: 'Mar', kWh: 550 },
      { month: 'Apr', kWh: 380 },
      { month: 'May', kWh: 650 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 70 },
      { name: 'Off Hours', value: 30 },
    ],
    lineData: [
      { month: 'Jan', CO2: 130 },
      { month: 'Feb', CO2: 115 },
      { month: 'Mar', CO2: 140 },
      { month: 'Apr', CO2: 105 },
      { month: 'May', CO2: 100 },
    ],
    stats: {
      efficiency: '68%',
      renewable: '72%',
      emissionReduction: '38%',
      costSavings: '$1,350 / mes',
      carbonFootprint: '170 tCO₂/año'
    }
  },
  LEM: {
    barData: [
      { month: 'Jan', kWh: 400 },
      { month: 'Feb', kWh: 300 },
      { month: 'Mar', kWh: 500 },
      { month: 'Apr', kWh: 350 },
      { month: 'May', kWh: 600 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 65 },
      { name: 'Off Hours', value: 35 },
    ],
    lineData: [
      { month: 'Jan', CO2: 120 },
      { month: 'Feb', CO2: 110 },
      { month: 'Mar', CO2: 130 },
      { month: 'Apr', CO2: 100 },
      { month: 'May', CO2: 95 },
    ],
    stats: {
      efficiency: '70%',
      renewable: '70%',
      emissionReduction: '40%',
      costSavings: '$1,250 / mes',
      carbonFootprint: '150 tCO₂/año'
    }
  },
  LE: {
    barData: [
      { month: 'Jan', kWh: 300 },
      { month: 'Feb', kWh: 250 },
      { month: 'Mar', kWh: 400 },
      { month: 'Apr', kWh: 280 },
      { month: 'May', kWh: 450 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 55 },
      { name: 'Off Hours', value: 45 },
    ],
    lineData: [
      { month: 'Jan', CO2: 100 },
      { month: 'Feb', CO2: 95 },
      { month: 'Mar', CO2: 110 },
      { month: 'Apr', CO2: 85 },
      { month: 'May', CO2: 80 },
    ],
    stats: {
      efficiency: '80%',
      renewable: '75%',
      emissionReduction: '50%',
      costSavings: '$1,500 / mes',
      carbonFootprint: '100 tCO₂/año'
    }
  },
  D: {
    barData: [
      { month: 'Jan', kWh: 200 },
      { month: 'Feb', kWh: 150 },
      { month: 'Mar', kWh: 250 },
      { month: 'Apr', kWh: 180 },
      { month: 'May', kWh: 300 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 50 },
      { name: 'Off Hours', value: 50 },
    ],
    lineData: [
      { month: 'Jan', CO2: 90 },
      { month: 'Feb', CO2: 85 },
      { month: 'Mar', CO2: 95 },
      { month: 'Apr', CO2: 75 },
      { month: 'May', CO2: 70 },
    ],
    stats: {
      efficiency: '85%',
      renewable: '80%',
      emissionReduction: '55%',
      costSavings: '$1,800 / mes',
      carbonFootprint: '90 tCO₂/año'
    }
  },
  LIC: {
    barData: [
      { month: 'Jan', kWh: 600 },
      { month: 'Feb', kWh: 500 },
      { month: 'Mar', kWh: 700 },
      { month: 'Apr', kWh: 550 },
      { month: 'May', kWh: 800 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 80 },
      { name: 'Off Hours', value: 20 },
    ],
    lineData: [
      { month: 'Jan', CO2: 150 },
      { month: 'Feb', CO2: 140 },
      { month: 'Mar', CO2: 160 },
      { month: 'Apr', CO2: 130 },
      { month: 'May', CO2: 120 },
    ],
    stats: {
      efficiency: '65%',
      renewable: '60%',
      emissionReduction: '35%',
      costSavings: '$1,600 / mes',
      carbonFootprint: '200 tCO₂/año'
    }
  },
  LIOT: {
    barData: [
      { month: 'Jan', kWh: 700 },
      { month: 'Feb', kWh: 600 },
      { month: 'Mar', kWh: 800 },
      { month: 'Apr', kWh: 650 },
      { month: 'May', kWh: 900 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 90 },
      { name: 'Off Hours', value: 10 },
    ],
    lineData: [
      { month: 'Jan', CO2: 180 },
      { month: 'Feb', CO2: 170 },
      { month: 'Mar', CO2: 190 },
      { month: 'Apr', CO2: 160 },
      { month: 'May', CO2: 150 },
    ],
    stats: {
      efficiency: '60%',
      renewable: '55%',
      emissionReduction: '30%',
      costSavings: '$1,900 / mes',
      carbonFootprint: '250 tCO₂/año'
    }
  },
  A1: {
    barData: [
      { month: 'Jan', kWh: 800 },
      { month: 'Feb', kWh: 700 },
      { month: 'Mar', kWh: 900 },
      { month: 'Apr', kWh: 750 },
      { month: 'May', kWh: 1000 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 95 },
      { name: 'Off Hours', value: 5 },
    ],
    lineData: [
      { month: 'Jan', CO2: 200 },
      { month: 'Feb', CO2: 190 },
      { month: 'Mar', CO2: 210 },
      { month: 'Apr', CO2: 180 },
      { month: 'May', CO2: 170 },
    ],
    stats: {
      efficiency: '55%',
      renewable: '50%',
      emissionReduction: '25%',
      costSavings: '$2,000 / mes',
      carbonFootprint: '300 tCO₂/año'
    }
  },
  A2: {
    barData: [
      { month: 'Jan', kWh: 900 },
      { month: 'Feb', kWh: 800 },
      { month: 'Mar', kWh: 1000 },
      { month: 'Apr', kWh: 850 },
      { month: 'May', kWh: 1100 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 98 },
      { name: 'Off Hours', value: 2 },
    ],
    lineData: [
      { month: 'Jan', CO2: 220 },
      { month: 'Feb', CO2: 210 },
      { month: 'Mar', CO2: 230 },
      { month: 'Apr', CO2: 200 },
      { month: 'May', CO2: 190 },
    ],
    stats: {
      efficiency: '50%',
      renewable: '45%',
      emissionReduction: '20%',
      costSavings: '$2,200 / mes',
      carbonFootprint: '350 tCO₂/año'
    }
  },
  A3: {
    barData: [
      { month: 'Jan', kWh: 1000 },
      { month: 'Feb', kWh: 900 },
      { month: 'Mar', kWh: 1100 },
      { month: 'Apr', kWh: 950 },
      { month: 'May', kWh: 1200 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 99 },
      { name: 'Off Hours', value: 1 },
    ],
    lineData: [
      { month: 'Jan', CO2: 250 },
      { month: 'Feb', CO2: 240 },
      { month: 'Mar', CO2: 260 },
      { month: 'Apr', CO2: 230 },
      { month: 'May', CO2: 220 },
    ],
    stats: {
      efficiency: '45%',
      renewable: '40%',
      emissionReduction: '15%',
      costSavings: '$2,500 / mes',
      carbonFootprint: '400 tCO₂/año'
    }
  },
};

const COLORS = ['#00C49F', '#FF8042']

const donutData = [
  { name: 'Main Power', value: 50 },
  { name: 'Green Energy', value: 25 },
]

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
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const searchParams = useSearchParams();
  const buildingCode = searchParams.get('building') || 'default';
  const building = buildingData[buildingCode] || buildingData.default;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="main-content">
        <header className="header">
          <h2>Dashboard{buildingCode !== 'default' ? ` - Edificio ${buildingCode}` : ''}</h2>
          <div className="cards">
            <div className="card green" data-title="Overall System Efficiency"><strong>{building.stats.efficiency}</strong></div>
            <div className="card green" data-title="Renewable Energy Utilization"><strong>{building.stats.renewable}</strong></div>
            <div className="card green" data-title="Carbon Emission Reduction"><strong>{building.stats.emissionReduction}</strong></div>
            <div className="card green" data-title="Energy Cost Savings"><strong>{building.stats.costSavings}</strong></div>
            <div className="card green" data-title="Overall System Carbon Footprint"><strong>{building.stats.carbonFootprint}</strong></div>
          </div>
        </header>

        <div className="top-charts">
          <div className="chart-box">
            <h4>Uso de energía (kWh/mes)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={building.barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kWh" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>Daily Energy Cost</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={building.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {building.pieData.map((entry, index) => (
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
            <h4>Carbon Footprint CO₂ (kg/mes)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={building.lineData}>
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
            <span>Main Power: 50%</span>
            <span>Green Energy: 25%</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
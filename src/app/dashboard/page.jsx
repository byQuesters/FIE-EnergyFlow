'use client'
import './styles.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { useSearchParams } from 'next/navigation'

//Datos de ejemplo para los edificios 
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
      { month: 'Jan', kWh: 400 },
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
  LEM: {
    barData: [
      { month: 'Jan', kWh: 300 },
      { month: 'Feb', kWh: 350 },
      { month: 'Mar', kWh: 400 },
      { month: 'Apr', kWh: 450 },
      { month: 'May', kWh: 500 },
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
      costSavings: '$1,300 / mes',
      carbonFootprint: '100 tCO₂/año'
    }
  },
  LE: {
    barData: [
      { month: 'Jan', kWh: 450 },
      { month: 'Feb', kWh: 400 },
      { month: 'Mar', kWh: 350 },
      { month: 'Apr', kWh: 300 },
      { month: 'May', kWh: 250 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 70 },
      { name: 'Off Hours', value: 30 },
    ],
    lineData: [
      { month: 'Jan', CO2: 130 },
      { month: 'Feb', CO2: 125 },
      { month: 'Mar', CO2: 140 },
      { month: 'Apr', CO2: 115 },
      { month: 'May', CO2: 110 },
    ],
    stats: {
      efficiency: '65%',
      renewable: '60%',
      emissionReduction: '35%',
      costSavings: '$1,000 / mes',
      carbonFootprint: '160 tCO₂/año'
    }
  },
  D: {
    barData: [
      { month: 'Jan', kWh: 500 },
      { month: 'Feb', kWh: 450 },
      { month: 'Mar', kWh: 400 },
      { month: 'Apr', kWh: 350 },
      { month: 'May', kWh: 300 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 75 },
      { name: 'Off Hours', value: 25 },
    ],
    lineData: [
      { month: 'Jan', CO2: 140 },
      { month: 'Feb', CO2: 135 },
      { month: 'Mar', CO2: 150 },
      { month: 'Apr', CO2: 125 },
      { month: 'May', CO2: 120 },
    ],
    stats: {
      efficiency: '60%',
      renewable: '55%',
      emissionReduction: '30%',
      costSavings: '$900 / mes',
      carbonFootprint: '170 tCO₂/año'
    }
  },
  LIC: {
    barData: [
      { month: 'Jan', kWh: 600 },
      { month: 'Feb', kWh: 550 },
      { month: 'Mar', kWh: 500 },
      { month: 'Apr', kWh: 450 },
      { month: 'May', kWh: 400 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 80 },
      { name: 'Off Hours', value: 20 },
    ],
    lineData: [
      { month: 'Jan', CO2: 150 },
      { month: 'Feb', CO2: 145 },
      { month: 'Mar', CO2: 160 },
      { month: 'Apr', CO2: 135 },
      { month: 'May', CO2: 130 },
    ],
    stats: {
      efficiency: '55%',
      renewable: '50%',
      emissionReduction: '25%',
      costSavings: '$850 / mes',
      carbonFootprint: '180 tCO₂/año'
    }
  },
  LIOT: {
    barData: [
      { month: 'Jan', kWh: 700 },
      { month: 'Feb', kWh: 650 },
      { month: 'Mar', kWh: 600 },
      { month: 'Apr', kWh: 550 },
      { month: 'May', kWh: 500 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 85 },
      { name: 'Off Hours', value: 15 },
    ],
    lineData: [
      { month: 'Jan', CO2: 160 },
      { month: 'Feb', CO2: 155 },
      { month: 'Mar', CO2: 170 },
      { month: 'Apr', CO2: 145 },
      { month: 'May', CO2: 140 },
    ],
    stats: {
      efficiency: '50%',
      renewable: '45%',
      emissionReduction: '20%',
      costSavings: '$800 / mes',
      carbonFootprint: '190 tCO₂/año'
    }
  },
  A1: {
    barData: [
      { month: 'Jan', kWh: 800 },
      { month: 'Feb', kWh: 750 },
      { month: 'Mar', kWh: 700 },
      { month: 'Apr', kWh: 650 },
      { month: 'May', kWh: 600 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 90 },
      { name: 'Off Hours', value: 10 },
    ],
    lineData: [
      { month: 'Jan', CO2: 170 },
      { month: 'Feb', CO2: 165 },
      { month: 'Mar', CO2: 180 },
      { month: 'Apr', CO2: 155 },
      { month: 'May', CO2: 150 },
    ],
    stats: {
      efficiency: '45%',
      renewable: '40%',
      emissionReduction: '15%',
      costSavings: '$750 / mes',
      carbonFootprint: '200 tCO₂/año'
    }
  },
  A2: {
    barData: [
      { month: 'Jan', kWh: 900 },
      { month: 'Feb', kWh: 850 },
      { month: 'Mar', kWh: 800 },
      { month: 'Apr', kWh: 750 },
      { month: 'May', kWh: 700 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 95 },
      { name: 'Off Hours', value: 5 },
    ],
    lineData: [
      { month: 'Jan', CO2: 180 },
      { month: 'Feb', CO2: 175 },
      { month: 'Mar', CO2: 190 },
      { month: 'Apr', CO2: 165 },
      { month: 'May', CO2: 160 },
    ],
    stats: {
      efficiency: '40%',
      renewable: '35%',
      emissionReduction: '10%',
      costSavings: '$700 / mes',
      carbonFootprint: '210 tCO₂/año'
    }
  },
  A3: {
    barData: [
      { month: 'Jan', kWh: 1000 },
      { month: 'Feb', kWh: 950 },
      { month: 'Mar', kWh: 900 },
      { month: 'Apr', kWh: 850 },
      { month: 'May', kWh: 800 },
    ],
    pieData: [
      { name: 'Peak Hours', value: 100 },
      { name: 'Off Hours', value: 0 },
    ],
    lineData: [
      { month: 'Jan', CO2: 190 },
      { month: 'Feb', CO2: 185 },
      { month: 'Mar', CO2: 200 },
      { month: 'Apr', CO2: 175 },
      { month: 'May', CO2: 170 },
    ],
    stats: {
      efficiency: '35%',
      renewable: '30%',
      emissionReduction: '5%',
      costSavings: '$650 / mes',
      carbonFootprint: '220 tCO₂/año'
    }
  },
};

const COLORS = ['#00C49F', '#FF8042']

const donutData = [
  { name: 'Main Power', value: 50 },
  { name: 'Green Energy', value: 25 },
]

export default function Dashboard() {
  const searchParams = useSearchParams()
  const buildingCode = searchParams.get('building') || 'default'
  const building = buildingData[buildingCode] || buildingData.default

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="header">
          <h2>Dashboard {buildingCode !== 'default' ? `- Building ${buildingCode}` : ''}</h2>
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
            <h4>Energy Usage (kWh/mes)</h4>
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
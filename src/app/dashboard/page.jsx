'use client'
import './styles.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

const barData = [
  { month: 'Jan', kWh: 400 },
  { month: 'Feb', kWh: 300 },
  { month: 'Mar', kWh: 500 },
  { month: 'Apr', kWh: 350 },
  { month: 'May', kWh: 600 },
]

const pieData = [
  { name: 'Peak Hours', value: 65 },
  { name: 'Off Hours', value: 35 },
]

const COLORS = ['#00C49F', '#FF8042']

const lineData = [
  { month: 'Jan', CO2: 120 },
  { month: 'Feb', CO2: 110 },
  { month: 'Mar', CO2: 130 },
  { month: 'Apr', CO2: 100 },
  { month: 'May', CO2: 95 },
]

const donutData = [
  { name: 'Main Power', value: 50 },
  { name: 'Green Energy', value: 25 },
]

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="header">
          <h2>Dashboard</h2>
          <div className="cards">
            <div className="card green">Overall System Efficiency<br /><strong>70%</strong></div>
            <div className="card green">Renewable Energy Utilization<br /><strong>70%</strong></div>
            <div className="card green">Carbon Emission Reduction<br /><strong>40%</strong></div>
            <div className="card green">Energy Cost Savings<br /><strong>$1,250 / mes</strong></div>
            <div className="card green">Overall System Carbon Footprint<br /><strong>150 tCO₂/año</strong></div>
          </div>
        </header>

        <div className="top-charts">
          <div className="chart-box">
            <h4>Energy Usage (kWh/mes)</h4>
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
            <h4>Daily Energy Cost</h4>
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
            <h4>Carbon Footprint CO₂ (kg/mes)</h4>
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
            <span>Main Power: 50%</span>
            <span>Green Energy: 25%</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

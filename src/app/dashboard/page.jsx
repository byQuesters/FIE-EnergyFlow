import styles from './styles.css';
import React from 'react';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Contenedor principal */}
      <div className="main-content">
        {/* Encabezado y tarjetas */}
        <header className="header">
          <h2>Dashboard</h2>
          <div className="cards">
            <div className="card green">Overall System Efficiency<br /><strong>70%</strong></div>
            <div className="card green">Renewable Energy Utilization<br /><strong>70%</strong></div>
            <div className="card green">Carbon Emission Reduction<br /><strong>40%</strong></div>
            <div className="card green">Energy Cost Savings<br /><strong>150 metric tons CO2/year</strong></div>
            <div className="card green">Overall System Carbon Footprint<br /><strong>150 metric tons CO2/year</strong></div>
          </div>
        </header>

        {/* Gráficas superiores */}
        <div className="top-charts">
          <div className="chart-box">📊 Energy Usage</div>
          <div className="chart-box">🧁 Daily Energy Cost</div>
        </div>

        {/* Gráfica inferior */}
        <div className="bottom-chart">
          <div className="chart-box full-width">🌿 Carbon Footprint CO₂</div>
        </div>
      </div>
.
      {/* Contenedor lateral */}
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
          <div className="donut-chart">75% Capacity</div>
          <div className="legend">
            <span>Main Power: 50%</span>
            <span>Green Energy: 25%</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
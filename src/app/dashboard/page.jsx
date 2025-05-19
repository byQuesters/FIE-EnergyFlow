'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import './styles.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { useEffect, useState } from 'react'
import { Moon, Sun, Zap, Gauge } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [realTimeData, setRealTimeData] = useState({
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
  })
  const [historicalData, setHistoricalData] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  const handleLogout = async () => {
    await signOut({
      redirect: false,
      callbackUrl: '/login'
    })
    router.push('/login')
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    setMounted(true)

    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/get-data')
        const { latestData, historical } = await response.json()
        setRealTimeData(prev => ({
          ...prev,
          ...latestData
        }))
        setHistoricalData(historical)
        setIsConnected(true)
      } catch (error) {
        console.error("Error loading initial data:", error)
        setIsConnected(false)
      }
    }

    loadInitialData()

    const interval = setInterval(async () => {
      try {
        const saveResponse = await fetch('/api/save-data', { method: 'POST' })
        const newData = await saveResponse.json()
        setRealTimeData(prev => ({
          ...prev,
          ...newData
        }))
        setHistoricalData(prev => {
          const updated = [newData, ...prev]
          return updated.length > 100 ? updated.slice(0, 100) : updated
        })
        setIsConnected(true)
      } catch (error) {
        console.error("Error updating data:", error)
        setIsConnected(false)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (status === 'loading' || !mounted) {
    return <div className="loading">Cargando datos...</div>
  }

  const currentData = [
    { name: 'Fase A', value: realTimeData.I_RMSA || 0 },
    { name: 'Fase B', value: realTimeData.I_RMSB || 0 },
    { name: 'Fase C', value: realTimeData.I_RMSC || 0 }
  ]

  const powerData = historicalData.map(item => ({
    name: new Date(item.timestamp).toLocaleTimeString(),
    'Fase A': item.PPROM_A || 0,
    'Fase B': item.PPROM_B || 0,
    'Fase C': item.PPROM_C || 0
  }))

  const energyData = historicalData.map(item => ({
    name: new Date(item.timestamp).toLocaleTimeString(),
    'Fase A': item.kWhA || 0,
    'Fase B': item.kWhB || 0,
    'Fase C': item.kWhC || 0
  }))

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A'
    return num.toFixed(2)
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

  return (
    <div className="dashboard-container">
      {/* Sección de usuario y cierre de sesión */}
      <div className="logout-section">
        {session?.user && (
          <div className="user-info">
            <span>Bienvenido, {session.user.name || session.user.email}</span>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="logout-button"
            >
              Cerrar sesión
            </Button>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Oscuro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="main-content">
        <header className="header">
          <h2>Monitor Eléctrico Trifásico</h2>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            {isConnected ? 'Conectado a Particle' : 'Desconectado'}
          </div>

          <div className="cards">
            <div className="card" data-title="Corriente Fase A">
              <Zap className="icon" />
              <strong>{formatNumber(realTimeData.I_RMSA)} A</strong>
            </div>
            <div className="card" data-title="Corriente Fase B">
              <Zap className="icon" />
              <strong>{formatNumber(realTimeData.I_RMSB)} A</strong>
            </div>
            <div className="card" data-title="Corriente Fase C">
              <Zap className="icon" />
              <strong>{formatNumber(realTimeData.I_RMSC)} A</strong>
            </div>
            <div className="card" data-title="Voltaje A-N">
              <Gauge className="icon" />
              <strong>{formatNumber(realTimeData.V_RMSA)} V</strong>
            </div>
            <div className="card" data-title="Voltaje B-N">
              <Gauge className="icon" />
              <strong>{formatNumber(realTimeData.V_RMSB)} V</strong>
            </div>
          </div>
        </header>

        <div className="top-charts">
          <div className="chart-box">
            <h4>Consumo de Energía por Fase (kWh)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={energyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Fase A" fill="#8884d8" />
                <Bar dataKey="Fase B" fill="#82ca9d" />
                <Bar dataKey="Fase C" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>Distribución de Corriente</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} A`, 'Corriente']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bottom-chart">
          <div className="chart-box full-width">
            <h4>Potencia por Fase (W)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={powerData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Fase A" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="Fase B" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="Fase C" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
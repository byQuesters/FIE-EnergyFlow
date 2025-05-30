'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './styles.css'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    if (!formData.email.endsWith('@ucol.mx')) {
      setError('Solo se permiten correos institucionales ')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(text || 'Respuesta no válida del servidor')
      }

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Error de conexión')
      setIsLoading(false)
    }
  }

  return (
    <div className="loginview">
      <div className="logincard">
        <img src="/UCOL_Icon.png" className="logoucol" alt="Logo UCOL" />
        <h1>ENERGY FLOW</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre completo"
            required
          />
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo institucional" 
            pattern="[a-zA-Z0-9._%+-]+@ucol\.mx$"
            title="Solo se permiten correos institucionales"
            required
          />
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña (mínimo 8 caracteres)" 
            minLength="8"
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="auth-links">
          <Link href="/login">¿Ya tienes cuenta? Inicia sesión</Link>
          <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  )
}
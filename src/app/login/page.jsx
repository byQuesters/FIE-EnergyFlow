'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './styles.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true) // Activa el estado de carga
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.ok) {
        router.push('/dashboard')
      } else {
        setError(res?.error || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false) // Desactiva el estado de carga
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
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico" 
            required
          />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña" 
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <div className="auth-links">
          <a href="../register">¿No tienes cuenta? Regístrate</a>
          <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  )
}

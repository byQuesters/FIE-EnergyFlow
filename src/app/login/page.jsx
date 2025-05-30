'use client'
import React, { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './styles.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === 'loading') return;
    if (session) router.push('/map'); // si ya hay sesión, ir al mapa
  }, [status, session]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    if (!email.endsWith('@ucol.mx')) {
      setError('Solo se permiten correos institucionales')
      setIsLoading(false)
      return
    }
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.ok) {
        router.push('/')
      } else {
        setError(res?.error || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
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
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo institucional" 
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

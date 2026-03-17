/**
 * FRONTEND — App.jsx (reemplaza el original)
 * Maneja la sesión con JWT desde el backend.
 */
import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import DashboardLayout from './components/Dashboard/Layout'
import { auth } from './api'   // ← src/api.js (FRONTEND_api.js renombrado)

export default function App() {
  const [session, setSession] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al montar: intentar restaurar sesión desde localStorage
  useEffect(() => {
    const usuarioLocal = auth.getUsuarioLocal()
    if (usuarioLocal) {
      // Verificar que el token aún sea válido consultando /auth/me
      auth.me()
        .then(usuario => setSession(usuario))
        .catch(() => {
          // Token expirado → limpiar
          auth.logout()
        })
        .finally(() => setCargando(false))
    } else {
      setCargando(false)
    }
  }, [])

  // Escuchar evento de logout automático (token expirado mid-sesión)
  useEffect(() => {
    const handler = () => setSession(null)
    window.addEventListener('sigittn:logout', handler)
    return () => window.removeEventListener('sigittn:logout', handler)
  }, [])

  const handleLogin = (usuario) => setSession(usuario)

  const handleLogout = () => {
    auth.logout()
    setSession(null)
  }

  if (cargando) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <span style={{ color:'var(--color-text-secondary)', fontSize:14 }}>Cargando...</span>
      </div>
    )
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <DashboardLayout session={session} onLogout={handleLogout} />
}

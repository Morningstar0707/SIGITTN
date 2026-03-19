import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import DashboardLayout from './components/Dashboard/Layout'
import SolicitarReset from './components/SolicitarReset'
import RestablecerPassword from './components/RestablecerPassword'
import { ToastContainer, useToast } from './components/Toast'
import { auth } from './api'

function getPantalla() {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (path === '/reset-password' && token) return { pantalla: 'restablecer', token }
  return { pantalla: 'login', token: null }
}

export default function App() {
  const [session,    setSession]    = useState(null)
  const [cargando,   setCargando]   = useState(true)
  const [pantalla,   setPantalla]   = useState(() => getPantalla().pantalla)
  const [tokenReset, setTokenReset] = useState(() => getPantalla().token)

  const { toasts, mostrarToast, removerToast } = useToast()

  // Restaurar sesión desde localStorage
  useEffect(() => {
    const usuarioLocal = auth.getUsuarioLocal()
    if (usuarioLocal) {
      auth.me()
        .then(u => setSession(u))
        .catch(() => auth.logout())
        .finally(() => setCargando(false))
    } else {
      setCargando(false)
    }
  }, [])

  // Logout automático por token expirado
  useEffect(() => {
    const handler = () => {
      mostrarToast('salida', 'Sesión expirada', 'Vuelve a iniciar sesión')
      setSession(null)
    }
    window.addEventListener('sigittn:logout', handler)
    return () => window.removeEventListener('sigittn:logout', handler)
  }, [mostrarToast])

  const handleLogin = (usuario) => {
    setSession(usuario)
    mostrarToast('exito', `¡Bienvenido, ${usuario.nombre_usuario}!`,
      usuario.nombre_rol === 'admin' ? 'Administrador' : 'Usuario')
  }

  const handleLogout = (nombre) => {
    mostrarToast('salida', 'Sesión cerrada', `Hasta pronto, ${nombre}`)
    // Pequeño delay para que el toast sea visible antes de limpiar la sesión
    setTimeout(() => {
      auth.logout()
      setSession(null)
    }, 400)
  }

  const irAlLogin = () => {
    window.history.replaceState({}, '', '/')
    setPantalla('login')
    setTokenReset(null)
  }

  if (cargando) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0b1526',
        fontFamily: 'DM Sans, sans-serif', color: '#3a5070', fontSize: 14,
      }}>
        Cargando...
      </div>
    )
  }

  return (
    <>
      {/* Pantalla activa */}
      {pantalla === 'restablecer' && tokenReset ? (
        <RestablecerPassword token={tokenReset} onVolver={irAlLogin} />
      ) : pantalla === 'solicitar' ? (
        <SolicitarReset onVolver={irAlLogin} />
      ) : session ? (
        <DashboardLayout
          session={session}
          onLogout={() => handleLogout(session.nombre_usuario)}
        />
      ) : (
        <LoginPage
          onLogin={handleLogin}
          onOlvidePassword={() => setPantalla('solicitar')}
        />
      )}

      {/* Toasts — siempre visibles encima de todo */}
      <ToastContainer toasts={toasts} onRemove={removerToast} />
    </>
  )
}
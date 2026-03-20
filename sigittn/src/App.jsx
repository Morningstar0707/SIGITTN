import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import DashboardLayout from './components/Dashboard/Layout'
import SolicitarReset from './components/SolicitarReset'
import RestablecerPassword from './components/RestablecerPassword'
import { ToastContainer, useToast } from './components/Toast'
import { auth } from './api'
import { setupPushNotifications, teardownPushNotifications } from './notifications'

function getPantalla() {
  const path   = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const token  = params.get('token')
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
        .then(u => {
          setSession(u)
          // ← esto ya debe estar, si no agrégalo
        })
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

  const handleLogin = async (usuario) => {
    setSession(usuario)
    mostrarToast(
      'exito',
      `¡Bienvenido, ${usuario.nombre_usuario}!`,
      usuario.nombre_rol === 'admin' ? 'Administrador' : 'Usuario'
    )

    // Solicitar permiso y registrar suscripción push
    const token = localStorage.getItem('sigittn_token')
    if (token) {
      const resultado = await setupPushNotifications(token)
      if (resultado === 'denied') {
        // Informamos sutilmente, sin bloquear el flujo
        setTimeout(() => {
          mostrarToast(
            'info',
            'Notificaciones desactivadas',
            'Puedes activarlas desde la configuración del navegador'
          )
        }, 1500)
      }
    }
  }

  const handleLogout = async (nombre) => {
    // Des-suscribir push ANTES de borrar el token
    const token = localStorage.getItem('sigittn_token')
    await teardownPushNotifications(token)

    mostrarToast('salida', 'Sesión cerrada', `Hasta pronto, ${nombre}`)
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

      <ToastContainer toasts={toasts} onRemove={removerToast} />
    </>
  )
}

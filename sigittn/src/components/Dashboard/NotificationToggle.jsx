/**
 * SIGITTN — NotificationToggle.jsx
 * Widget del sidebar para que el usuario active o desactive
 * las notificaciones push desde la propia app.
 *
 * Estados posibles:
 *   - 'unsupported' → navegador no soporta push (oculto)
 *   - 'default'     → aún no ha pedido permiso
 *   - 'granted'     → activas
 *   - 'denied'      → bloqueadas por el usuario en el navegador
 *   - 'loading'     → procesando subscribe/unsubscribe
 */
import { useState, useEffect, useCallback } from 'react'
import { setupPushNotifications, teardownPushNotifications } from '../../notifications'

/* ── Íconos ── */
const BellOnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const BellOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
    <path d="M18 8a6 6 0 0 0-9.33-5"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const BellPendingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <circle cx="18" cy="8" r="3" fill="#f59e0b" stroke="none"/>
  </svg>
)

export default function NotificationToggle() {
  const [status,  setStatus]  = useState('loading')
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }

    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }

    navigator.serviceWorker.ready
      .then(registration => {
        registration.pushManager.getSubscription().then(async subscription => {
          if (subscription) {
            setStatus('granted')
          } else {
            const token = localStorage.getItem('sigittn_token')
            if (token) {
              setWorking(true)
              const result = await setupPushNotifications(token)
              setStatus(result === 'granted' ? 'granted' : Notification.permission)
              setWorking(false)
            } else {
              setStatus('default')
            }
          }
        })
      })
      .catch(() => setStatus('default'))
  }, [])

  const handleClick = useCallback(async () => {
    if (working || status === 'denied' || status === 'unsupported') return

    const token = localStorage.getItem('sigittn_token')
    setWorking(true)

    try {
      if (status === 'granted') {
        await teardownPushNotifications(token)
        setStatus('default')
      } else {
        const result = await setupPushNotifications(token)
        setStatus(result === 'granted' ? 'granted' : Notification.permission)
      }
    } finally {
      setWorking(false)
    }
  }, [status, working])

  if (status === 'unsupported' || status === 'loading') return null

  const cfgMap = {
    default: {
      label: 'Activar alertas',
      hint:  'Push desactivado',
      color: '#6b7f97',
      Icon:  BellPendingIcon,
    },
    granted: {
      label: 'Alertas activas',
      hint:  'Toca para desactivar',
      color: '#22c55e',
      Icon:  BellOnIcon,
    },
    denied: {
      label: 'Notificaciones bloqueadas',
      hint:  'Actívalas desde tu navegador',
      color: '#ef4444',
      Icon:  BellOffIcon,
    },
  }

  const cfg = cfgMap[status] || cfgMap.default
  const isClickable = status !== 'denied' && !working

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      title={cfg.hint}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         8,
        width:       '100%',
        padding:     '8px 10px',
        border:      'none',
        borderRadius: 8,
        background:  `${cfg.color}12`,
        color:       cfg.color,
        cursor:      isClickable ? 'pointer' : 'default',
        fontFamily:  'DM Sans, sans-serif',
        fontSize:    11,
        fontWeight:  500,
        textAlign:   'left',
        transition:  'background 0.18s ease, opacity 0.18s ease',
        opacity:     working ? 0.6 : 1,
        marginTop:   4,
      }}
    >
      {/* Ícono con punto de estado */}
      <span style={{ position: 'relative', flexShrink: 0, display: 'flex' }}>
        <cfg.Icon />
        {status === 'granted' && !working && (
          <span style={{
            position:     'absolute',
            top:          -2,
            right:        -2,
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   '#22c55e',
            boxShadow:    '0 0 0 2px #fff',
            animation:    'pulse-dot 2s infinite',
          }} />
        )}
      </span>

      {/* Texto */}
      <span style={{ lineHeight: 1.2 }}>
        {working ? 'Procesando…' : cfg.label}
      </span>

      {/* Toggle visual */}
      {status !== 'denied' && (
        <span style={{
          marginLeft:   'auto',
          width:        28,
          height:       16,
          borderRadius: 8,
          background:   status === 'granted' ? '#22c55e' : 'rgba(0,0,0,0.15)',
          position:     'relative',
          flexShrink:   0,
          transition:   'background 0.2s ease',
          border:       `1px solid ${status === 'granted' ? '#16a34a' : 'rgba(0,0,0,0.1)'}`,
        }}>
          <span style={{
            position:     'absolute',
            top:          1,
            left:         status === 'granted' ? 13 : 1,
            width:        12,
            height:       12,
            borderRadius: '50%',
            background:   '#fff',
            boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
            transition:   'left 0.2s ease',
          }} />
        </span>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </button>
  )
}
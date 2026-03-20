import { useState, useEffect, useCallback } from 'react'

/* ── Íconos ── */
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const LogoutIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)
const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const TIPOS = {
  exito:       { bg: '#0f2d1a', border: '#22c55e', color: '#4ade80', Icono: CheckIcon },
  salida:      { bg: '#1a1a2e', border: '#6366f1', color: '#a5b4fc', Icono: LogoutIconSmall },
  info:        { bg: '#0d1f35', border: '#3b82f6', color: '#60a5fa', Icono: InfoIcon },
  advertencia: { bg: '#2a1f0a', border: '#f59e0b', color: '#fbbf24', Icono: WarningIcon },
  error:       { bg: '#2d0f0f', border: '#ef4444', color: '#f87171', Icono: ErrorIcon },
}

/**
 * Componente Toast individual
 */
function ToastItem({ tipo, mensaje, nombre, onRemove }) {
  const [visible, setVisible] = useState(false)
  const { bg, border, color, Icono } = TIPOS[tipo] || TIPOS.info

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10)
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onRemove, 300)
    }, 3500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onRemove])

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${border}22`,
      minWidth: 260,
      maxWidth: 340,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(24px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      cursor: 'default',
      overflow: 'hidden',
    }}>
      {/* Ícono */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        <Icono />
      </div>

      {/* Texto */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13.5,
          fontWeight: 600,
          color: '#e8edf5',
          margin: 0,
          lineHeight: 1.3,
        }}>
          {mensaje}
        </p>
        {nombre && (
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            color: '#5a7a96',
            margin: '2px 0 0',
          }}>
            {nombre}
          </p>
        )}
      </div>

      {/* Barra de progreso */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        height: 2,
        borderRadius: '0 0 12px 12px',
        background: color,
        width: visible ? '0%' : '100%',
        transition: visible ? 'width 3.5s linear' : 'none',
      }} />
    </div>
  )
}

/**
 * useToast — hook para disparar toasts desde cualquier componente
 *
 * Tipos disponibles: 'exito' | 'salida' | 'info' | 'advertencia' | 'error'
 *
 * Uso:
 *   const { toasts, mostrarToast, removerToast } = useToast()
 *   mostrarToast('exito',  '¡Guardado!',      'Los cambios fueron aplicados')
 *   mostrarToast('error',  'Error al guardar', err.message)
 *   mostrarToast('info',   'Sin conexión',     'Revisa tu red')
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const mostrarToast = useCallback((tipo, mensaje, nombre = '') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, tipo, mensaje, nombre }])
  }, [])

  const removerToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, mostrarToast, removerToast }
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem
          key={t.id}
          tipo={t.tipo}
          mensaje={t.mensaje}
          nombre={t.nombre}
          onRemove={() => onRemove(t.id)}
        />
      ))}
    </div>
  )
}

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './TicketModal.module.css'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ModalInfoTicket({ ticket, onClose }) {
  // Bloquear scroll del fondo en móvil y fijar posición
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  const rows = [
    { label: 'Título',              value: ticket.titulo_ticket },
    { label: 'Estado',              value: ticket.nombre_estado },
    { label: 'Módulo de origen',    value: ticket.nombre_modulo_origen },
    { label: 'Nivel de urgencia',   value: ticket.nombre_nivel_urgencia },
    { label: 'Descripción',         value: ticket.descripcion_ticket || '—' },
    { label: 'Reportado por',       value: ticket.nombre_usuario_creador || '—' },
    { label: 'Usuario asignado',    value: ticket.nombre_usuario_asignado || '—' },
    { label: 'Fecha de creación',   value: fmt(ticket.fecha_creacion_ticket) },
    { label: 'Fecha de cierre',     value: fmt(ticket.fecha_cierre_ticket) },
  ]

  return createPortal(
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.modalSm}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Información — Ticket #{String(ticket.id_ticket).padStart(3, '0')}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>
        <div className={styles.infoBody}>
          {rows.map(({ label, value }) => (
            <div key={label} className={styles.infoRow}>
              <span className={styles.infoLabel}>{label}:</span>
              <span className={styles.infoValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

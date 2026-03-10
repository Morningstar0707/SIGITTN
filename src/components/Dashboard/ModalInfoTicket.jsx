import styles from './TicketModal.module.css'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ModalInfoTicket({ ticket, onClose }) {
  const rows = [
    { label: 'Título del ticket',     value: ticket.title },
    { label: 'Estado',                value: ticket.status },
    { label: 'Reportado por',         value: ticket.reporter },
    { label: 'Módulo de origen',      value: ticket.module },
    { label: 'Nivel de urgencia',     value: ticket.urgency },
    { label: 'Observaciones',         value: ticket.observations || '—' },
    { label: 'Dependencia responsable', value: ticket.dependencia || '—' },
    { label: 'Usuario responsable',   value: ticket.responsable || '—' },
    { label: 'Fecha y Hora',          value: `${ticket.date} - ${ticket.time}` },
  ]

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.modalSm}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Información de ticket</h2>
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
    </div>
  )
}

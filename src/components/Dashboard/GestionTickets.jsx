import { useState, useMemo } from 'react'
import styles from './GestionTickets.module.css'
import ModalCrearTicket from './ModalCrearTicket'
import ModalEditarTicket from './ModalEditarTicket'
import ModalNovedades from './ModalNovedades'
import ModalInfoTicket from './ModalInfoTicket'

/* ── Icons ── */
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)
const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const ChevronIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TicketIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
  </svg>
)
const PrevIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const NextIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

/* ── Sample data ── */
const MODULES = ['C1','C2','C3','C4','C5','C6','C7','C8','Unidad operativa']
const BASE_TICKETS = [
  { title:'Molinete dañado',     urgency:'Moderado',   module:'C3',              time:'4:48 P.M',  date:'21/02/2026', status:'Resuelto',    reporter:'Linda Cedeño',   observations:'El sensor del molinete no reconoce la tarjeta', dependencia:'Administrativa', responsable:'Henry Barón' },
  { title:'Fuga de agua',        urgency:'Inmediata',  module:'C2',              time:'5:48 P.M',  date:'22/02/2026', status:'Nuevo',       reporter:'Carlos López',   observations:'Fuga detectada en baño del módulo',              dependencia:'',              responsable:'' },
  { title:'Baldosa dañada',      urgency:'Planificado',module:'C1',              time:'7:48 P.M',  date:'23/02/2026', status:'Asignado',    reporter:'Ana Martínez',   observations:'Baldosa rota en el pasillo principal',           dependencia:'Operativo',     responsable:'Henry Barón' },
  { title:'Talanquera dañada',   urgency:'Alto',       module:'C8',              time:'10:00 A.M', date:'24/02/2026', status:'En progreso', reporter:'Jorge Peña',     observations:'Talanquera no abre correctamente',               dependencia:'Mantenimiento', responsable:'Henry Barón' },
  { title:'Fallo en biométrico', urgency:'Alto',       module:'Unidad operativa',time:'10:00 A.M', date:'24/02/2026', status:'Cerrado',     reporter:'María Silva',    observations:'El lector biométrico no responde',               dependencia:'Sistemas',      responsable:'Henry Barón' },
]
const INITIAL_TICKETS = Array.from({ length: 27 }, (_, i) => ({
  id: i + 1,
  num: String(i + 1).padStart(3, '0'),
  ...BASE_TICKETS[i % 5],
}))

const STATUS_COLORS = {
  'Nuevo':       { bg:'rgba(59,130,246,0.15)',  border:'rgba(59,130,246,0.35)',  color:'#0073ff' },
  'Asignado':    { bg:'rgba(168,85,247,0.15)',  border:'rgba(168,85,247,0.35)', color:'#8000ff' },
  'En progreso': { bg:'rgba(249,115,22,0.15)',  border:'rgba(249,115,22,0.35)', color:'#ff7300' },
  'Resuelto':    { bg:'rgba(34,197,94,0.15)',   border:'rgba(34,197,94,0.35)',  color:'#009c39' },
  'Cerrado':     { bg:'rgba(156,163,175,0.15)', border:'rgba(156,163,175,0.35)',color:'#5f5f5f' },
}

const DATE_FILTERS = ['Hoy','Esta semana','Este mes','Este año']
const STATUS_OPTIONS = ['Nuevo','Asignado','En progreso','Resuelto','Cerrado']
const TICKETS_PER_PAGE = 9

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS['Nuevo']
  return (
    <span className={styles.statusBadge} style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      {status}
    </span>
  )
}

export default function GestionTickets({ session }) {
  const [tickets, setTickets]           = useState(INITIAL_TICKETS)
  const [moduleFilter, setModuleFilter] = useState('')
  const [dateFilters, setDateFilters]   = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [currentPage, setCurrentPage]   = useState(1)

  const [showCreate, setShowCreate]       = useState(false)
  const [editTicket, setEditTicket]       = useState(null)
  const [infoTicket, setInfoTicket]       = useState(null)
  const [novedadesTicket, setNovedadesTicket] = useState(null)

  const toggleDateFilter = (f) => {
    setDateFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
    setCurrentPage(1)
  }
  const toggleStatusFilter = (s) => {
    setStatusFilters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    setCurrentPage(1)
  }

  const filtered = useMemo(() => {
    let list = tickets
    if (moduleFilter) list = list.filter(t => t.module === moduleFilter)
    if (statusFilters.length) list = list.filter(t => statusFilters.includes(t.status))
    return list
  }, [tickets, moduleFilter, statusFilters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / TICKETS_PER_PAGE))
  const paginated  = filtered.slice((currentPage - 1) * TICKETS_PER_PAGE, currentPage * TICKETS_PER_PAGE)

  const handleCreate = (data) => {
    const newT = {
      id: Date.now(),
      num: String(tickets.length + 1).padStart(3, '0'),
      time: new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }),
      date: new Date().toLocaleDateString('es-CO').replace(/\//g, '/'),
      status: 'Nuevo',
      reporter: session?.username || 'Usuario',
      ...data,
    }
    setTickets(prev => [newT, ...prev])
    setShowCreate(false)
  }

  const handleEdit = (updated) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
    setEditTicket(null)
  }

  return (
    <div className={styles.wrapper}>

      {/* ── HEADER CARD ── */}
      <div className={styles.headerCard}>
        <h1 className={styles.title}>Gestión de tickets</h1>
        <div className={styles.headerRow}>
          <div className={styles.moduleSelect}>
            <select
              className={styles.moduleDropdown}
              value={moduleFilter}
              onChange={e => { setModuleFilter(e.target.value); setCurrentPage(1) }}
            >
              <option value="">Seleccionar módulo</option>
              {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className={styles.selectChevron}><ChevronIcon /></span>
          </div>
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            <PlusIcon /> <span>Crear ticket</span>
          </button>
        </div>
      </div>

      {/* ── FILTER CARD ── */}
      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}><FilterIcon /> Filtrar por fecha:</span>
          <div className={styles.filterPills}>
            {DATE_FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.datePill} ${dateFilters.includes(f) ? styles.datePillActive : ''}`}
                onClick={() => toggleDateFilter(f)}
              >
                <span className={`${styles.pillCheck} ${dateFilters.includes(f) ? styles.pillCheckActive : ''}`} />
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterDivider} />
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>● Filtrar por estado:</span>
          <div className={styles.filterPills}>
            {STATUS_OPTIONS.map(s => {
              const c = STATUS_COLORS[s]
              const active = statusFilters.includes(s)
              return (
                <button
                  key={s}
                  className={`${styles.statusPill} ${active ? styles.statusPillActive : ''}`}
                  style={active ? { background: c.bg, border: `1px solid ${c.border}`, color: c.color } : {}}
                  onClick={() => toggleStatusFilter(s)}
                >
                  <span className={styles.statusDot} style={{ background: c.color }} />
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── PAGE INDICATOR ── */}
      <div className={styles.pageIndicator}>
        <span className={styles.pageNum}>{currentPage}</span>
      </div>

      {/* ── TICKET GRID ── */}
      {paginated.length === 0 ? (
        <div className={styles.emptyState}>No se encontraron tickets.</div>
      ) : (
        <div className={styles.grid}>
          {paginated.map(ticket => (
            <div key={ticket.id} className={styles.ticketCard}>
              <div className={styles.cardMain}>
                <div className={styles.cardTopRow}>
                  <span className={styles.ticketNum}>Ticket #{ticket.num}</span>
                  <span className={styles.urgencyText}>Nivel de urgencia: <strong>{ticket.urgency}</strong></span>
                </div>
                <div className={styles.cardMidRow}>
                  <span className={styles.cardTitle}>{ticket.title}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className={styles.cardBotRow}>
                  <span className={styles.cardModule}>Módulo: {ticket.module}</span>
                  <span className={styles.cardTime}>{ticket.time}</span>
                  <span className={styles.cardDate}>{ticket.date}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.actionBtn} title="Información" onClick={() => setInfoTicket(ticket)}>
                  <InfoIcon />
                </button>
                <button className={styles.actionBtn} title="Novedades" onClick={() => setNovedadesTicket(ticket)}>
                  <ChatIcon />
                </button>
                <button className={styles.actionBtn} title="Editar" onClick={() => setEditTicket(ticket)}>
                  <EditIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className={styles.footer}>
        <div className={styles.pagination}>
          <button
            className={styles.pageArrow}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          ><PrevIcon /></button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
              onClick={() => setCurrentPage(p)}
            >{p}</button>
          ))}

          <button
            className={styles.pageArrow}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          ><NextIcon /></button>
        </div>

        <div className={styles.ticketCount}>
          <TicketIcon />
          <span>{filtered.length} Tickets</span>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showCreate && (
        <ModalCrearTicket
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {editTicket && (
        <ModalEditarTicket
          ticket={editTicket}
          onClose={() => setEditTicket(null)}
          onSave={handleEdit}
        />
      )}
      {infoTicket && (
        <ModalInfoTicket
          ticket={infoTicket}
          onClose={() => setInfoTicket(null)}
        />
      )}
      {novedadesTicket && (
        <ModalNovedades
          ticket={novedadesTicket}
          onClose={() => setNovedadesTicket(null)}
        />
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import styles from './GestionTickets.module.css'
import ModalCrearTicket from './ModalCrearTicket'
import ModalEditarTicket from './ModalEditarTicket'
import ModalNovedades from './ModalNovedades'
import ModalInfoTicket from './ModalInfoTicket'
import { tickets as ticketsAPI, catalogos as catalogosAPI, notificaciones as notifAPI } from '../../api'
import ModuloSelect from './ModuloSelect'

/* ── Icons ── */
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)
const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const ChevronIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const TicketIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
  </svg>
)
const PrevIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const NextIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const STATUS_COLORS = {
  'Nuevo':       { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)',  color: '#0073ff' },
  'Asignado':    { bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.35)', color: '#8000ff' },
  'En progreso': { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.35)', color: '#ff7300' },
  'Resuelto':    { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.35)',  color: '#009c39' },
  'Cerrado':     { bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.35)',color: '#5f5f5f' },
}

const DATE_FILTERS = ['Hoy', 'Esta semana', 'Este mes', 'Este año']

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS['Nuevo']
  return (
    <span className={styles.statusBadge}
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      {status}
    </span>
  )
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

// Calcula si una fecha ISO cae dentro de un filtro de fecha
function matchDateFilter(isoDate, filter) {
  if (!isoDate) return false
  const d     = new Date(isoDate)
  const now   = new Date()
  const start = new Date()

  if (filter === 'Hoy') {
    return d.toDateString() === now.toDateString()
  }
  if (filter === 'Esta semana') {
    const day = now.getDay() || 7
    start.setDate(now.getDate() - day + 1)
    start.setHours(0, 0, 0, 0)
    return d >= start
  }
  if (filter === 'Este mes') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  if (filter === 'Este año') {
    return d.getFullYear() === now.getFullYear()
  }
  return false
}

export default function GestionTickets({ session }) {
  const [listaTickets,  setListaTickets]  = useState([])
  const [catalogos,     setCatalogos]     = useState({ modulos: [], estados: [], dependencias: [], usuarios: [] })
  const [cargando,      setCargando]      = useState(true)
  const [error,         setError]         = useState('')
  const [currentPage,   setCurrentPage]   = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [totalTickets,  setTotalTickets]  = useState(0)
  const [moduloFilter,  setModuloFilter]  = useState('')
  const [dateFilters,   setDateFilters]   = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [miTicketsFilter,  setMiTicketsFilter]  = useState(false)
  const [asignadosFilter,  setAsignadosFilter]  = useState(false)

  const [showCreate,      setShowCreate]      = useState(false)
  const [editTicket,      setEditTicket]      = useState(null)
  const [infoTicket,      setInfoTicket]      = useState(null)
  const [novedadesTicket, setNovedadesTicket] = useState(null)
  const [ticketsConNotif, setTicketsConNotif] = useState(new Set())
  const [contadores,      setContadores]      = useState({ creados: 0, asignados: 0 })

  // Cargar catálogos una sola vez
  useEffect(() => {
    catalogosAPI.obtener()
      .then(data => setCatalogos(data))
      .catch(() => {})
  }, [])

  // Contadores del usuario (tickets no cerrados)
  const fetchContadores = () => {
    ticketsAPI.contadores()
      .then(data => setContadores(data))
      .catch(() => {})
  }
  useEffect(() => { fetchContadores() }, [])

  // Polling de mensajes no leídos cada 10 segundos
  useEffect(() => {
    const fetchNoLeidos = () => {
      notifAPI.noLeidos()
        .then(data => setTicketsConNotif(new Set(data.ticketsConNoLeidos)))
        .catch(() => {})
    }
    fetchNoLeidos()
    const interval = setInterval(fetchNoLeidos, 10000)
    return () => clearInterval(interval)
  }, [])

  // Cargar tickets desde backend al cambiar filtros de módulo/estado/página
  const cargarTickets = useCallback(() => {
    setCargando(true)
    setError('')

    // Convertir nombres de estado a IDs para enviar al backend
    const estadosIds = statusFilters.length > 0
      ? statusFilters
          .map(nombre => catalogos.estados?.find(e => e.nombre_estado === nombre)?.id_estado)
          .filter(Boolean)
      : undefined

    ticketsAPI.listar({
      id_modulo_origen: moduloFilter || undefined,
      estados: estadosIds,
      page: currentPage,
    })
      .then(data => {
        setListaTickets(data.tickets)
        setTotalPages(data.pages)
        setTotalTickets(data.total)
      })
      .catch(err => setError(err.message))
      .finally(() => setCargando(false))
  }, [moduloFilter, statusFilters, currentPage, catalogos.estados])

  useEffect(() => { cargarTickets() }, [cargarTickets])

  // Filtro por fecha → mis tickets → asignados a mí (todos en cliente)
  const ticketsPorFecha = dateFilters.length === 0
    ? listaTickets
    : listaTickets.filter(t =>
        dateFilters.some(f => matchDateFilter(t.fecha_creacion_ticket, f))
      )

  const ticketsFiltrados = ticketsPorFecha.filter(t => {
    const esMio      = t.id_usuario_creador  === session?.id_usuario
    const esAsignado = t.id_usuario_asignado === session?.id_usuario
    if (miTicketsFilter && asignadosFilter) return esMio || esAsignado
    if (miTicketsFilter)  return esMio
    if (asignadosFilter)  return esAsignado
    return true
  })

  const toggleDateFilter = (f) => {
    setDateFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
    setCurrentPage(1)
  }
  const toggleStatusFilter = (nombre) => {
    setStatusFilters(prev =>
      prev.includes(nombre) ? prev.filter(x => x !== nombre) : [...prev, nombre]
    )
    setCurrentPage(1)
  }
  const toggleMiTickets = () => { setMiTicketsFilter(v => !v); setCurrentPage(1) }
  const toggleAsignados = () => { setAsignadosFilter(v => !v); setCurrentPage(1) }

  const handleCreate = async (datos) => {
    try {
      await ticketsAPI.crear(datos)
      setShowCreate(false)
      cargarTickets()
      fetchContadores()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = async (datos) => {
    try {
      await ticketsAPI.actualizar(editTicket.id_ticket, datos)
      setEditTicket(null)
      cargarTickets()
      fetchContadores()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleUpdateStatus = async (id_ticket, id_estado) => {
    try {
      await ticketsAPI.cambiarEstado(id_ticket, id_estado)
      cargarTickets()
    } catch (err) {
      alert(err.message)
    }
  }

  const abrirNovedades = (ticket) => {
    setNovedadesTicket(ticket)
    // Quitar la bolita al abrir
    setTicketsConNotif(prev => {
      const next = new Set(prev)
      next.delete(ticket.id_ticket)
      return next
    })
    // Marcar como leídos en el backend
    notifAPI.marcarTodosLeidos(ticket.id_ticket).catch(() => {})
  }

  const isAdmin = session?.nombre_rol === 'admin'

  return (
    <div className={styles.wrapper}>

      {/* ── CONTADORES fixed (desktop) ── */}
      <div className={styles.contadoresWrap}>
        <div className={styles.contadorCard} style={{ border: '1px solid rgba(30,111,197,0.28)' }}>
          <div className={styles.contadorIcono} style={{ background: 'rgba(30,111,197,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e6fc5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className={styles.contadorTexto}>
            <p className={styles.contadorLabel} style={{ color: '#5a7a9a' }}>Mis tickets activos</p>
            <p className={styles.contadorNum} style={{ color: '#1e6fc5' }}>{contadores.creados}</p>
          </div>
        </div>
        <div className={styles.contadorCard} style={{ border: '1px solid rgba(124,58,237,0.28)' }}>
          <div className={styles.contadorIcono} style={{ background: 'rgba(124,58,237,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className={styles.contadorTexto}>
            <p className={styles.contadorLabel} style={{ color: '#6a4a9a' }}>Asignados a mí activos</p>
            <p className={styles.contadorNum} style={{ color: '#7c3aed' }}>{contadores.asignados}</p>
          </div>
        </div>
      </div>

      {/* ── CONTADORES inline (móvil) ── */}
      <div className={styles.contadoresInline}>
        <div className={styles.contadorCard} style={{ border: '1px solid rgba(30,111,197,0.28)' }}>
          <div className={styles.contadorIcono} style={{ background: 'rgba(30,111,197,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e6fc5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className={styles.contadorTexto}>
            <p className={styles.contadorLabel} style={{ color: '#5a7a9a' }}>Mis tickets activos</p>
            <p className={styles.contadorNum} style={{ color: '#1e6fc5' }}>{contadores.creados}</p>
          </div>
        </div>
        <div className={styles.contadorCard} style={{ border: '1px solid rgba(124,58,237,0.28)' }}>
          <div className={styles.contadorIcono} style={{ background: 'rgba(124,58,237,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className={styles.contadorTexto}>
            <p className={styles.contadorLabel} style={{ color: '#6a4a9a' }}>Asignados a mí activos</p>
            <p className={styles.contadorNum} style={{ color: '#7c3aed' }}>{contadores.asignados}</p>
          </div>
        </div>
      </div>

      {/* ── HEADER CARD ── */}
      <div className={styles.headerCard}>
        <h1 className={styles.title}>Gestión de tickets</h1>
        <div className={styles.headerRow}>
          <div className={styles.moduleSelect}>
            <ModuloSelect
              modulos={catalogos.modulos || []}
              value={moduloFilter}
              onChange={(val) => { setModuloFilter(val); setCurrentPage(1) }}
            />
          </div>
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            <PlusIcon /> <span>Crear ticket</span>
          </button>
        </div>
      </div>

      {/* ── FILTER CARD ── */}
      <div className={styles.filterCard}>
        {/* Filtro por fecha */}
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

        {/* Filtro por estado */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>● Filtrar por estado:</span>
          <div className={styles.filterPills}>
            {catalogos.estados?.map(e => {
              const c = STATUS_COLORS[e.nombre_estado]
              const active = statusFilters.includes(e.nombre_estado)
              return (
                <button
                  key={e.id_estado}
                  className={`${styles.statusPill} ${active ? styles.statusPillActive : ''}`}
                  style={active && c ? { background: c.bg, border: `1px solid ${c.border}`, color: c.color } : {}}
                  onClick={() => toggleStatusFilter(e.nombre_estado)}
                >
                  {c && <span className={styles.statusDot} style={{ background: c.color }} />}
                  {e.nombre_estado}
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.filterDivider} />

        {/* Filtro por rol del usuario */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>👤 Filtrar por mí:</span>
          <div className={styles.filterPills}>
            <button
              className={`${styles.miPill} ${miTicketsFilter ? styles.miPillActive : ''}`}
              onClick={toggleMiTickets}
            >
              <span className={`${styles.pillCheck} ${miTicketsFilter ? styles.pillCheckActive : ''}`} />
              Mis tickets
            </button>
            <button
              className={`${styles.asignadoPill} ${asignadosFilter ? styles.asignadoPillActive : ''}`}
              onClick={toggleAsignados}
            >
              <span className={`${styles.pillCheck} ${asignadosFilter ? styles.pillCheckActive : ''}`} />
              Asignados a mí
            </button>
          </div>
        </div>
      </div>

      {/* ── PAGE INDICATOR ── */}
      <div className={styles.pageIndicator}>
        <span className={styles.pageNum}>{currentPage}</span>
      </div>

      {/* ── TICKET GRID ── */}
      {cargando ? (
        <div className={styles.emptyState}>Cargando tickets...</div>
      ) : error ? (
        <div className={styles.emptyState} style={{ color: '#e05c5c' }}>{error}</div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className={styles.emptyState}>No se encontraron tickets.</div>
      ) : (
        <div className={styles.grid}>
          {ticketsFiltrados.map(ticket => {
            const esMio      = ticket.id_usuario_creador  === session?.id_usuario
            const esAsignado = ticket.id_usuario_asignado === session?.id_usuario
            return (
            <div key={ticket.id_ticket}
              className={styles.ticketCard}
              style={{ position: 'relative' }}>
              {ticketsConNotif.has(ticket.id_ticket) && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 6px rgba(34,197,94,0.7)',
                  zIndex: 2,
                  animation: 'pulse 1.8s ease-in-out infinite',
                }} />
              )}
              <div className={styles.cardMain}>
                <div className={styles.cardTopRow}>
                  <span className={styles.ticketNum}>Ticket #{String(ticket.id_ticket).padStart(3, '0')}</span>
                  {esMio      && <span className={styles.miTicketBadge}>Mi ticket</span>}
                  {esAsignado && <span className={styles.asignadoBadge}>Asignado a mí</span>}
                  <span className={styles.urgencyText}>
                    Nivel de urgencia: <strong>{ticket.nombre_nivel_urgencia}</strong>
                  </span>
                </div>
                <div className={styles.cardMidRow}>
                  <span className={styles.cardTitle}>{ticket.titulo_ticket}</span>
                  <StatusBadge status={ticket.nombre_estado} />
                </div>
                <div className={styles.cardBotRow}>
                  <span className={styles.cardModule}>Módulo: {ticket.nombre_modulo_origen}</span>
                  <span className={styles.cardTime}>{formatHora(ticket.fecha_creacion_ticket)}</span>
                  <span className={styles.cardDate}>{formatFecha(ticket.fecha_creacion_ticket)}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.actionBtn} title="Información"
                  onClick={() => setInfoTicket(ticket)}>
                  <InfoIcon />
                </button>
                <button className={styles.actionBtn} title="Novedades"
                  onClick={() => abrirNovedades(ticket)}>
                  <ChatIcon />
                </button>
                {isAdmin && (
                  <button className={styles.actionBtn} title="Editar"
                    onClick={() => setEditTicket(ticket)}>
                    <EditIcon />
                  </button>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className={styles.footer}>
        <div className={styles.pagination}>
          <button className={styles.pageArrow}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}>
            <PrevIcon />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p}
              className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
              onClick={() => setCurrentPage(p)}>
              {p}
            </button>
          ))}
          <button className={styles.pageArrow}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}>
            <NextIcon />
          </button>
        </div>
        <div className={styles.ticketCount}>
          <TicketIcon />
          <span>{(dateFilters.length > 0 || miTicketsFilter || asignadosFilter) ? ticketsFiltrados.length : totalTickets} Ticket{totalTickets !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── MODALES ── */}
      {showCreate && (
        <ModalCrearTicket
          catalogos={catalogos}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {editTicket && (
        <ModalEditarTicket
          ticket={editTicket}
          catalogos={catalogos}
          isAdmin={isAdmin}
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
          session={session}
          onClose={() => setNovedadesTicket(null)}
        />
      )}
    </div>
  )
}
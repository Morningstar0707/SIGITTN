import { useState } from 'react'
import styles from './Layout.module.css'
import logoImg from '../../assets/logo.jpg'
import GestionUsuarios from './GestionUsuarios'
import GestionTickets from './GestionTickets'
import NotificationToggle from './NotificationToggle'

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const TicketsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 3h-8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="12" y2="17"/>
  </svg>
)
const AvatarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const NAV_ITEMS = [
  { id: 'usuarios', label: 'Usuarios',  icon: <UsersIcon />,  adminOnly: true },
  { id: 'tickets',  label: 'Tickets',   icon: <TicketsIcon /> },
]

export default function DashboardLayout({ session, onLogout }) {
  const isAdmin    = session.nombre_rol === 'admin'
  const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)
  const [activeNav, setActiveNav] = useState(isAdmin ? 'usuarios' : 'tickets')
  const [showNotifPanel, setShowNotifPanel] = useState(false)

  return (
    <div className={styles.shell}>

      {/* ── SIDEBAR (desktop) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <img src={logoImg} alt="El Terminal Neiva" className={styles.logoImg} />
        </div>
        <p className={styles.sidebarSubtitle}>Sistema de Gestión de Infraestructura TTN</p>
        <div className={styles.sidebarDivider} />

        <nav className={styles.nav}>
          {visibleNav.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeNav === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>
                {item.label === 'Usuarios' ? 'Gestionar usuarios' : 'Gestionar tickets'}
              </span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarDivider} />

          {/* ── Toggle de notificaciones ── */}
          <div style={{ padding: '0 8px 6px' }}>
            <NotificationToggle />
          </div>

          <div className={styles.userInfo}>
            <div className={styles.userAvatar}><AvatarIcon /></div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{session.nombre_usuario}</span>
              <span className={styles.userRole}>
                {session.nombre_rol === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <LogoutIcon />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        {activeNav === 'usuarios' && isAdmin && <GestionUsuarios />}
        {activeNav === 'tickets'  && <GestionTickets session={session} />}
      </main>

      {/* ── BOTTOM NAV (solo móvil) ── */}
      <nav className={styles.bottomNav}>
        {visibleNav.map(item => (
          <button
            key={item.id}
            className={`${styles.bottomNavItem} ${activeNav === item.id ? styles.bottomNavItemActive : ''}`}
            onClick={() => setActiveNav(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
            {activeNav === item.id && <span className={styles.bottomNavDot} />}
          </button>
        ))}

        {/* Botón de notificaciones en bottom nav móvil */}
        <button
          className={styles.bottomNavItem}
          onClick={() => setShowNotifPanel(prev => !prev)}
          title="Notificaciones push"
          style={{ position: 'relative' }}
        >
          <BellIcon />
          <span>Alertas</span>
        </button>

        {/* Panel flotante de notificaciones en móvil */}
        {showNotifPanel && (
          <div style={{
            position:  'fixed',
            bottom:    'calc(var(--bottom-nav-h) + var(--safe-bottom, 0px) + 8px)',
            right:     12,
            background: '#ffffff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding:   '12px 14px',
            zIndex:    200,
            minWidth:  220,
            border:    '1px solid rgba(0,0,0,0.07)',
          }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 11,
              color: '#6b7f97',
              margin: '0 0 8px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Notificaciones push
            </p>
            <NotificationToggle />
          </div>
        )}

        {/* Overlay para cerrar el panel al tocar fuera */}
        {showNotifPanel && (
          <div
            onClick={() => setShowNotifPanel(false)}
            style={{
              position: 'fixed', inset: 0,
              zIndex: 199,
            }}
          />
        )}

        {/* Usuario + logout */}
        <div className={styles.bottomUserBar}>
          <div>
            <p className={styles.bottomUserName}>{session.nombre_usuario}</p>
            <p className={styles.bottomUserRole}>
              {session.nombre_rol === 'admin' ? 'Admin' : 'Usuario'}
            </p>
          </div>
          <button className={styles.bottomLogoutBtn} onClick={onLogout} title="Cerrar sesión">
            <LogoutIcon />
          </button>
        </div>
      </nav>

    </div>
  )
}

import { useState } from 'react'
import styles from './Layout.module.css'
import logoImg from '../../assets/logo.jpg'
import GestionUsuarios from './GestionUsuarios'
import GestionTickets from './GestionTickets'

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const TicketsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const NAV_ITEMS = [
  { id: 'usuarios', label: 'Gestionar usuarios', icon: <UsersIcon />, adminOnly: true },
  { id: 'tickets',  label: 'Gestionar tickets',  icon: <TicketsIcon /> },
]

export default function DashboardLayout({ session, onLogout }) {
  // El backend devuelve nombre_rol: 'admin' | 'usuario'
  const isAdmin    = session.nombre_rol === 'admin'
  const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)
  const [activeNav, setActiveNav] = useState(isAdmin ? 'usuarios' : 'tickets')

  return (
    <div className={styles.shell}>
      {/* SIDEBAR */}
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
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarDivider} />
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

      {/* MAIN */}
      <main className={styles.main}>
        {activeNav === 'usuarios' && isAdmin && <GestionUsuarios />}
        {activeNav === 'tickets'  && <GestionTickets session={session} />}
      </main>
    </div>
  )
}

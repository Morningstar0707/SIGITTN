import { useState } from 'react'
import styles from './GestionUsuarios.module.css'
import ModalCrearUsuario from './ModalCrearUsuario'
import ModalEditarUsuario from './ModalEditarUsuario'

/* ── Icons ── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

const UserAvatarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

/* ── Sample data ── */
const INITIAL_USERS = [
  { id: 1, name: 'Henry Barón', role: 'Administrador', dependencia: 'Administrativo', estado: 'Activo' },
]

export default function GestionUsuarios() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = (newUser) => {
    setUsers(prev => [...prev, { id: Date.now(), ...newUser }])
    setShowCreate(false)
  }

  const handleEdit = (updated) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))
    setEditingUser(null)
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Header card ── */}
      <div className={styles.headerCard}>
        <h1 className={styles.title}>Gestión de usuarios</h1>
        <div className={styles.headerControls}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar usuario..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            <PlusIcon />
            <span>Crear usuario</span>
          </button>
        </div>
      </div>

      {/* ── Users list card ── */}
      <div className={styles.listCard}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No se encontraron usuarios.</p>
        ) : (
          <ul className={styles.userList}>
            {filtered.map(user => (
              <li key={user.id} className={styles.userItem}>
                <div className={styles.userAvatar}>
                  <UserAvatarIcon />
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userRole}>{user.role}</span>
                </div>
                <span className={styles.badge}>{user.dependencia}</span>
                <button
                  className={styles.editBtn}
                  onClick={() => setEditingUser(user)}
                  aria-label={`Editar ${user.name}`}
                >
                  <EditIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <ModalCrearUsuario
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
      {editingUser && (
        <ModalEditarUsuario
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  )
}

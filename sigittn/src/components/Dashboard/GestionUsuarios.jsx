import { useState, useEffect, useRef } from 'react'
import styles from './GestionUsuarios.module.css'
import ModalCrearUsuario from './ModalCrearUsuario'
import ModalEditarUsuario from './ModalEditarUsuario'
import { usuarios as usuariosAPI } from '../../api'

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const UserAvatarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function GestionUsuarios() {
  const [search,        setSearch]        = useState('')
  const [listaUsuarios, setListaUsuarios] = useState([])
  const [buscando,      setBuscando]      = useState(false)
  const [showCreate,    setShowCreate]    = useState(false)
  const [editingUser,   setEditingUser]   = useState(null)

  const debounceRef = useRef(null)

  // Debounce 300ms — busca mientras el usuario escribe, lista resultados abajo
  useEffect(() => {
    clearTimeout(debounceRef.current)

    const q = search.trim()

    if (q.length < 2) {
      setListaUsuarios([])
      setBuscando(false)
      return
    }

    setBuscando(true)
    debounceRef.current = setTimeout(() => {
      usuariosAPI.buscar(q)
        .then(data => setListaUsuarios(data.usuarios))
        .catch(() => setListaUsuarios([]))
        .finally(() => setBuscando(false))
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [search])

  const handleCreate = async (datos) => {
    try {
      const data = await usuariosAPI.crear(datos)
      setShowCreate(false)
      // Mostrar el usuario recién creado
      setSearch(data.usuario.nombre_usuario)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = async (datos) => {
    try {
      const data = await usuariosAPI.actualizar(editingUser.id_usuario, datos)
      setEditingUser(null)
      setListaUsuarios(prev =>
        prev.map(u => u.id_usuario === data.usuario.id_usuario ? data.usuario : u)
      )
    } catch (err) {
      alert(err.message)
    }
  }

  // Qué mostrar en la tarjeta inferior
  const mostrarVacio    = search.trim().length < 2 && !buscando
  const mostrarBuscando = buscando
  const mostrarSinRes   = !buscando && search.trim().length >= 2 && listaUsuarios.length === 0
  const mostrarResultados = !buscando && listaUsuarios.length > 0

  return (
    <div className={styles.wrapper}>

      {/* ── Header ── */}
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
              autoComplete="off"
            />
            {buscando && <span className={styles.searchSpinner} />}
          </div>
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            <PlusIcon /><span>Crear usuario</span>
          </button>
        </div>
      </div>

      {/* ── Lista ── */}
      <div className={styles.listCard}>
        {mostrarVacio && (
          <p className={styles.empty}>Escribe el nombre del usuario para buscarlo.</p>
        )}

        {mostrarBuscando && (
          <p className={styles.empty}>Buscando...</p>
        )}

        {mostrarSinRes && (
          <p className={styles.empty}>No se encontraron usuarios con "{search}".</p>
        )}

        {mostrarResultados && (
          <ul className={styles.userList}>
            {listaUsuarios.map(user => (
              <li key={user.id_usuario} className={styles.userItem}>
                <div className={styles.userAvatar}><UserAvatarIcon /></div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.nombre_usuario}</span>
                  <span className={styles.userRole}>
                    {user.nombre_rol === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
                <span className={styles.badge}>{user.nombre_dependencia || '—'}</span>
                <span className={styles.badge} style={{
                  borderColor: user.estado_usuario === 'activo' ? '#22c55e' : '#ef4444',
                  color:       user.estado_usuario === 'activo' ? '#16a34a' : '#dc2626',
                }}>
                  {user.estado_usuario === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  className={styles.editBtn}
                  onClick={() => setEditingUser(user)}
                  aria-label={`Editar ${user.nombre_usuario}`}
                >
                  <EditIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
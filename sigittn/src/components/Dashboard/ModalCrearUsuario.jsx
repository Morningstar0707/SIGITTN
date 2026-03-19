import { useState, useEffect } from 'react'
import styles from './Modal.module.css'
import { catalogos as catalogosAPI } from '../../api'

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function ModalCrearUsuario({ onClose, onCreate }) {
  const [cats,         setCats]         = useState({ roles: [], dependencias: [] })
  const [nombre,       setNombre]       = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [id_rol,       setIdRol]        = useState('')
  const [id_dep,       setIdDep]        = useState('')
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    catalogosAPI.obtener().then(data => setCats(data)).catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!nombre.trim())  e.nombre   = 'Requerido'
    if (!password.trim())e.password = 'Requerido'
    if (!id_rol)         e.rol      = 'Requerido'
    if (!id_dep)         e.dep      = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await onCreate({
        nombre_usuario: nombre.trim(),
        password,
        id_rol:         parseInt(id_rol),
        id_dependencia: parseInt(id_dep),
        estado_usuario: 'activo',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Crear usuario</h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Nombre de usuario</label>
            <input
              className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
              type="text" placeholder="Nombre completo"
              value={nombre} onChange={e => setNombre(e.target.value)}
              autoComplete="off"
            />
            {errors.nombre && <span className={styles.errorMsg}>{errors.nombre}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.passwordWrapper}>
              <input
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Rol</label>
            <select
              className={`${styles.select} ${errors.rol ? styles.inputError : ''}`}
              value={id_rol} onChange={e => setIdRol(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {cats.roles?.map(r => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre_rol === 'admin' ? 'Administrador' : 'Usuario'}
                </option>
              ))}
            </select>
            {errors.rol && <span className={styles.errorMsg}>{errors.rol}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Dependencia</label>
            <select
              className={`${styles.select} ${errors.dep ? styles.inputError : ''}`}
              value={id_dep} onChange={e => setIdDep(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {cats.dependencias?.map(d => (
                <option key={d.id_dependencia} value={d.id_dependencia}>{d.nombre_dependencia}</option>
              ))}
            </select>
            {errors.dep && <span className={styles.errorMsg}>{errors.dep}</span>}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancelar</button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import styles from './Modal.module.css'

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const ROLES = ['Administrador', 'Usuario']
const DEPENDENCIAS = ['Administrativo', 'Operativo', 'Mantenimiento', 'Servicios generales']

export default function ModalCrearUsuario({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rol, setRol] = useState('')
  const [dependencia, setDependencia] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim())       e.name = 'Requerido'
    if (!password.trim())   e.password = 'Requerido'
    if (!rol)               e.rol = 'Requerido'
    if (!dependencia)       e.dependencia = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onCreate({ name, password, role: rol, dependencia, estado: 'Activo' })
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Crear usuario</h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.body}>
          {/* Usuario */}
          <div className={styles.field}>
            <label className={styles.label}>Usuario</label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              type="text"
              placeholder="Nombre del usuario"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* Contraseña */}
          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.passwordWrapper}>
              <input
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          {/* Rol */}
          <div className={styles.field}>
            <label className={styles.label}>Rol</label>
            <select
              className={`${styles.select} ${errors.rol ? styles.inputError : ''}`}
              value={rol}
              onChange={e => setRol(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.rol && <span className={styles.errorMsg}>{errors.rol}</span>}
          </div>

          {/* Dependencia */}
          <div className={styles.field}>
            <label className={styles.label}>Dependencia</label>
            <select
              className={`${styles.select} ${errors.dependencia ? styles.inputError : ''}`}
              value={dependencia}
              onChange={e => setDependencia(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {DEPENDENCIAS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.dependencia && <span className={styles.errorMsg}>{errors.dependencia}</span>}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>Crear</button>
        </div>
      </div>
    </div>
  )
}

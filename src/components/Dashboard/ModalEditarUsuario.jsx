import { useState } from 'react'
import styles from './Modal.module.css'

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ROLES = ['Administrador', 'Usuario']
const DEPENDENCIAS = ['Administrativo', 'Operativo', 'Mantenimiento', 'Servicios generales']
const ESTADOS = ['Activo', 'Inactivo']

export default function ModalEditarUsuario({ user, onClose, onSave }) {
  const [rol, setRol] = useState(user.role || '')
  const [dependencia, setDependencia] = useState(user.dependencia || '')
  const [estado, setEstado] = useState(user.estado || '')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!rol)         e.rol = 'Requerido'
    if (!dependencia) e.dependencia = 'Requerido'
    if (!estado)      e.estado = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({ id: user.id, role: rol, dependencia, estado })
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar usuario</h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.body}>
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

          {/* Estado */}
          <div className={styles.field}>
            <label className={styles.label}>Estado</label>
            <select
              className={`${styles.select} ${errors.estado ? styles.inputError : ''}`}
              value={estado}
              onChange={e => setEstado(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.estado && <span className={styles.errorMsg}>{errors.estado}</span>}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

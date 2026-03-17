import { useState, useEffect } from 'react'
import styles from './Modal.module.css'
import { catalogos as catalogosAPI } from '../../api'

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ModalEditarUsuario({ user, onClose, onSave }) {
  const [cats,          setCats]          = useState({ roles: [], dependencias: [] })
  const [id_rol,        setIdRol]         = useState(user.id_rol || '')
  const [id_dependencia,setIdDependencia] = useState(user.id_dependencia || '')
  const [estado_usuario,setEstado]        = useState(user.estado_usuario || 'activo')
  const [errors,        setErrors]        = useState({})
  const [loading,       setLoading]       = useState(false)

  useEffect(() => {
    catalogosAPI.obtener().then(data => setCats(data)).catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!id_rol)         e.rol = 'Requerido'
    if (!id_dependencia) e.dep = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await onSave({
        id_rol:         parseInt(id_rol),
        id_dependencia: parseInt(id_dependencia),
        estado_usuario,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar — {user.nombre_usuario}</h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.body}>
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
              value={id_dependencia} onChange={e => setIdDependencia(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {cats.dependencias?.map(d => (
                <option key={d.id_dependencia} value={d.id_dependencia}>{d.nombre_dependencia}</option>
              ))}
            </select>
            {errors.dep && <span className={styles.errorMsg}>{errors.dep}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Estado</label>
            <select className={styles.select} value={estado_usuario} onChange={e => setEstado(e.target.value)}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancelar</button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

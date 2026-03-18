import { useState } from 'react'
import styles from './TicketModal.module.css'
import ModuloSelect from './ModuloSelect'
import UsuarioSelect from './UsuarioSelect'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const WarnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export default function ModalCrearTicket({ catalogos, onClose, onCreate }) {
  const [titulo,            setTitulo]        = useState('')
  const [id_modulo_origen,  setIdModulo]      = useState('')
  const [id_nivel_urgencia, setIdUrgencia]    = useState('')
  const [descripcion,       setDescripcion]   = useState('')
  const [id_dependencia,    setIdDependencia] = useState('')
  const [id_responsable,    setIdResponsable] = useState('')
  const [errors,            setErrors]        = useState({})
  const [loading,           setLoading]       = useState(false)

  // Filtrar usuarios por dependencia seleccionada
  const usuariosFiltrados = id_dependencia
    ? (catalogos.usuarios || []).filter(u => {
        const dep = catalogos.dependencias?.find(d => d.id_dependencia === parseInt(id_dependencia))
        return dep && u.nombre_dependencia === dep.nombre_dependencia
      })
    : (catalogos.usuarios || [])

  const handleDependenciaChange = (val) => {
    setIdDependencia(val)
    setIdResponsable('') // limpiar usuario al cambiar dependencia
  }

  const validate = () => {
    const e = {}
    if (!titulo.trim())     e.titulo   = 'Requerido'
    if (!id_nivel_urgencia) e.urgencia = 'Requerido'
    if (!id_modulo_origen)  e.modulo   = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await onCreate({
        titulo_ticket:       titulo.trim(),
        descripcion_ticket:  descripcion.trim(),
        id_modulo_origen:    parseInt(id_modulo_origen),
        id_nivel_urgencia:   parseInt(id_nivel_urgencia),
        id_usuario_asignado: id_responsable ? parseInt(id_responsable) : undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Crear ticket</h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.twoCol}>
          {/* ── Izquierda ── */}
          <div className={styles.colLeft}>
            <div className={styles.field}>
              <label className={styles.label}>Título del ticket</label>
              <input
                className={`${styles.input} ${errors.titulo ? styles.inputError : ''}`}
                type="text" placeholder="Ingresa el título"
                value={titulo} onChange={e => setTitulo(e.target.value)}
              />
              {errors.titulo && <span className={styles.errMsg}>{errors.titulo}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Módulo de origen</label>
              <ModuloSelect
                modulos={catalogos.modulos || []}
                value={id_modulo_origen}
                onChange={setIdModulo}
                error={!!errors.modulo}
              />
              {errors.modulo && <span className={styles.errMsg}>{errors.modulo}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nivel de urgencia</label>
              <div className={styles.selectWrapper}>
                <select
                  className={`${styles.select} ${errors.urgencia ? styles.inputError : ''}`}
                  value={id_nivel_urgencia} onChange={e => setIdUrgencia(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {catalogos.urgencias?.map(u => (
                    <option key={u.id_nivel_urgencia} value={u.id_nivel_urgencia}>
                      {u.nombre_nivel_urgencia}
                    </option>
                  ))}
                </select>
              </div>
              {errors.urgencia && <span className={styles.errMsg}>{errors.urgencia}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Descripción</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe el problema..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* ── Derecha ── */}
          <div className={styles.colRight}>
            <div className={styles.assignBox}>
              <p className={styles.assignTitle}><WarnIcon /> Asignación personalizada</p>
              <p className={styles.assignDesc}>
                Selecciona la dependencia y el usuario responsable de atender este ticket.
              </p>
              <p className={styles.assignDesc}>
                Si desconoces esta información, deja los campos sin seleccionar.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Dependencia responsable</label>
              <div className={styles.selectWrapper}>
                <select className={styles.select} value={id_dependencia}
                  onChange={e => handleDependenciaChange(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {catalogos.dependencias?.map(d => (
                    <option key={d.id_dependencia} value={d.id_dependencia}>
                      {d.nombre_dependencia}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Usuario responsable</label>
              <UsuarioSelect
                usuarios={usuariosFiltrados}
                value={id_responsable}
                onChange={setIdResponsable}
                placeholder="Seleccionar responsable"
              />
            </div>
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

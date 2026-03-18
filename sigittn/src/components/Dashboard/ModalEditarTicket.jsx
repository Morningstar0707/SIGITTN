import { useState } from 'react'
import styles from './TicketModal.module.css'
import ModuloSelect from './ModuloSelect'
import UsuarioSelect from './UsuarioSelect'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ModalEditarTicket({ ticket, catalogos, isAdmin, onClose, onSave }) {
  const [titulo,            setTitulo]       = useState(ticket.titulo_ticket || '')
  const [id_modulo_origen,  setIdModulo]     = useState(String(ticket.id_modulo_origen || ''))
  const [id_nivel_urgencia, setIdUrgencia]   = useState(ticket.id_nivel_urgencia || '')
  const [id_estado,         setIdEstado]     = useState(ticket.id_estado || '')
  const [descripcion,       setDescripcion]  = useState(ticket.descripcion_ticket || '')
  const [id_asignado,       setIdAsignado]   = useState(String(ticket.id_usuario_asignado || ''))
  const [errors,            setErrors]       = useState({})
  const [loading,           setLoading]      = useState(false)

  const validate = () => {
    const e = {}
    if (!titulo.trim())     e.titulo   = 'Requerido'
    if (!id_modulo_origen)  e.modulo   = 'Requerido'
    if (!id_nivel_urgencia) e.urgencia = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    const payload = {
      titulo_ticket:      titulo.trim(),
      descripcion_ticket: descripcion.trim(),
      id_modulo_origen:   parseInt(id_modulo_origen),
      id_nivel_urgencia:  parseInt(id_nivel_urgencia),
      id_estado:          parseInt(id_estado),
    }
    if (isAdmin) payload.id_usuario_asignado = id_asignado ? parseInt(id_asignado) : null
    try {
      await onSave(payload)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Editar ticket #{String(ticket.id_ticket).padStart(3, '0')}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.twoCol}>
          {/* ── Izquierda ── */}
          <div className={styles.colLeft}>
            <div className={styles.field}>
              <label className={styles.label}>Título del ticket</label>
              <input
                className={`${styles.input} ${errors.titulo ? styles.inputError : ''}`}
                type="text" placeholder="Título"
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
                placeholder="Descripción..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* ── Derecha ── */}
          <div className={styles.colRight}>
            <div className={styles.field}>
              <label className={styles.label}>Estado</label>
              <div className={styles.selectWrapper}>
                <select className={styles.select} value={id_estado}
                  onChange={e => setIdEstado(e.target.value)}>
                  <option value="">Seleccionar</option>
                  {catalogos.estados?.map(e => (
                    <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                  ))}
                </select>
              </div>
            </div>

            {isAdmin && (
              <div className={styles.field}>
                <label className={styles.label}>Usuario asignado</label>
                <UsuarioSelect
                  usuarios={catalogos.usuarios || []}
                  value={id_asignado}
                  onChange={setIdAsignado}
                  placeholder="Sin asignar"
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Reportado por</label>
              <input className={styles.input} type="text"
                value={ticket.nombre_usuario_creador || '—'} disabled
                style={{ background: '#f5f7fa', color: '#8a9ab0' }}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Fecha de creación</label>
              <input className={styles.input} type="text"
                value={ticket.fecha_creacion_ticket
                  ? new Date(ticket.fecha_creacion_ticket).toLocaleString('es-CO')
                  : '—'} disabled
                style={{ background: '#f5f7fa', color: '#8a9ab0' }}
              />
            </div>
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

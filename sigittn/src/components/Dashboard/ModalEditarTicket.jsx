import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './TicketModal.module.css'
import ModuloSelect from './ModuloSelect'
import UsuarioSelect from './UsuarioSelect'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ModalEditarTicket({ ticket, catalogos, isAdmin, onClose, onSave }) {
  const [titulo,            setTitulo]        = useState(ticket.titulo_ticket || '')
  const [id_modulo_origen,  setIdModulo]      = useState(String(ticket.id_modulo_origen || ''))
  const [id_nivel_urgencia, setIdUrgencia]    = useState(ticket.id_nivel_urgencia || '')
  const [id_estado,         setIdEstado]      = useState(ticket.id_estado || '')
  const [descripcion,       setDescripcion]   = useState(ticket.descripcion_ticket || '')
  const [id_asignado,       setIdAsignado]    = useState(String(ticket.id_usuario_asignado || ''))
  const [id_dependencia,    setIdDependencia] = useState(() => {
    if (!ticket.id_usuario_asignado) return ''
    const usuario = (catalogos.usuarios || []).find(u => u.id_usuario === ticket.id_usuario_asignado)
    if (!usuario) return ''
    const dep = (catalogos.dependencias || []).find(d => d.nombre_dependencia === usuario.nombre_dependencia)
    return dep ? String(dep.id_dependencia) : ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Bloquear scroll del fondo en móvil y fijar posición
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  // Filtrar usuarios por dependencia seleccionada
  const usuariosFiltrados = id_dependencia
    ? (catalogos.usuarios || []).filter(u => {
        const dep = catalogos.dependencias?.find(d => d.id_dependencia === parseInt(id_dependencia))
        return dep && u.nombre_dependencia === dep.nombre_dependencia
      })
    : (catalogos.usuarios || [])

  // Al cambiar dependencia → limpiar usuario
  const handleDependenciaChange = (val) => {
    setIdDependencia(val)
    setIdAsignado('')
  }

  // Al seleccionar usuario → autocompletar dependencia con la suya
  const handleAsignadoChange = (val) => {
    setIdAsignado(val)
    if (val) {
      const usuario = (catalogos.usuarios || []).find(u => String(u.id_usuario) === String(val))
      if (usuario?.nombre_dependencia) {
        const dep = (catalogos.dependencias || []).find(
          d => d.nombre_dependencia === usuario.nombre_dependencia
        )
        if (dep) setIdDependencia(String(dep.id_dependencia))
      }
    }
  }

  const validate = () => {
    const e = {}
    if (!titulo.trim())     e.titulo   = 'Requerido'
    if (!id_modulo_origen)  e.modulo   = 'Requerido'
    if (!id_nivel_urgencia) e.urgencia = 'Requerido'

    // Si se llena uno de los campos de asignación, el otro también es obligatorio
    if (isAdmin) {
      const tieneDep  = !!id_dependencia
      const tieneResp = !!id_asignado
      if (tieneDep && !tieneResp) {
        e.asignado = 'Selecciona también un usuario responsable'
      }
      if (tieneResp && !tieneDep) {
        e.dependencia = 'Selecciona también una dependencia'
      }
    }

    // Si el ticket NO está en 'Nuevo', dependencia y responsable son obligatorios
    const estadoNuevo = catalogos.estados?.find(s => s.nombre_estado === 'Nuevo')
    const estaEnNuevo = parseInt(id_estado) === estadoNuevo?.id_estado
    if (!estaEnNuevo && isAdmin) {
      if (!id_dependencia) e.dependencia = 'Requerido para tickets en este estado'
      if (!id_asignado)    e.asignado    = 'Requerido para tickets en este estado'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    // Si está en 'Nuevo' y se le asigna responsable → cambiar a 'Asignado' automáticamente
    const estadoNuevo    = catalogos.estados?.find(e => e.nombre_estado === 'Nuevo')
    const estadoAsignado = catalogos.estados?.find(e => e.nombre_estado === 'Asignado')
    const estaEnNuevo    = parseInt(id_estado) === estadoNuevo?.id_estado

    const estadoFinal = (estaEnNuevo && !!id_asignado && estadoAsignado)
      ? estadoAsignado.id_estado
      : parseInt(id_estado)

    const payload = {
      titulo_ticket:      titulo.trim(),
      descripcion_ticket: descripcion.trim(),
      id_modulo_origen:   parseInt(id_modulo_origen),
      id_nivel_urgencia:  parseInt(id_nivel_urgencia),
      id_estado:          estadoFinal,
    }
    if (isAdmin) payload.id_usuario_asignado = id_asignado ? parseInt(id_asignado) : null
    try {
      await onSave(payload)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
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
              {(() => {
                const estaCerrado = catalogos.estados?.find(e => e.nombre_estado === 'Cerrado')?.id_estado === parseInt(id_estado)
                return estaCerrado ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input className={styles.input} type="text" value="Cerrado" disabled
                      style={{ background: '#f5f7fa', color: '#8a9ab0', cursor: 'not-allowed' }} />
                    <span style={{
                      fontSize: 11, color: '#8a9ab0', fontFamily: 'DM Sans, sans-serif',
                      whiteSpace: 'nowrap',
                    }}>No editable</span>
                  </div>
                ) : (
                  <div className={styles.selectWrapper}>
                    <select className={styles.select} value={id_estado}
                      onChange={e => setIdEstado(e.target.value)}>
                      <option value="">Seleccionar</option>
                      {catalogos.estados?.map(e => (
                        <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                      ))}
                    </select>
                  </div>
                )
              })()}
            </div>

            {isAdmin && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Dependencia responsable</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={`${styles.select} ${errors.dependencia ? styles.inputError : ''}`}
                      value={id_dependencia}
                      onChange={e => handleDependenciaChange(e.target.value)}
                    >
                      <option value="">Todas las dependencias</option>
                      {catalogos.dependencias?.map(d => (
                        <option key={d.id_dependencia} value={d.id_dependencia}>
                          {d.nombre_dependencia}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.dependencia && <span className={styles.errMsg}>{errors.dependencia}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Usuario asignado</label>
                  <UsuarioSelect
                    usuarios={usuariosFiltrados}
                    value={id_asignado}
                    onChange={handleAsignadoChange}
                    placeholder="Sin asignar"
                    error={!!errors.asignado}
                  />
                  {errors.asignado && <span className={styles.errMsg}>{errors.asignado}</span>}
                </div>
              </>
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
    </div>,
    document.body
  )
}
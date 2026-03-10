import { useState } from 'react'
import styles from './TicketModal.module.css'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const WarnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const MODULOS = ['C1','C2','C3','C4','C5','C6','C7','C8','Unidad operativa']
const URGENCIAS    = ['Inmediata','Alto','Moderado','Planificado']
const DEPENDENCIAS = ['Administrativo','Operativo','Mantenimiento','Servicios generales']
const USUARIOS     = ['Henry Barón','Leidy Toledo','Carlos López','Ana Martínez']

export default function ModalCrearTicket({ onClose, onCreate }) {
  const [titulo,      setTitulo]      = useState('')
  const [modulo,      setModulo]      = useState('')
  const [urgencia,    setUrgencia]    = useState('')
  const [obs,         setObs]         = useState('')
  const [dependencia, setDependencia] = useState('')
  const [responsable, setResponsable] = useState('')
  const [errors,      setErrors]      = useState({})

  const validate = () => {
    const e = {}
    if (!titulo.trim()) e.titulo = 'Requerido'
    if (!urgencia)      e.urgencia = 'Requerido'
    if (!modulo)        e.modulo = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onCreate({ title: titulo, module: modulo, urgency: urgencia, observations: obs, dependencia, responsable })
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Crear ticket</h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div className={styles.twoCol}>
          {/* LEFT */}
          <div className={styles.colLeft}>
            <div className={styles.field}>
              <label className={styles.label}>Título del ticket</label>
              <input
                className={`${styles.input} ${errors.titulo ? styles.inputError : ''}`}
                type="text"
                placeholder="Ingresa el título"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
              {errors.titulo && <span className={styles.errMsg}>{errors.titulo}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Módulo de origen</label>
              <div className={styles.selectWrapper}>
                <select
                  className={`${styles.select} ${errors.modulo ? styles.inputError : ''}`}
                  value={modulo}
                  onChange={e => setModulo(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {MODULOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {errors.modulo && <span className={styles.errMsg}>{errors.modulo}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nivel de urgencia</label>
              <div className={styles.selectWrapper}>
                <select
                  className={`${styles.select} ${errors.urgencia ? styles.inputError : ''}`}
                  value={urgencia}
                  onChange={e => setUrgencia(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {URGENCIAS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {errors.urgencia && <span className={styles.errMsg}>{errors.urgencia}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Observaciones</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe el problema..."
                value={obs}
                onChange={e => setObs(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* RIGHT */}
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
                <select
                  className={styles.select}
                  value={dependencia}
                  onChange={e => setDependencia(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {DEPENDENCIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Usuario responsable</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={responsable}
                  onChange={e => setResponsable(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {USUARIOS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
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

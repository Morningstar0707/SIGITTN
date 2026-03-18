import { useState, useRef, useEffect } from 'react'
import styles from './TicketModal.module.css'
import { mensajes as mensajesAPI } from '../../api'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const AvatarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

function fmtHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function ModalNovedades({ ticket, session, onClose }) {
  const [mensajes,  setMensajes]  = useState([])
  const [inputVal,  setInputVal]  = useState('')
  const [cargando,  setCargando]  = useState(true)
  const bottomRef = useRef(null)
  const fileRef   = useRef(null)

  // Cargar mensajes del ticket
  useEffect(() => {
    mensajesAPI.listar(ticket.id_ticket)
      .then(data => setMensajes(data.mensajes))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [ticket.id_ticket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const sendText = async () => {
    if (!inputVal.trim()) return
    const texto = inputVal.trim()
    setInputVal('')
    try {
      const data = await mensajesAPI.enviarTexto(ticket.id_ticket, texto)
      setMensajes(prev => [...prev, data.mensaje])
    } catch (err) {
      alert(err.message)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() }
  }

  const handleImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // En producción aquí se subiría al servidor y se obtendría una URL real.
    // Por ahora usamos object URL local como placeholder.
    const url = URL.createObjectURL(file)
    try {
      const data = await mensajesAPI.enviarImagen(ticket.id_ticket, url)
      setMensajes(prev => [...prev, { ...data.mensaje, url_imagen_mensaje: url }])
    } catch (err) {
      alert(err.message)
    }
    e.target.value = ''
  }

  const miId = session?.id_usuario

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.modalChat}`}>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Novedades — #{String(ticket.id_ticket).padStart(3,'0')}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        {/* Chat */}
        <div className={styles.chatSection}>
          <p className={styles.chatLabel}>Evidencias y mensajes</p>
          <div className={styles.chatMessages}>
            {cargando ? (
              <p style={{ textAlign: 'center', color: '#8aa0b8', fontSize: 13 }}>Cargando...</p>
            ) : mensajes.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8aa0b8', fontSize: 13 }}>Sin mensajes aún.</p>
            ) : (
              mensajes.map(msg => {
                // Un mensaje "enviado" es el del usuario actual
                const esMio = msg.id_usuario === miId || !msg.id_usuario
                return (
                  <div key={msg.id_mensaje}
                    className={`${styles.msgRow} ${esMio ? styles.msgRowSent : styles.msgRowReceived}`}>
                    {!esMio && (
                      <div className={styles.msgAvatar}><AvatarIcon /></div>
                    )}
                    <div className={`${styles.msgBubble} ${esMio ? styles.msgBubbleSent : styles.msgBubbleReceived}`}>
                      {msg.url_imagen_mensaje ? (
                        <div className={styles.imgBubble}>
                          <img src={msg.url_imagen_mensaje} alt="evidencia" className={styles.chatImg} />
                          <span className={styles.msgTime}>{fmtHora(msg.fecha_mensaje)}</span>
                        </div>
                      ) : (
                        <div className={styles.textBubble}>
                          <span className={styles.msgText}>{msg.texto_mensaje}</span>
                          <span className={styles.msgTime}>{fmtHora(msg.fecha_mensaje)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className={styles.chatInput}>
            <input
              type="text"
              className={styles.chatTextInput}
              placeholder="Enviar mensaje..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKey}
            />
            {inputVal.trim() ? (
              <button className={styles.chatSendBtn} onClick={sendText}>
                <SendIcon />
              </button>
            ) : (
              <button className={styles.chatSendBtn} onClick={() => fileRef.current?.click()}>
                <ImageIcon />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleImage} />
          </div>
        </div>

      </div>
    </div>
  )
}

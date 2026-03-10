import { useState, useRef, useEffect } from 'react'
import styles from './TicketModal.module.css'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const AvatarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const ESTADOS = ['Nuevo','Asignado','En progreso','Resuelto','Cerrado']

const INITIAL_MESSAGES = [
  { id: 1, type: 'received', kind: 'image', src: null, time: '8:42 a.m.' },
  { id: 2, type: 'sent',     kind: 'text',  text: 'Voy en camino', time: '10:00 a.m.' },
  { id: 3, type: 'received', kind: 'text',  text: 'Ok', time: '10:00 a.m.' },
]

export default function ModalNovedades({ ticket, onClose }) {
  const [estado,   setEstado]   = useState('')
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputVal, setInputVal] = useState('')
  const bottomRef  = useRef(null)
  const fileRef    = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendText = () => {
    if (!inputVal.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now(), type: 'sent', kind: 'text', text: inputVal.trim(),
      time: new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }),
    }])
    setInputVal('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() }
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setMessages(prev => [...prev, {
      id: Date.now(), type: 'sent', kind: 'image', src: url,
      time: new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }),
    }])
    e.target.value = ''
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.modalChat}`}>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Novedades</h2>
          <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        {/* Estado + actions */}
        <div className={styles.chatTopBar}>
          <div className={styles.field} style={{ flex: 1 }}>
            <label className={styles.label}>Actualizar estado</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={estado}
                onChange={e => setEstado(e.target.value)}
              >
                <option value="">Seleccionar</option>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.chatTopActions}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button className={styles.submitBtn} onClick={onClose}>Actualizar</button>
          </div>
        </div>

        {/* Chat area */}
        <div className={styles.chatSection}>
          <p className={styles.chatLabel}>Evidencias</p>
          <div className={styles.chatMessages}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`${styles.msgRow} ${msg.type === 'sent' ? styles.msgRowSent : styles.msgRowReceived}`}
              >
                {msg.type === 'received' && (
                  <div className={styles.msgAvatar}><AvatarIcon /></div>
                )}
                <div className={`${styles.msgBubble} ${msg.type === 'sent' ? styles.msgBubbleSent : styles.msgBubbleReceived}`}>
                  {msg.kind === 'image' ? (
                    <div className={styles.imgBubble}>
                      {msg.src
                        ? <img src={msg.src} alt="evidencia" className={styles.chatImg} />
                        : <div className={styles.imgPlaceholder} />
                      }
                      <span className={styles.msgTime}>{msg.time}</span>
                    </div>
                  ) : (
                    <div className={styles.textBubble}>
                      <span className={styles.msgText}>{msg.text}</span>
                      <span className={styles.msgTime}>{msg.time}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImage} />
          </div>
        </div>

      </div>
    </div>
  )
}

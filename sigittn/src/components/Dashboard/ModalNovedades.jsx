import { useState, useRef, useEffect } from 'react'
import styles from './TicketModal.module.css'
import { mensajes as mensajesAPI } from '../../api'

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const LockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

function fmtHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function getInitial(nombre) {
  return nombre ? nombre.charAt(0).toUpperCase() : '?'
}

export default function ModalNovedades({ ticket, session, onClose }) {
  const [mensajes,        setMensajes]        = useState([])
  const [inputVal,        setInputVal]        = useState('')
  const [cargando,        setCargando]        = useState(true)
  const [sinAcceso,       setSinAcceso]       = useState(false)
  const [imagenExpandida, setImagenExpandida] = useState(null)
  const messagesRef = useRef(null)
  const fileRef     = useRef(null)
  const videoRef    = useRef(null)

  const miId       = session?.id_usuario
  const esAdmin    = session?.nombre_rol === 'admin'
  const esCreador  = ticket.id_usuario_creador  === miId
  const esAsignado = ticket.id_usuario_asignado === miId
  const puedeMensajear = esAdmin || esCreador || esAsignado
  const esCerrado      = ticket.nombre_estado === 'Cerrado'

  useEffect(() => {
    if (!puedeMensajear) {
      setCargando(false)
      setSinAcceso(true)
      return
    }
    mensajesAPI.listar(ticket.id_ticket)
      .then(data => setMensajes(data.mensajes))
      .catch(err => {
        if (err.message?.includes('403') || err.message?.includes('acceso')) {
          setSinAcceso(true)
        }
      })
      .finally(() => setCargando(false))
  }, [ticket.id_ticket])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [mensajes])

  const handleDescargar = (url) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `evidencia_ticket_${ticket.id_ticket}.jpg`
    a.target = '_blank'
    a.click()
  }

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

  const handleVideo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      try {
        const data = await mensajesAPI.enviarImagen(ticket.id_ticket, base64)
        setMensajes(prev => [...prev, { ...data.mensaje, url_imagen_mensaje: base64 }])
      } catch (err) {
        alert(err.message)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() }
  }

  const handleImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Convertir a base64 para que la imagen persista entre sesiones
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result // data:image/...;base64,...
      try {
        const data = await mensajesAPI.enviarImagen(ticket.id_ticket, base64)
        setMensajes(prev => [...prev, { ...data.mensaje, url_imagen_mensaje: base64 }])
      } catch (err) {
        alert(err.message)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <>
      {/* Lightbox */}
      {imagenExpandida && (
        <div
          onClick={() => setImagenExpandida(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
            padding: '24px 32px',
          }}
        >
          {/* Imagen + botón X juntos en un contenedor relativo */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative' }}
            className={styles.lightboxContenido}
          >
            <img
              src={imagenExpandida}
              alt="evidencia"
              style={{
                maxWidth: '88vw',
                maxHeight: 'calc(82vh - 100px)',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 10,
                display: 'block',
              }}
            />

          </div>
          {/* Botones */}
          <div style={{ display: 'flex', gap: 12 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => handleDescargar(imagenExpandida)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 24,
                background: '#1e6fc5', border: 'none', color: '#fff',
                fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer',
              }}
            >
              <DownloadIcon /> Descargar
            </button>
            <button
              onClick={() => setImagenExpandida(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 22px', borderRadius: 24,
                background: 'rgb(255, 0, 0)', border: 'none', color: '#fff',
                fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className={styles.overlay} style={{ alignItems: 'flex-start', background: 'transparent', backdropFilter: 'none' }} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 900,
          height: '80vh',
          maxHeight: '80vh',
          marginTop: '3vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 10px 30px rgba(0,0,0,0.4)',
          animation: 'modalIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}>

          {/* Header estilo WhatsApp */}
          <div style={{
            background: '#0b1526',
            padding: '12px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: '16px 16px 0 0',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Avatar del ticket */}
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: '#1e3a5a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Sans, sans-serif', fontSize: 16, fontWeight: 700,
                color: '#ffffff', flexShrink: 0,
              }}>
                #{String(ticket.id_ticket).padStart(2, '0')}
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
                  Ticket #{String(ticket.id_ticket).padStart(3, '0')}
                </p>
                {!sinAcceso && (
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
                    {ticket.nombre_usuario_creador || '—'}
                    {ticket.nombre_usuario_asignado ? ` · ${ticket.nombre_usuario_asignado}` : ''}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CloseIcon />
            </button>
          </div>

          {/* Info bar: Reportado por / Asignado */}
          {!sinAcceso && (
            <div style={{
              background: '#f4f6f9', borderBottom: '1px solid #e8edf5',
              padding: '8px 18px', display: 'flex', gap: 24, flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4a5e78' }}>
                <span style={{ fontWeight: 600, color: '#0f1e33' }}>Reportado por: </span>
                {ticket.nombre_usuario_creador || '—'}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4a5e78' }}>
                <span style={{ fontWeight: 600, color: '#0f1e33' }}>Asignado: </span>
                {ticket.nombre_usuario_asignado || 'Sin asignar'}
              </span>
            </div>
          )}

          {/* Sin acceso */}
          {sinAcceso ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 14, padding: '40px 32px', color: '#8aa0b8',
              background: '#f4f6f9',
            }}>
              <LockIcon />
              <p style={{ margin: 0, fontSize: 14, textAlign: 'center', lineHeight: 1.7, color: '#4a5e78' }}>
                Solo el creador del ticket, el responsable asignado<br />
                y los administradores pueden ver esta conversación.
              </p>
            </div>
          ) : (
            <div className={styles.chatSection}>
              {/* Mensajes */}
              <div className={styles.chatMessages} ref={messagesRef}>
                {cargando ? (
                  <p style={{ textAlign: 'center', color: '#8aa0b8', fontSize: 13, marginTop: 20 }}>Cargando...</p>
                ) : mensajes.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.9)', borderRadius: 8, border: '1px solid #e8edf5',
                      padding: '6px 16px', fontSize: 12.5,
                      color: '#667781', fontFamily: 'DM Sans, sans-serif',
                    }}>
                      Sin mensajes aún — comienza la conversación
                    </span>
                  </div>
                ) : (
                  mensajes.map((msg, idx) => {
                    const esMio = msg.id_usuario === miId
                    const nombreRemitente = msg.nombre_usuario || 'Usuario'
                    const msgPrev = mensajes[idx - 1]
                    const mismoRemitente = msgPrev && msgPrev.id_usuario === msg.id_usuario

                    return (
                      <div key={msg.id_mensaje}
                        style={{
                          display: 'flex',
                          justifyContent: esMio ? 'flex-end' : 'flex-start',
                          marginTop: mismoRemitente ? 2 : 8,
                          alignItems: 'flex-end',
                          gap: 6,
                        }}>

                        {/* Avatar del otro (solo en primer msg del grupo) */}
                        {!esMio && (
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: '#1e3a5a', color: '#fff',
                            fontWeight: 600, fontSize: 13,
                            display: mismoRemitente ? 'none' : 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginBottom: 2,
                          }}>
                            {getInitial(nombreRemitente)}
                          </div>
                        )}
                        {/* Spacer cuando es del mismo remitente */}
                        {!esMio && mismoRemitente && <div style={{ width: 30, flexShrink: 0 }} />}

                        <div style={{
                          maxWidth: '68%',
                          display: 'flex', flexDirection: 'column',
                          alignItems: esMio ? 'flex-end' : 'flex-start',
                          gap: 2,
                        }}>
                          {/* Nombre (solo en primer msg del grupo) */}
                          {!esMio && !mismoRemitente && (
                            <span style={{
                              fontSize: 11.5, color: '#1e6fc5', fontWeight: 600,
                              fontFamily: 'DM Sans, sans-serif', paddingLeft: 10,
                            }}>
                              {nombreRemitente}
                            </span>
                          )}

                          {msg.url_imagen_mensaje ? (
                            /* Burbuja de imagen o video */
                            <div style={{
                              background: esMio ? '#d1e4f7' : '#ffffff',
                              borderRadius: esMio ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              padding: 4,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.13)',
                              overflow: 'hidden',
                            }}>
                              {msg.url_imagen_mensaje.startsWith('data:video') ? (
                                /* Video */
                                <video
                                  src={msg.url_imagen_mensaje}
                                  controls
                                  style={{
                                    width: 220, maxWidth: '100%', borderRadius: 8,
                                    display: 'block',
                                  }}
                                />
                              ) : (
                                /* Imagen — pantalla completa nativa al hacer clic */
                                <img
                                  src={msg.url_imagen_mensaje}
                                  alt="evidencia"
                                  className={styles.chatImg}
                                  onClick={e => {
                                    if (e.currentTarget.requestFullscreen) {
                                      e.currentTarget.requestFullscreen()
                                    } else if (e.currentTarget.webkitRequestFullscreen) {
                                      e.currentTarget.webkitRequestFullscreen()
                                    }
                                  }}
                                />
                              )}
                              <div style={{
                                display: 'flex', justifyContent: 'flex-end',
                                padding: '2px 6px 2px',
                              }}>
                                <span style={{ fontSize: 10, color: '#8aa0b8', fontFamily: 'DM Sans, sans-serif' }}>
                                  {fmtHora(msg.fecha_mensaje)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Burbuja de texto */
                            <div style={{
                              background: esMio ? '#d1e4f7' : '#ffffff',
                              borderRadius: esMio ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                              padding: '7px 10px 5px 10px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.13)',
                              minWidth: 60,
                            }}>
                              <p style={{
                                margin: 0, fontFamily: 'DM Sans, sans-serif',
                                fontSize: 14, color: '#0f1e33',
                                wordBreak: 'break-word', lineHeight: 1.45,
                              }}>
                                {msg.texto_mensaje}
                              </p>
                              <p style={{
                                margin: '3px 0 0', textAlign: 'right',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 10, color: '#8aa0b8',
                              }}>
                                {fmtHora(msg.fecha_mensaje)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}

              </div>

              {/* Input */}
              {esCerrado ? (
                <div style={{
                  padding: '10px 16px',
                  background: '#f4f6f9',
                  borderTop: '1px solid #e8edf5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: '#8aa0b8',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Ticket cerrado — solo lectura
                </div>
              ) : (
                <div className={styles.chatInput}>
                  <input
                    type="text"
                    className={styles.chatTextInput}
                    placeholder="Escribe un mensaje..."
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={handleKey}
                  />
                  {inputVal.trim() ? (
                    <button className={styles.chatSendBtn} onClick={sendText}>
                      <SendIcon />
                    </button>
                  ) : (
                    <>
                      <button className={styles.chatSendBtn} title="Enviar imagen"
                        onClick={() => fileRef.current?.click()}>
                        <ImageIcon />
                      </button>
                      <button className={styles.chatSendBtn} title="Enviar video"
                        onClick={() => videoRef.current?.click()}>
                        <VideoIcon />
                      </button>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*"
                    style={{ display: 'none' }} onChange={handleImage} />
                  <input ref={videoRef} type="file" accept="video/*"
                    style={{ display: 'none' }} onChange={handleVideo} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
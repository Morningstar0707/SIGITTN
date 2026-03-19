import { useState } from 'react'
import styles from './LoginPage.module.css'
import logoImg from '../assets/logo.jpg'
import { resetPassword } from '../api'

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

export default function SolicitarReset({ onVolver }) {
  const [nombre,  setNombre]  = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error,   setError]   = useState('')
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) { setError('Ingresa tu nombre de usuario.'); return }
    if (!email.trim())  { setError('Ingresa tu correo electrónico.'); return }

    setLoading(true)
    try {
      await resetPassword.solicitar(nombre.trim(), email.trim())
      setEnviado(true)
    } catch {
      // Mostrar éxito igual (no revelar si el usuario existe)
      setEnviado(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.card} style={{ maxWidth: 480, minHeight: 'unset' }}>
        <div className={styles.rightPanel} style={{ flex: 1, padding: '44px 40px' }}>
          <div className={styles.formContainer}>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <img src={logoImg} alt="SIGITTN" style={{ width: 120, height: 'auto' }} />
            </div>

            {!enviado ? (
              <>
                <h1 className={styles.formTitle} style={{ fontSize: 22, marginBottom: 8 }}>
                  Recuperar contraseña
                </h1>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13.5,
                  color: '#5a7a96', textAlign: 'center', marginBottom: 28, lineHeight: 1.5,
                }}>
                  Ingresa tu nombre de usuario y tu correo. Te enviaremos un enlace para crear una nueva contraseña.
                </p>

                <form onSubmit={handleSubmit} className={styles.form} noValidate>

                  {/* Nombre de usuario */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="nombre">Nombre de usuario</label>
                    <div className={`${styles.inputWrapper} ${focused === 'nombre' ? styles.focused : ''}`}>
                      <input
                        id="nombre"
                        type="text"
                        className={styles.input}
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        onFocus={() => setFocused('nombre')}
                        onBlur={() => setFocused(null)}
                        placeholder="Ej: Henry Barón"
                        autoComplete="username"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Correo */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="email">Correo electrónico</label>
                    <div className={`${styles.inputWrapper} ${focused === 'email' ? styles.focused : ''}`}>
                      <input
                        id="email"
                        type="email"
                        className={styles.input}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        placeholder="tucorreo@ejemplo.com"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && <div className={styles.errorMsg} role="alert">{error}</div>}

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'Enviar enlace'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: '#16a34a',
                }}>
                  <MailIcon />
                </div>
                <h2 style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: 20,
                  fontWeight: 600, color: '#ffffff', marginBottom: 12,
                }}>
                  ¡Revisa tu correo!
                </h2>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13.5,
                  color: '#5a7a96', lineHeight: 1.6, marginBottom: 28,
                }}>
                  Si los datos son correctos, recibirás el enlace en los próximos minutos.
                  <br /><br />
                  El enlace expira en <strong style={{ color: '#8fb3d6' }}>1 hora</strong>.
                </p>
              </div>
            )}

            <button
              onClick={onVolver}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#5a7a96', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                margin: '20px auto 0', padding: '6px 10px', borderRadius: 8,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#8fb3d6'}
              onMouseLeave={e => e.currentTarget.style.color = '#5a7a96'}
            >
              <BackIcon /> Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>

      <p className={styles.footer}>
        © {new Date().getFullYear()} El Terminal Neiva · SIGITTN v1.0
      </p>
    </div>
  )
}

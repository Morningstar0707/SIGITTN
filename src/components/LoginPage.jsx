import { useState } from 'react'
import styles from './LoginPage.module.css'
import logoImg from '../assets/logo.jpg'

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('Leidy Toledo')
  const [password, setPassword] = useState('leidyTo12343')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    // Simulate auth — replace with real logic
    if (onLogin) onLogin({ username, role: 'Administrador' })
  }

  return (
    <div className={styles.wrapper}>
      {/* Background decorations */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.card}>
        {/* LEFT PANEL */}
        <div className={styles.leftPanel}>
          <div className={styles.logoSection}>
            <img
              src={logoImg}
              alt="El Terminal Neiva"
              className={styles.logoImg}
            />
          </div>
          <div className={styles.welcomeSection}>
            <h2 className={styles.welcomeTitle}>¡Bienvenido a SIGITTN!</h2>
            <p className={styles.welcomeDesc}>Sistema de Gestión de Infraestructura TTN</p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className={styles.divider} />

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Iniciar sesión</h1>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="username">
                  Usuario
                </label>
                <div className={`${styles.inputWrapper} ${focusedField === 'username' ? styles.focused : ''}`}>
                  <input
                    id="username"
                    type="text"
                    className={styles.input}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ingresa tu usuario"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="password">
                  Contraseña
                </label>
                <div className={`${styles.inputWrapper} ${focusedField === 'password' ? styles.focused : ''}`}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorMsg} role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <p className={styles.footer}>
        © {new Date().getFullYear()} El Terminal Neiva · SIGITTN v1.0 - <a href="https://github.com/Morningstar0707/SIGITTN" target="_blank" rel="noopener noreferrer" className={styles.git}>GitHub/Morningstar0707</a>
      </p>
    </div>
  )
}

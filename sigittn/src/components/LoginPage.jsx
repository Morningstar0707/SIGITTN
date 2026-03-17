/**
 * FRONTEND — LoginPage.jsx actualizado
 * Cambios vs original:
 *  - Ya no importa USERS_DB (todo va al backend)
 *  - Llama a auth.login() del cliente API
 *  - Sin credenciales precargadas en el form
 */
import { useState } from 'react'
import styles from './LoginPage.module.css'
import logoImg from '../assets/logo.jpg'
import { auth } from '../api'

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function LoginPage({ onLogin }) {
  const [nombre, setNombre]           = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim() || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      const usuario = await auth.login(nombre.trim(), password)
      onLogin(usuario)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.card}>
        <div className={styles.leftPanel}>
          <div className={styles.logoSection}>
            <img src={logoImg} alt="El Terminal Neiva" className={styles.logoImg} />
          </div>
          <div className={styles.welcomeSection}>
            <h2 className={styles.welcomeTitle}>¡Bienvenido a SIGITTN!</h2>
            <p className={styles.welcomeDesc}>Sistema de Gestión de Infraestructura TTN</p>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <h1 className={styles.formTitle}>Iniciar sesión</h1>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="nombre">Usuario</label>
                <div className={`${styles.inputWrapper} ${focusedField === 'nombre' ? styles.focused : ''}`}>
                  <input
                    id="nombre"
                    type="text"
                    className={styles.input}
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onFocus={() => setFocusedField('nombre')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ingresa tu nombre de usuario"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="password">Contraseña</label>
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
                    disabled={loading}
                  />
                  <button type="button" className={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {error && <div className={styles.errorMsg} role="alert">{error}</div>}

              <button type="submit"
                className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <p className={styles.footer}>
        © {new Date().getFullYear()} El Terminal Neiva · SIGITTN v2.0 -{' '}
        <a href="https://github.com/Morningstar0707/SIGITTN" target="_blank"
          rel="noopener noreferrer" className={styles.git}>GitHub/Morningstar0707</a>
      </p>
    </div>
  )
}

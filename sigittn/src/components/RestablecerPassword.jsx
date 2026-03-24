/**
 * Pantalla: "Crear nueva contraseña"
 * Aparece cuando el usuario llega desde el enlace del email:
 *   http://localhost:5173/reset-password?token=abc123
 */
import { useState, useEffect } from 'react'
import styles from './LoginPage.module.css'
import logoImg from '../assets/logo.jpg'
import { resetPassword } from '../api'

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
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function RestablecerPassword({ token, onVolver }) {
  const [tokenValido,   setTokenValido]   = useState(null)  // null=cargando, true/false
  const [password,      setPassword]      = useState('')
  const [confirmar,     setConfirmar]     = useState('')
  const [showPass,      setShowPass]      = useState(false)
  const [showConf,      setShowConf]      = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [exito,         setExito]         = useState(false)
  const [error,         setError]         = useState('')
  const [focusedField,  setFocusedField]  = useState(null)

  // Validar token al montar
  useEffect(() => {
    if (!token) { setTokenValido(false); return }
    resetPassword.validarToken(token)
      .then(data => setTokenValido(data.valido))
      .catch(() => setTokenValido(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await resetPassword.restablecer(token, password)
      setExito(true)
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  // ── Cargando validación ──
  if (tokenValido === null) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0b1526',
        fontFamily: 'DM Sans, sans-serif', color: '#3a5070', fontSize: 14,
      }}>
        Verificando enlace...
      </div>
    )
  }

  // ── Token inválido o expirado ──
  if (!tokenValido) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.bgOrb1} /><div className={styles.bgOrb2} />
        <div className={styles.card} style={{ maxWidth: 420, minHeight: 'unset' }}>
          <div className={styles.rightPanel} style={{ flex: 1, padding: '44px 40px' }}>
            <div className={styles.formContainer} style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(224,92,92,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 28,
              }}>⚠️</div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#ffffff', fontSize: 20, marginBottom: 12 }}>
                Enlace inválido o expirado
              </h2>
              <p style={{ color: '#5a7a96', fontSize: 13.5, lineHeight: 1.6, marginBottom: 28 }}>
                Este enlace ya fue usado o han pasado más de 1 hora desde que fue generado.
                Solicita uno nuevo desde el login.
              </p>
              <button onClick={onVolver} className={styles.submitBtn}>
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.bgOrb1} /><div className={styles.bgOrb2} /><div className={styles.bgOrb3} />

      <div className={styles.card} style={{ maxWidth: 460, minHeight: 'unset' }}>
        <div className={styles.rightPanel} style={{ flex: 1, padding: '44px 40px' }}>
          <div className={styles.formContainer}>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <img src={logoImg} alt="SIGITTN" style={{ width: 120, height: 'auto', borderRadius: 16 }} />
            </div>

            {!exito ? (
              <>
                <h1 className={styles.formTitle} style={{ fontSize: 22, marginBottom: 8 }}>
                  Nueva contraseña
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, color: '#5a7a96', textAlign: 'center', marginBottom: 28 }}>
                  Crea una contraseña segura para tu cuenta.
                </p>

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  {/* Nueva contraseña */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="password">Nueva contraseña</label>
                    <div className={`${styles.inputWrapper} ${focusedField === 'pass' ? styles.focused : ''}`}>
                      <input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        className={styles.input}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('pass')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Mínimo 6 caracteres"
                        disabled={loading}
                      />
                      <button type="button" className={styles.eyeBtn}
                        onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                        <EyeIcon open={showPass} />
                      </button>
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="confirmar">Confirmar contraseña</label>
                    <div className={`${styles.inputWrapper} ${focusedField === 'conf' ? styles.focused : ''}`}>
                      <input
                        id="confirmar"
                        type={showConf ? 'text' : 'password'}
                        className={styles.input}
                        value={confirmar}
                        onChange={e => setConfirmar(e.target.value)}
                        onFocus={() => setFocusedField('conf')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Repite la contraseña"
                        disabled={loading}
                      />
                      <button type="button" className={styles.eyeBtn}
                        onClick={() => setShowConf(v => !v)} tabIndex={-1}>
                        <EyeIcon open={showConf} />
                      </button>
                    </div>
                    {/* Indicador de coincidencia */}
                    {confirmar && (
                      <span style={{
                        fontSize: 12, marginTop: 4,
                        color: password === confirmar ? '#16a34a' : '#e05c5c',
                      }}>
                        {password === confirmar ? '✓ Las contraseñas coinciden' : '✗ No coinciden'}
                      </span>
                    )}
                  </div>

                  {error && <div className={styles.errorMsg} role="alert">{error}</div>}

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'Guardar nueva contraseña'}
                  </button>
                </form>
              </>
            ) : (
              /* Éxito */
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: '#16a34a',
                }}>
                  <CheckIcon />
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#ffffff', fontSize: 20, marginBottom: 12 }}>
                  ¡Contraseña actualizada!
                </h2>
                <p style={{ color: '#5a7a96', fontSize: 13.5, lineHeight: 1.6, marginBottom: 28 }}>
                  Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <button onClick={onVolver} className={styles.submitBtn}>
                  Ir al inicio de sesión
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

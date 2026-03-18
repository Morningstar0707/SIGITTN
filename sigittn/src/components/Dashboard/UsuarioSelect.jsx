/**
 * UsuarioSelect — combobox con búsqueda en tiempo real para seleccionar usuario responsable
 *
 * Props:
 *   usuarios   — array de { id_usuario, nombre_usuario, nombre_dependencia?, nombre_rol? }
 *   value      — id seleccionado (string o number)
 *   onChange   — fn(id)
 *   placeholder — texto cuando no hay selección
 *   disabled   — bool
 */
import { useState, useRef, useEffect } from 'react'

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const ClearIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function UsuarioSelect({
  usuarios = [],
  value,
  onChange,
  placeholder = 'Seleccionar usuario',
  disabled = false,
}) {
  const [abierto,   setAbierto]   = useState(false)
  const [busqueda,  setBusqueda]  = useState('')
  const [resaltado, setResaltado] = useState(-1)
  const inputRef   = useRef(null)
  const listaRef   = useRef(null)
  const wrapperRef = useRef(null)

  const seleccionado = usuarios.find(u => String(u.id_usuario) === String(value))

  const filtrados = busqueda.trim()
    ? usuarios.filter(u =>
        u.nombre_usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.nombre_dependencia || '').toLowerCase().includes(busqueda.toLowerCase())
      )
    : usuarios

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false)
        setBusqueda('')
        setResaltado(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll automático al ítem resaltado
  useEffect(() => {
    if (resaltado >= 0 && listaRef.current) {
      listaRef.current.children[resaltado]?.scrollIntoView({ block: 'nearest' })
    }
  }, [resaltado])

  const abrir = () => {
    if (disabled) return
    setAbierto(true)
    setBusqueda('')
    setResaltado(-1)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const seleccionar = (usuario) => {
    onChange(String(usuario.id_usuario))
    setAbierto(false)
    setBusqueda('')
    setResaltado(-1)
  }

  const limpiar = (e) => {
    e.stopPropagation()
    onChange('')
    setBusqueda('')
  }

  const handleKeyDown = (e) => {
    if (!abierto) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setResaltado(r => Math.min(r + 1, filtrados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setResaltado(r => Math.max(r - 1, 0))
    } else if (e.key === 'Enter' && resaltado >= 0) {
      e.preventDefault()
      seleccionar(filtrados[resaltado])
    } else if (e.key === 'Escape') {
      setAbierto(false)
      setBusqueda('')
    }
  }

  const resaltarTexto = (texto, query) => {
    if (!query.trim()) return texto
    const idx = texto.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return texto
    return (
      <>
        {texto.slice(0, idx)}
        <strong style={{ color: '#1e6fc5', fontWeight: 700 }}>
          {texto.slice(idx, idx + query.length)}
        </strong>
        {texto.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Botón principal */}
      <button
        type="button"
        onClick={abrir}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '9px 32px 9px 12px',
          background: '#ffffff',
          border: `1.5px solid ${abierto ? '#1e6fc5' : '#d0dae8'}`,
          borderRadius: 9,
          textAlign: 'left',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          color: seleccionado ? '#0f1e33' : '#b0bfce',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: abierto ? '0 0 0 3px rgba(30,111,197,0.12)' : 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          position: 'relative',
        }}
      >
        {seleccionado ? seleccionado.nombre_usuario : placeholder}
        <span style={{
          position: 'absolute', right: 10, top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', color: '#7a90a8',
        }}>
          {seleccionado && !disabled
            ? <span onMouseDown={limpiar} style={{ cursor: 'pointer', padding: 2 }}><ClearIcon /></span>
            : <ChevronDown />
          }
        </span>
      </button>

      {/* Dropdown */}
      {abierto && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0, right: 0,
          background: '#ffffff',
          border: '1.5px solid #d0dae8',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 200,
          overflow: 'hidden',
        }}>
          {/* Buscador */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            borderBottom: '1px solid #e8edf5',
            background: '#f8f9fb',
          }}>
            <span style={{ color: '#8a9ab0', flexShrink: 0 }}><SearchIcon /></span>
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setResaltado(0) }}
              onKeyDown={handleKeyDown}
              placeholder="Buscar por nombre o dependencia..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                color: '#0f1e33', background: 'transparent',
              }}
            />
            {busqueda && (
              <button type="button"
                onClick={() => { setBusqueda(''); setResaltado(-1); inputRef.current?.focus() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab0', padding: 2 }}>
                <ClearIcon />
              </button>
            )}
          </div>

          {/* Opción "Sin asignar" */}
          <div
            onMouseDown={() => { onChange(''); setAbierto(false); setBusqueda('') }}
            style={{
              padding: '8px 14px',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13,
              color: '#8a9ab0', cursor: 'pointer',
              borderBottom: '1px solid #f0f3f8',
              background: !value ? '#f0f4ff' : 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
            onMouseLeave={e => e.currentTarget.style.background = !value ? '#f0f4ff' : 'transparent'}
          >
            Sin asignar
          </div>

          {/* Lista de usuarios */}
          <ul ref={listaRef} style={{
            listStyle: 'none', margin: 0, padding: '4px 0',
            maxHeight: 200, overflowY: 'auto',
          }}>
            {filtrados.length === 0 ? (
              <li style={{
                padding: '12px 16px', fontFamily: 'DM Sans, sans-serif',
                fontSize: 13, color: '#8a9ab0', textAlign: 'center',
              }}>
                No se encontraron usuarios
              </li>
            ) : (
              filtrados.map((u, i) => {
                const esSeleccionado = String(u.id_usuario) === String(value)
                const esResaltado    = i === resaltado
                return (
                  <li
                    key={u.id_usuario}
                    onMouseDown={() => seleccionar(u)}
                    onMouseEnter={() => setResaltado(i)}
                    style={{
                      padding: '8px 14px',
                      cursor: 'pointer',
                      background: esResaltado ? '#f0f4ff' : esSeleccionado ? '#e8f0fb' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: esSeleccionado ? 'rgba(30,111,197,0.12)' : '#f0f3f8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: esSeleccionado ? '#1e6fc5' : '#7a90a8',
                      flexShrink: 0,
                    }}>
                      <UserIcon />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                        fontWeight: esSeleccionado ? 600 : 400,
                        color: esSeleccionado ? '#1e6fc5' : '#0f1e33',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {resaltarTexto(u.nombre_usuario, busqueda)}
                      </div>
                      {u.nombre_dependencia && (
                        <div style={{
                          fontFamily: 'DM Sans, sans-serif', fontSize: 11.5,
                          color: '#8a9ab0', marginTop: 1,
                        }}>
                          {resaltarTexto(u.nombre_dependencia, busqueda)}
                        </div>
                      )}
                    </div>

                    {esSeleccionado && (
                      <span style={{ color: '#1e6fc5', fontSize: 11, flexShrink: 0 }}>✓</span>
                    )}
                  </li>
                )
              })
            )}
          </ul>

          {/* Contador */}
          {busqueda && filtrados.length > 0 && (
            <div style={{
              padding: '6px 14px',
              borderTop: '1px solid #e8edf5',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 11.5, color: '#8a9ab0',
              background: '#f8f9fb',
            }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

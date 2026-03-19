/**
 * SIGITTN — Cliente API (src/api.js en el frontend React)
 * Campos alineados al MER: id_usuario, nombre_rol, id_modulo_origen, etc.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken()        { return localStorage.getItem('sigittn_token') }
function setToken(token)   { localStorage.setItem('sigittn_token', token) }
function removeToken()     {
  localStorage.removeItem('sigittn_token')
  localStorage.removeItem('sigittn_usuario')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    removeToken()
    window.dispatchEvent(new Event('sigittn:logout'))
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

// AUTH
export const auth = {
  async login(nombre_usuario, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nombre_usuario, password }),
    })
    setToken(data.token)
    localStorage.setItem('sigittn_usuario', JSON.stringify(data.usuario))
    return data.usuario
  },
  logout() { removeToken() },
  getUsuarioLocal() {
    try { return JSON.parse(localStorage.getItem('sigittn_usuario')) }
    catch { return null }
  },
  async me() {
    const data = await request('/auth/me')
    return data.usuario
  },
}

// CATALOGOS
export const catalogos = {
  obtener() { return request('/catalogos') },
}

// USUARIOS (solo admin)
export const usuarios = {
  listar()        { return request('/usuarios') },
  buscar(q)       { return request(`/usuarios/buscar?q=${encodeURIComponent(q)}`) },
  crear(datos)    { return request('/usuarios', { method: 'POST', body: JSON.stringify(datos) }) },
  actualizar(id, datos) {
    return request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
  },
}

// TICKETS
export const tickets = {
  listar({ id_modulo_origen, estados, page = 1, limit = 9 } = {}) {
    const p = new URLSearchParams()
    if (id_modulo_origen)          p.set('id_modulo_origen', id_modulo_origen)
    if (estados && estados.length) p.set('estados', estados.join(','))
    p.set('page', page)
    p.set('limit', limit)
    return request(`/tickets?${p}`)
  },
  obtener(id)       { return request(`/tickets/${id}`) },
  crear(datos)      { return request('/tickets', { method: 'POST', body: JSON.stringify(datos) }) },
  actualizar(id, datos) {
    return request(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
  },
  cambiarEstado(id, id_estado) {
    return request(`/tickets/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ id_estado }) })
  },
}

// MENSAJES NO LEÍDOS
export const notificaciones = {
  noLeidos() { return request('/mensajes/no-leidos') },
  marcarTodosLeidos(ticketId) {
    return request(`/tickets/${ticketId}/mensajes/leidos`, { method: 'PATCH' })
  },
}

// MENSAJES
export const mensajes = {
  listar(ticketId) { return request(`/tickets/${ticketId}/mensajes`) },
  enviarTexto(ticketId, texto_mensaje) {
    return request(`/tickets/${ticketId}/mensajes`, {
      method: 'POST', body: JSON.stringify({ texto_mensaje }),
    })
  },
  enviarImagen(ticketId, url_imagen_mensaje) {
    return request(`/tickets/${ticketId}/mensajes`, {
      method: 'POST', body: JSON.stringify({ url_imagen_mensaje }),
    })
  },
  marcarLeido(ticketId, idMensaje) {
    return request(`/tickets/${ticketId}/mensajes/${idMensaje}/leido`, { method: 'PATCH' })
  },
}
// RESET DE CONTRASEÑA (públicos — no requieren token)
export const resetPassword = {
  solicitar(nombre_usuario, email) {
    return request('/auth/solicitar-reset', {
      method: 'POST',
      body: JSON.stringify({ nombre_usuario, email }),
    })
  },
  validarToken(token) {
    return request(`/auth/validar-token?token=${encodeURIComponent(token)}`)
  },
  restablecer(token, nueva_password) {
    return request('/auth/restablecer-password', {
      method: 'POST',
      body: JSON.stringify({ token, nueva_password }),
    })
  },
}
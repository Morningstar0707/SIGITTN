import { Router } from 'express'
import { login, me }                                                        from '../controllers/authController.js'
import { buscarUsuarios, listarUsuarios, crearUsuario, actualizarUsuario }  from '../controllers/usuariosController.js'
import { listarTickets, obtenerTicket, crearTicket, actualizarTicket, cambiarEstado } from '../controllers/ticketsController.js'
import { listarMensajes, crearMensaje, marcarLeido }                        from '../controllers/mensajesController.js'
import { obtenerCatalogos }                                                 from '../controllers/catalogosController.js'
import { verificarToken, soloAdmin }                                        from '../middleware/auth.js'

const router = Router()

// AUTH
router.post('/auth/login', login)
router.get('/auth/me',     verificarToken, me)

// CATÁLOGOS
router.get('/catalogos', verificarToken, obtenerCatalogos)

// USUARIOS (solo admin)
router.get('/usuarios/buscar', verificarToken, soloAdmin, buscarUsuarios)  // ← búsqueda por nombre
router.get('/usuarios',        verificarToken, soloAdmin, listarUsuarios)
router.post('/usuarios',       verificarToken, soloAdmin, crearUsuario)
router.put('/usuarios/:id',    verificarToken, soloAdmin, actualizarUsuario)

// TICKETS
router.get('/tickets',              verificarToken, listarTickets)
router.get('/tickets/:id',          verificarToken, obtenerTicket)
router.post('/tickets',             verificarToken, crearTicket)
router.put('/tickets/:id',          verificarToken, actualizarTicket)
router.patch('/tickets/:id/estado', verificarToken, cambiarEstado)

// MENSAJES
router.get('/tickets/:id/mensajes',                    verificarToken, listarMensajes)
router.post('/tickets/:id/mensajes',                   verificarToken, crearMensaje)
router.patch('/tickets/:id/mensajes/:idMensaje/leido', verificarToken, marcarLeido)

export default router
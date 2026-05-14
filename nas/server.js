/**
 * SIGITTN NAS — API de subida de archivos
 * Escucha solo en localhost (127.0.0.1) — nginx hace de proxy inverso.
 *
 * Rutas:
 *   POST /upload  — sube un archivo (requiere header x-upload-secret)
 *   GET  /health  — estado del servicio
 */
import express    from 'express'
import multer     from 'multer'
import path       from 'path'
import crypto     from 'crypto'
import { existsSync, mkdirSync } from 'fs'

const app  = express()
const PORT = parseInt(process.env.PORT || '9090')

// ── Validaciones de arranque ───────────────────────────────────────
if (!process.env.UPLOAD_SECRET) {
  console.error('❌  UPLOAD_SECRET no está definido en .env — abortando.')
  process.exit(1)
}
if (!process.env.NAS_PUBLIC_URL) {
  console.error('❌  NAS_PUBLIC_URL no está definido en .env — abortando.')
  process.exit(1)
}

const STORAGE_ROOT  = process.env.STORAGE_ROOT  || '/srv/nas/sigittn'
const UPLOAD_SECRET = process.env.UPLOAD_SECRET
const NAS_PUBLIC_URL = process.env.NAS_PUBLIC_URL.replace(/\/$/, '') // sin barra final

// ── Multer — disk storage ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const isVideo = file.mimetype.startsWith('video/')
    const dir     = path.join(STORAGE_ROOT, isVideo ? 'videos' : 'mensajes')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename(req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },   // 50 MB máximo
  fileFilter(req, file, cb) {
    const permitidos = /\.(jpe?g|png|gif|webp|mp4|webm|mov)$/i
    if (permitidos.test(path.extname(file.originalname))) return cb(null, true)
    cb(new Error('Tipo de archivo no permitido'))
  },
})

// ── Middleware de autenticación ────────────────────────────────────
function autenticar(req, res, next) {
  const secret = req.headers['x-upload-secret']
  if (!secret || secret !== UPLOAD_SECRET) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  next()
}

// ── POST /upload ───────────────────────────────────────────────────
app.post('/upload', autenticar, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' })
  }

  const subdir = req.file.mimetype.startsWith('video/') ? 'videos' : 'mensajes'
  const url    = `${NAS_PUBLIC_URL}/${subdir}/${req.file.filename}`

  console.log(`✅  Archivo guardado: ${req.file.filename} (${req.file.size} bytes)`)
  return res.json({ url, filename: req.file.filename, size: req.file.size })
})

// ── Manejo de errores de multer ────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err instanceof multer.MulterError || err.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({ error: err.message })
  }
  console.error('Error no controlado:', err)
  return res.status(500).json({ error: 'Error interno del servidor' })
})

// ── GET /health ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// ── Arranque — solo escucha en localhost ───────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🗄️  SIGITTN NAS Upload API`)
  console.log(`   Puerto  : ${PORT} (solo localhost — nginx hace proxy)`)
  console.log(`   Storage : ${STORAGE_ROOT}`)
  console.log(`   URL pública: ${NAS_PUBLIC_URL}\n`)
})

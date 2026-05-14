/**
 * SIGITTN — uploadController.js
 *
 * Recibe un archivo del frontend (multipart/form-data),
 * lo guarda en disco y devuelve la URL pública.
 *
 * POST /api/upload
 *   Header: Authorization: Bearer <jwt>
 *   Body:   FormData con campo "file"
 *
 * Variables de entorno:
 *   STORAGE_ROOT     — ruta local donde guardar archivos
 *                      (default: /srv/sigittn/archivos)
 *   FILES_PUBLIC_URL — URL base pública de los archivos
 *                      (ej: https://mi-tunel.trycloudflare.com/uploads)
 */
import multer from 'multer'
import path   from 'path'
import fs     from 'fs'
import crypto from 'crypto'

const STORAGE_ROOT   = process.env.STORAGE_ROOT    || '/srv/sigittn/archivos'
const FILES_PUBLIC_URL = (process.env.FILES_PUBLIC_URL || 'http://localhost/uploads').replace(/\/$/, '')

// Crear directorios si no existen
for (const subdir of ['mensajes', 'videos']) {
  const dir = path.join(STORAGE_ROOT, subdir)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(_req, file, cb) {
    const subdir = file.mimetype.startsWith('video/') ? 'videos' : 'mensajes'
    cb(null, path.join(STORAGE_ROOT, subdir))
  },
  filename(_req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const permitidos = /\.(jpe?g|png|gif|webp|mp4|webm|mov)$/i
    if (permitidos.test(file.originalname)) return cb(null, true)
    cb(new Error('Tipo de archivo no permitido'))
  },
})

export const uploadMiddleware = upload.single('file')

// ── Controlador principal ──────────────────────────────────────────
export async function subirArchivo(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' })
  }

  try {
    const subdir = req.file.mimetype.startsWith('video/') ? 'videos' : 'mensajes'
    const url    = `${FILES_PUBLIC_URL}/${subdir}/${req.file.filename}`
    return res.json({ url })
  } catch (err) {
    console.error('Error al guardar archivo:', err.message)
    return res.status(500).json({ error: 'Error interno al guardar el archivo.' })
  }
}

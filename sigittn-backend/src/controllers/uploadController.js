/**
 * SIGITTN — uploadController.js
 *
 * Recibe un archivo del frontend (multipart/form-data),
 * lo reenvía al NAS y devuelve la URL pública del archivo.
 *
 * POST /api/upload
 *   Header: Authorization: Bearer <jwt>
 *   Body:   FormData con campo "file"
 *
 * Variables de entorno requeridas:
 *   NAS_URL           — URL base del NAS (ej: https://nas.tudominio.com)
 *   NAS_UPLOAD_SECRET — clave secreta compartida con el NAS
 */
import multer from 'multer'

// ── Multer: memoria — el archivo vive solo durante el request ──────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 },   // 50 MB
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

  const nasUrl    = process.env.NAS_URL?.replace(/\/$/, '')
  const nasSecret = process.env.NAS_UPLOAD_SECRET

  if (!nasUrl || !nasSecret) {
    return res.status(503).json({
      error: 'El servidor NAS no está configurado. Contacta al administrador.',
    })
  }

  try {
    // Reenviar el archivo al NAS como multipart/form-data
    const form = new FormData()
    form.append(
      'file',
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname,
    )

    const resp = await fetch(`${nasUrl}/upload`, {
      method:  'POST',
      headers: { 'x-upload-secret': nasSecret },
      body:    form,
    })

    const data = await resp.json()

    if (!resp.ok) {
      console.error('NAS respondió con error:', resp.status, data)
      throw new Error(data.error || `Error del NAS: ${resp.status}`)
    }

    return res.json({ url: data.url })
  } catch (err) {
    console.error('Error al comunicarse con el NAS:', err.message)
    return res.status(502).json({
      error: 'No se pudo contactar el servidor de almacenamiento. Intenta de nuevo.',
    })
  }
}

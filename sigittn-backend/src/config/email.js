import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Transportador de correo configurable por SMTP.
 * Soporta Gmail, Hotmail/Outlook, y cualquier proveedor.
 *
 * Variables requeridas en .env:
 *   EMAIL_HOST   — servidor SMTP del proveedor
 *   EMAIL_PORT   — puerto SMTP (opcional, por defecto 587)
 *   EMAIL_SECURE — true solo si el puerto es 465 (opcional)
 *   EMAIL_USER   — tu dirección de correo completa
 *   EMAIL_PASS   — contraseña o contraseña de aplicación
 *
 * Ejemplos de configuración en .env:
 *
 *  Gmail:
 *    EMAIL_HOST=smtp.gmail.com
 *    EMAIL_PORT=587
 *    EMAIL_USER=tucorreo@gmail.com
 *    EMAIL_PASS=xxxx xxxx xxxx xxxx   ← contraseña de aplicación de Google
 *
 *  Hotmail / Outlook personal:
 *    EMAIL_HOST=smtp.live.com
 *    EMAIL_PORT=587
 *    EMAIL_USER=tucorreo@hotmail.com
 *    EMAIL_PASS=tu_contraseña
 *
 *  Outlook / Microsoft 365 empresarial:
 *    EMAIL_HOST=smtp.office365.com
 *    EMAIL_PORT=587
 *    EMAIL_USER=tucorreo@outlook.com
 *    EMAIL_PASS=tu_contraseña
 */
function crearTransporter() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })
}

/**
 * Envía el correo de restablecimiento de contraseña.
 * @param {string} destinatario  - email del usuario
 * @param {string} nombreUsuario - nombre para el saludo
 * @param {string} token         - token de 64 chars
 */
export async function enviarEmailReset(destinatario, nombreUsuario, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const enlace = `${frontendUrl}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f4f6f9;margin:0;padding:20px">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08)">
        
        <!-- Header -->
        <div style="background:#0b1526;padding:28px 32px">
          <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600">
            SIGITTN — Terminal de Transporte de Neiva
          </h1>
          <p style="color:#5a7a96;margin:6px 0 0;font-size:13px">
            Sistema de Gestión de Infraestructura
          </p>
        </div>

        <!-- Body -->
        <div style="padding:32px">
          <p style="color:#1a2a3a;font-size:15px;margin:0 0 12px">
            Hola, <strong>${nombreUsuario}</strong>
          </p>
          <p style="color:#4a5e78;font-size:14px;line-height:1.6;margin:0 0 24px">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en SIGITTN.
            Haz clic en el botón de abajo para crear una nueva contraseña.
          </p>

          <!-- Botón -->
          <div style="text-align:center;margin:28px 0">
            <a href="${enlace}"
               style="display:inline-block;background:#0b1526;color:#ffffff;padding:13px 32px;
                      border-radius:30px;text-decoration:none;font-size:15px;font-weight:600;
                      letter-spacing:0.2px">
              Restablecer contraseña
            </a>
          </div>

          <!-- Aviso expiración -->
          <div style="background:#fff8f5;border:1px solid #fddccc;border-radius:8px;padding:12px 16px;margin:20px 0">
            <p style="color:#c45a20;font-size:13px;margin:0">
              ⏰ Este enlace es válido por <strong>1 hora</strong> y solo puede usarse una vez.
            </p>
          </div>

          <p style="color:#6b7f97;font-size:13px;line-height:1.6;margin:20px 0 0">
            Si no solicitaste este cambio, puedes ignorar este correo.
            Tu contraseña no cambiará hasta que hagas clic en el enlace.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f4f6f9;padding:16px 32px;border-top:1px solid #e8edf5">
          <p style="color:#8a9ab0;font-size:12px;margin:0">
            Terminal de Transporte de Neiva · SIGITTN v1.0
          </p>
          <p style="color:#b0bfce;font-size:11px;margin:4px 0 0">
            Si el botón no funciona, copia este enlace en tu navegador:<br>
            <a href="${enlace}" style="color:#1e6fc5;font-size:11px">${enlace}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const transporter = crearTransporter()
  await transporter.sendMail({
    from: `"SIGITTN - Terminal Neiva" <${process.env.EMAIL_USER}>`,
    to:   destinatario,
    subject: 'Restablecer contraseña — SIGITTN',
    html,
  })
}
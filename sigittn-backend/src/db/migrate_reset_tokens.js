/**
 * SIGITTN — Migración: tabla password_reset_tokens
 * Ejecutar una sola vez: npm run db:migrate
 *
 * El email NO se guarda en Usuarios.
 * Solo se usa para enviar el correo y se almacena en el token temporalmente.
 */
import pool from '../config/db.js'

const sql = `
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          SERIAL PRIMARY KEY,
  id_usuario  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  token       VARCHAR(64) NOT NULL UNIQUE,
  expira_en   TIMESTAMPTZ NOT NULL,
  usado       BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_token   ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_usuario ON password_reset_tokens(id_usuario);
`

async function run() {
  const client = await pool.connect()
  try {
    await client.query(sql)
    console.log('✅ Tabla password_reset_tokens creada correctamente.')
    console.log('   (El email NO se guarda en Usuarios — se pide al momento de recuperar contraseña)')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()

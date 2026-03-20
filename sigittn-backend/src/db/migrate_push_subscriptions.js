/**
 * SIGITTN — Migración: tabla push_subscriptions
 * Ejecutar: node src/db/migrate_push_subscriptions.js
 */
import pool from '../config/db.js'

const sql = `
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          SERIAL PRIMARY KEY,
    id_usuario  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    endpoint    TEXT    NOT NULL UNIQUE,
    p256dh      TEXT    NOT NULL,
    auth        TEXT    NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_push_usuario ON push_subscriptions(id_usuario);
`

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query(sql)
    console.log('✅  Tabla push_subscriptions creada correctamente.')
  } catch (err) {
    console.error('❌  Error en migración push:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()

/**
 * Migración: tabla ticket_ultimo_visto
 * Reemplaza el campo leido_mensaje (global) por un registro por usuario.
 * Ejecutar: node src/db/migrate_ultimo_visto.js
 */
import pool from '../config/db.js'

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('\n🔄  Creando tabla ticket_ultimo_visto...\n')
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_ultimo_visto (
        id_ticket   INTEGER NOT NULL REFERENCES Tickets(id_ticket) ON DELETE CASCADE,
        id_usuario  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
        visto_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (id_ticket, id_usuario)
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ultimo_visto_usuario
        ON ticket_ultimo_visto(id_usuario)
    `)

    await client.query('COMMIT')
    console.log('✅  Tabla ticket_ultimo_visto creada.\n')
    console.log('   Cada usuario tiene su propio registro de lectura por ticket.')
    console.log('   Ejecuta también la migración de id_usuario en mensajes si aún no lo hiciste:\n')
    console.log('   node src/db/migrate_mensajes_usuario.js\n')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌  Error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()

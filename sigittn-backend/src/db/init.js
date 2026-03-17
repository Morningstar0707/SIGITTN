/**
 * SIGITTN — Inicialización de base de datos
 * Modelo basado en el MER oficial del proyecto.
 * Ejecutar una sola vez: npm run db:init
 */
import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

// ─────────────────────────────────────────────────────────────
//  SCHEMA — tablas en orden de dependencia (catálogos primero)
// ─────────────────────────────────────────────────────────────
const schema = `

-- 1. Roles
CREATE TABLE IF NOT EXISTS Roles (
  id_rol       SERIAL PRIMARY KEY,
  nombre_rol   VARCHAR(50) NOT NULL UNIQUE  -- 'admin' | 'usuario'
);

-- 2. Dependencias
CREATE TABLE IF NOT EXISTS Dependencias (
  id_dependencia     SERIAL PRIMARY KEY,
  nombre_dependencia VARCHAR(100) NOT NULL UNIQUE
);

-- 3. Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
  id_usuario       SERIAL PRIMARY KEY,
  nombre_usuario   VARCHAR(120) NOT NULL UNIQUE,
  password_usuario VARCHAR(255) NOT NULL,   -- bcrypt hash
  estado_usuario   VARCHAR(20)  NOT NULL DEFAULT 'activo'
                    CHECK (estado_usuario IN ('activo','inactivo')),
  id_rol           INTEGER NOT NULL REFERENCES Roles(id_rol),
  id_dependencia   INTEGER REFERENCES Dependencias(id_dependencia)
);

-- 4. Modulo_origen_tickets
CREATE TABLE IF NOT EXISTS Modulo_origen_tickets (
  id_modulo_origen     SERIAL PRIMARY KEY,
  nombre_modulo_origen VARCHAR(50) NOT NULL UNIQUE
);

-- 5. Nivel_urgencia_tickets
CREATE TABLE IF NOT EXISTS Nivel_urgencia_tickets (
  id_nivel_urgencia     SERIAL PRIMARY KEY,
  nombre_nivel_urgencia VARCHAR(50) NOT NULL UNIQUE
);

-- 6. Estados_Ticket
CREATE TABLE IF NOT EXISTS Estados_Ticket (
  id_estado     SERIAL PRIMARY KEY,
  nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

-- 7. Tickets
CREATE TABLE IF NOT EXISTS Tickets (
  id_ticket             SERIAL PRIMARY KEY,
  titulo_ticket         VARCHAR(200) NOT NULL,
  descripcion_ticket    TEXT         NOT NULL DEFAULT '',
  fecha_creacion_ticket TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  fecha_cierre_ticket   TIMESTAMPTZ,
  id_modulo_origen      INTEGER NOT NULL REFERENCES Modulo_origen_tickets(id_modulo_origen),
  id_nivel_urgencia     INTEGER NOT NULL REFERENCES Nivel_urgencia_tickets(id_nivel_urgencia),
  id_estado             INTEGER NOT NULL REFERENCES Estados_Ticket(id_estado),
  id_usuario_creador    INTEGER NOT NULL REFERENCES Usuarios(id_usuario),
  id_usuario_asignado   INTEGER      REFERENCES Usuarios(id_usuario)
);

-- 8. Mensaje_tickets
CREATE TABLE IF NOT EXISTS Mensaje_tickets (
  id_mensaje      SERIAL PRIMARY KEY,
  texto_mensaje   TEXT,
  url_imagen_mensaje TEXT,
  fecha_mensaje   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  leido_mensaje   BOOLEAN     NOT NULL DEFAULT FALSE,
  id_ticket       INTEGER     NOT NULL REFERENCES Tickets(id_ticket) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tickets_estado    ON Tickets(id_estado);
CREATE INDEX IF NOT EXISTS idx_tickets_modulo    ON Tickets(id_modulo_origen);
CREATE INDEX IF NOT EXISTS idx_tickets_creador   ON Tickets(id_usuario_creador);
CREATE INDEX IF NOT EXISTS idx_tickets_asignado  ON Tickets(id_usuario_asignado);
CREATE INDEX IF NOT EXISTS idx_tickets_fecha     ON Tickets(fecha_creacion_ticket DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_ticket   ON Mensaje_tickets(id_ticket);
`

// ─────────────────────────────────────────────────────────────
//  SEED — datos iniciales
// ─────────────────────────────────────────────────────────────
async function seed(client) {
  const { rows } = await client.query('SELECT COUNT(*) FROM Roles')
  if (parseInt(rows[0].count) > 0) {
    console.log('  ↳ Seed ya existe, omitiendo.')
    return
  }

  // Roles
  await client.query(`
    INSERT INTO Roles (nombre_rol) VALUES ('admin'), ('usuario')
  `)

  // Dependencias
  await client.query(`
    INSERT INTO Dependencias (nombre_dependencia) VALUES
      ('Administrativo'),
      ('Servicios Generales'),
      ('Operativo'),
      ('Mantenimiento'),
      ('Sistemas')
  `)

  // Usuarios (contraseñas hasheadas)
  const hash = (p) => bcrypt.hashSync(p, 10)
  await client.query(`
    INSERT INTO Usuarios (nombre_usuario, password_usuario, estado_usuario, id_rol, id_dependencia)
    VALUES
      ($1, $2, 'activo', 1, 1),
      ($3, $4, 'activo', 1, 1),
      ($5, $6, 'activo', 2, 2)
  `, [
    'Henry Barón',  hash('henryBaron123'),
    'Leidy Toledo', hash('leidyTo12343'),
    'Linda Cedeño', hash('linda2026'),
  ])

  // Módulos de origen
  await client.query(`
    INSERT INTO Modulo_origen_tickets (nombre_modulo_origen) VALUES
      ('C1'),('C2'),('C3'),('C4'),('C5'),('C6'),('C7'),('C8'),
      ('Unidad operativa')
  `)

  // Niveles de urgencia
  await client.query(`
    INSERT INTO Nivel_urgencia_tickets (nombre_nivel_urgencia) VALUES
      ('Planificado'),('Moderado'),('Alto'),('Inmediata')
  `)

  // Estados
  await client.query(`
    INSERT INTO Estados_Ticket (nombre_estado) VALUES
      ('Nuevo'),('Asignado'),('En progreso'),('Resuelto'),('Cerrado')
  `)

  // Tickets de ejemplo
  await client.query(`
    INSERT INTO Tickets
      (titulo_ticket, descripcion_ticket, id_modulo_origen, id_nivel_urgencia, id_estado, id_usuario_creador, id_usuario_asignado)
    VALUES
      ('Molinete dañado',     'El sensor del molinete no reconoce la tarjeta', 3, 2, 4, 3, 1),
      ('Fuga de agua',        'Fuga detectada en baño del módulo',             2, 4, 1, 3, NULL),
      ('Baldosa dañada',      'Baldosa rota en el pasillo principal',          1, 1, 2, 3, 1),
      ('Talanquera dañada',   'Talanquera no abre correctamente',              8, 3, 3, 3, 1),
      ('Fallo en biométrico', 'El lector biométrico no responde',              9, 3, 5, 2, 1)
  `)

  console.log('  ↳ Seed completado.')
}

async function init() {
  const client = await pool.connect()
  try {
    console.log('\n🗄️  Inicializando base de datos SIGITTN...\n')
    await client.query('BEGIN')
    await client.query(schema)
    console.log('✅  Tablas creadas:')
    console.log('    Roles, Dependencias, Usuarios')
    console.log('    Modulo_origen_tickets, Nivel_urgencia_tickets, Estados_Ticket')
    console.log('    Tickets, Mensaje_tickets')
    await seed(client)
    await client.query('COMMIT')

    console.log('\n✅  Base de datos lista.\n')
    console.log('Usuarios de prueba:')
    console.log('  Henry Barón   | rol: admin   | pwd: henryBaron123')
    console.log('  Leidy Toledo  | rol: admin   | pwd: leidyTo12343')
    console.log('  Linda Cedeño  | rol: usuario | pwd: linda2026')
    console.log()
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌  Error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

init()

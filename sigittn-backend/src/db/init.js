/**
 * SIGITTN — Inicialización COMPLETA de base de datos
 * ═══════════════════════════════════════════════════════════════
 * Modelo basado en el MER oficial del proyecto.
 * Incluye TODAS las tablas necesarias en un solo script.
 *
 * Ejecutar una sola vez: npm run db:init
 *
 * Tablas creadas (11 total):
 *   1. Roles
 *   2. Dependencias
 *   3. Usuarios
 *   4. Modulo_origen_tickets (52 módulos reales del Terminal)
 *   5. Nivel_urgencia_tickets
 *   6. Estados_Ticket
 *   7. Tickets
 *   8. Mensaje_tickets (con id_usuario para chat)
 *   9. password_reset_tokens (recuperación de contraseña)
 *  10. push_subscriptions (notificaciones push)
 *  11. ticket_ultimo_visto (mensajes no leídos por usuario)
 */
import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

// ─────────────────────────────────────────────────────────────
//  SCHEMA — tablas en orden de dependencia
// ─────────────────────────────────────────────────────────────
const schema = `

-- ═══════════════════════════════════════════════════════════
-- CATÁLOGOS (sin dependencias)
-- ═══════════════════════════════════════════════════════════

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

-- 3. Modulo_origen_tickets
CREATE TABLE IF NOT EXISTS Modulo_origen_tickets (
  id_modulo_origen     SERIAL PRIMARY KEY,
  nombre_modulo_origen VARCHAR(100) NOT NULL UNIQUE  -- VARCHAR(100) para nombres largos
);

-- 4. Nivel_urgencia_tickets
CREATE TABLE IF NOT EXISTS Nivel_urgencia_tickets (
  id_nivel_urgencia     SERIAL PRIMARY KEY,
  nombre_nivel_urgencia VARCHAR(50) NOT NULL UNIQUE
);

-- 5. Estados_Ticket
CREATE TABLE IF NOT EXISTS Estados_Ticket (
  id_estado     SERIAL PRIMARY KEY,
  nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

-- ═══════════════════════════════════════════════════════════
-- TABLAS PRINCIPALES
-- ═══════════════════════════════════════════════════════════

-- 6. Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
  id_usuario       SERIAL PRIMARY KEY,
  nombre_usuario   VARCHAR(120) NOT NULL UNIQUE,
  password_usuario VARCHAR(255) NOT NULL,   -- bcrypt hash
  estado_usuario   VARCHAR(20)  NOT NULL DEFAULT 'activo'
                    CHECK (estado_usuario IN ('activo','inactivo')),
  id_rol           INTEGER NOT NULL REFERENCES Roles(id_rol),
  id_dependencia   INTEGER REFERENCES Dependencias(id_dependencia)
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

-- 8. Mensaje_tickets (chat de novedades)
CREATE TABLE IF NOT EXISTS Mensaje_tickets (
  id_mensaje         SERIAL PRIMARY KEY,
  texto_mensaje      TEXT,
  url_imagen_mensaje TEXT,
  fecha_mensaje      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  leido_mensaje      BOOLEAN     NOT NULL DEFAULT FALSE,
  id_ticket          INTEGER     NOT NULL REFERENCES Tickets(id_ticket) ON DELETE CASCADE,
  id_usuario         INTEGER     REFERENCES Usuarios(id_usuario)  -- quién envió el mensaje
);

-- ═══════════════════════════════════════════════════════════
-- TABLAS AUXILIARES
-- ═══════════════════════════════════════════════════════════

-- 9. password_reset_tokens (recuperación de contraseña)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          SERIAL PRIMARY KEY,
  id_usuario  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  token       VARCHAR(64) NOT NULL UNIQUE,
  expira_en   TIMESTAMPTZ NOT NULL,
  usado       BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. push_subscriptions (notificaciones Web Push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          SERIAL PRIMARY KEY,
  id_usuario  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  endpoint    TEXT    NOT NULL UNIQUE,
  p256dh      TEXT    NOT NULL,
  auth        TEXT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ticket_ultimo_visto (control de mensajes no leídos por usuario)
CREATE TABLE IF NOT EXISTS ticket_ultimo_visto (
  id_ticket   INTEGER NOT NULL REFERENCES Tickets(id_ticket) ON DELETE CASCADE,
  id_usuario  INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  visto_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_ticket, id_usuario)
);

-- ═══════════════════════════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_tickets_estado       ON Tickets(id_estado);
CREATE INDEX IF NOT EXISTS idx_tickets_modulo       ON Tickets(id_modulo_origen);
CREATE INDEX IF NOT EXISTS idx_tickets_creador      ON Tickets(id_usuario_creador);
CREATE INDEX IF NOT EXISTS idx_tickets_asignado     ON Tickets(id_usuario_asignado);
CREATE INDEX IF NOT EXISTS idx_tickets_fecha        ON Tickets(fecha_creacion_ticket DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_ticket      ON Mensaje_tickets(id_ticket);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token   ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_usuario ON password_reset_tokens(id_usuario);
CREATE INDEX IF NOT EXISTS idx_push_usuario         ON push_subscriptions(id_usuario);
CREATE INDEX IF NOT EXISTS idx_ultimo_visto_usuario ON ticket_ultimo_visto(id_usuario);
`

// ─────────────────────────────────────────────────────────────
//  MÓDULOS REALES DEL TERMINAL DE TRANSPORTE DE NEIVA
// ─────────────────────────────────────────────────────────────
const MODULOS_TERMINAL = [
  'C6 - Caseta de entrada',
  'CAI',
  'Plataformas de descenso',
  'Sala de espera descenso',
  'Pasillo "El escondite"',
  'Sala mixtos',
  'Plataforma Mixtos',
  'Baños mixtos',
  'Puerta 3',
  'Taquillas puerta 2',
  'Salas VIP',
  'Rack salas VIP',
  'Plataformas C5',
  'Zona de Vigilancia Operativa (ZVO)',
  'Dirección operativa',
  'Coordinación operativa',
  'Rack sistemas operativa',
  'Conduce',
  'Alcoholimetría',
  'Sala descenso de conductores',
  'Pasillo dirección operativa',
  'Zona taxis',
  'Bosque',
  'Caseta (Z V O)',
  'Vallas puerta 3',
  'Vallas Bombini',
  'Baños capilla',
  'Puerta 1',
  'Capilla',
  'Taquillas regional - Molinete 1',
  'Taquillas regional - Molinete 2',
  'Pasillo taquillas Regional',
  'Salas de espera Regional',
  'Plataformas C4',
  'Baños Regional',
  'Túnel',
  'Tanques de almacenamiento de agua Regional',
  'Tanques de almacenamiento de agua Centenario',
  'Planta eléctrica módulo Antiguo',
  'Planta eléctrica módulo Regional',
  'Planta eléctrica módulo Centenario',
  'Plataformas Centenario',
  'Kiosco de conductores',
  'Salas VIP Centenario',
  'Taquillas Centenario',
  'Baños Centenario',
  'Bahía taxis Centenario',
  'Caseta de salida C3',
  'Sistema hidroneumático Centenario',
  'Oficinas administrativas - piso 2',
  'Oficinas administrativas - piso 3',
  'Terraza',
]

// ─────────────────────────────────────────────────────────────
//  SEED — datos iniciales
// ─────────────────────────────────────────────────────────────
async function seed(client) {
  const { rows } = await client.query('SELECT COUNT(*) FROM Roles')
  if (parseInt(rows[0].count) > 0) {
    console.log('  ↳ Seed ya existe, omitiendo.')
    return
  }

  // ─── Roles ───
  await client.query(`
    INSERT INTO Roles (nombre_rol) VALUES ('admin'), ('usuario')
  `)
  console.log('  ✓ Roles: admin, usuario')

  // ─── Dependencias (SIN "Sistemas") ───
  await client.query(`
    INSERT INTO Dependencias (nombre_dependencia) VALUES
      ('Administrativo'),
      ('Servicios Generales'),
      ('Operativo'),
      ('Mantenimiento')
  `)
  console.log('  ✓ Dependencias: 4 áreas')

  // ─── Usuarios de prueba ───
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
  console.log('  ✓ Usuarios: 3 de prueba')

  // ─── Módulos de origen (52 reales del Terminal) ───
  for (const nombre of MODULOS_TERMINAL) {
    await client.query(
      `INSERT INTO Modulo_origen_tickets (nombre_modulo_origen) VALUES ($1)`,
      [nombre]
    )
  }
  console.log(`  ✓ Módulos: ${MODULOS_TERMINAL.length} ubicaciones del Terminal`)

  // ─── Niveles de urgencia ───
  await client.query(`
    INSERT INTO Nivel_urgencia_tickets (nombre_nivel_urgencia) VALUES
      ('Planificado'),('Moderado'),('Alto'),('Inmediata')
  `)
  console.log('  ✓ Niveles de urgencia: 4')

  // ─── Estados de ticket ───
  await client.query(`
    INSERT INTO Estados_Ticket (nombre_estado) VALUES
      ('Nuevo'),('Asignado'),('En progreso'),('Resuelto'),('Cerrado')
  `)
  console.log('  ✓ Estados: 5')

  console.log('  ↳ Seed completado.')
}

// ─────────────────────────────────────────────────────────────
//  INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────
async function init() {
  const client = await pool.connect()
  try {
    console.log('\n🗄️  SIGITTN — Inicializando base de datos...\n')
    await client.query('BEGIN')

    // Crear todas las tablas
    await client.query(schema)
    console.log('✅  Tablas creadas (11 total):')
    console.log('    • Roles, Dependencias, Usuarios')
    console.log('    • Modulo_origen_tickets, Nivel_urgencia_tickets, Estados_Ticket')
    console.log('    • Tickets, Mensaje_tickets')
    console.log('    • password_reset_tokens, push_subscriptions, ticket_ultimo_visto')
    console.log()

    // Insertar datos iniciales
    await seed(client)

    await client.query('COMMIT')

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✅  Base de datos lista.')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('\nUsuarios de prueba:')
    console.log('  ┌────────────────┬───────────┬────────────────┐')
    console.log('  │ Usuario        │ Rol       │ Contraseña     │')
    console.log('  ├────────────────┼───────────┼────────────────┤')
    console.log('  │ Henry Barón    │ admin     │ henryBaron123  │')
    console.log('  │ Leidy Toledo   │ admin     │ leidyTo12343   │')
    console.log('  │ Linda Cedeño   │ usuario   │ linda2026      │')
    console.log('  └────────────────┴───────────┴────────────────┘')
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

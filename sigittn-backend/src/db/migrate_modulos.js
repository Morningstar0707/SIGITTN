/**
 * SIGITTN — Migración: reemplazar módulos de prueba por módulos reales
 * Ejecutar una sola vez: node src/db/migrate_modulos.js
 *
 * ⚠️  Si tienes tickets creados con los módulos de prueba (C1-C8),
 *     sus id_modulo_origen quedarán apuntando a IDs que ya no existen.
 *     Si la BD es de prueba puedes ignorarlo. Si tiene datos reales,
 *     haz backup antes.
 */
import pool from '../config/db.js'

const MODULOS_NUEVOS = [
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

async function run() {
  const client = await pool.connect()
  try {
    console.log('\n🗄️  Actualizando módulos...\n')
    await client.query('BEGIN')

    // 1. Eliminar módulos de prueba (C1-C8, Unidad operativa)
    //    ON DELETE SET NULL en tickets si los hubiera con esos módulos
    await client.query(`DELETE FROM Modulo_origen_tickets`)
    console.log('✅  Módulos de prueba eliminados')

    // 2. Reiniciar la secuencia para IDs limpios desde 1
    await client.query(`ALTER SEQUENCE modulo_origen_tickets_id_modulo_origen_seq RESTART WITH 1`)

    // 3. Insertar los 52 módulos reales
    for (const nombre of MODULOS_NUEVOS) {
      await client.query(
        `INSERT INTO Modulo_origen_tickets (nombre_modulo_origen) VALUES ($1)`,
        [nombre]
      )
    }

    await client.query('COMMIT')
    console.log(`✅  ${MODULOS_NUEVOS.length} módulos reales insertados`)
    console.log('\nMódulos cargados:')
    MODULOS_NUEVOS.forEach((m, i) => console.log(`  ${String(i+1).padStart(2,'0')}. ${m}`))
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

run()

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Supabase Transaction Pooler usa DATABASE_URL (recomendado para Railway).
// Si no está definida, usa los parámetros individuales (desarrollo local).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString:    process.env.DATABASE_URL,
      ssl:                 { rejectUnauthorized: false }, // requerido por Supabase
      max:                 10,
      idleTimeoutMillis:   30000,
      connectionTimeoutMillis: 5000,
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'sigittn',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max:                 10,
      idleTimeoutMillis:   30000,
      connectionTimeoutMillis: 2000,
    })

pool.on('error', (err) => {
  console.error('Error inesperado en pool de PostgreSQL:', err)
})

export default pool

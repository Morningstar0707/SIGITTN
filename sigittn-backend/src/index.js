import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import routes from './routes/index.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api', routes)

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

async function start() {
  try {
    await pool.query('SELECT 1')
    console.log('✅  Conectado a PostgreSQL')
  } catch (err) {
    console.error('❌  No se pudo conectar a PostgreSQL:', err.message)
    console.error('   → Verifica las variables en .env')
    process.exit(1)
  }
  app.listen(PORT, () => {
    console.log(`\n🚀  SIGITTN Backend corriendo en http://localhost:${PORT}`)
    console.log(`📋  API disponible en http://localhost:${PORT}/api`)
    console.log(`🌍  CORS habilitado para: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}\n`)
  })
}

start()
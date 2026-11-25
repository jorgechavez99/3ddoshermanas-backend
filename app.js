/**
 * API de 3D Dos Hermanas.
 * Arranque de Express: middlewares, rutas /api/v1/... y listen.
 * La web (Next.js) consume /api/v1/productos para la galeria de cada escaparate.
 */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const productosRouter = require('./routers/productosRouter')
const presupuestosRouter = require('./routers/presupuestosRouter')

const app = express()
const PORT = process.env.PORT || 4010

// Solo la web propia puede llamar a la API desde el navegador.
app.use(cors({ origin: process.env.ORIGEN_WEB?.split(',') || false }))
app.use(express.json({ limit: '50kb' }))
app.disable('x-powered-by')

app.get('/api/v1/salud', (req, res) => res.status(200).json({ error: false, msg: ['api operativa'] }))
app.use('/api/v1/productos', productosRouter)
app.use('/api/v1/presupuestos', presupuestosRouter)

app.use((req, res) => res.status(404).json({ error: true, msg: ['ruta no encontrada'] }))

// JSON mal formado en el body: 400 en vez de un error generico.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: true, msg: ['el body no es un JSON valido'] })
  }
  console.error('[app]', error)
  return res.status(500).json({ error: true, msg: ['comuniquese con el administrador'] })
})

// Solo escucha si se ejecuta directamente (en los tests se importa la app).
if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => console.log(`API escuchando en http://127.0.0.1:${PORT}`))
}

module.exports = app

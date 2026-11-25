/**
 * Proteccion de las rutas de escritura con una clave de administrador.
 * La clave va en la cabecera "x-clave-admin" y se compara con CLAVE_ADMIN
 * de .env en tiempo constante, para no dar pistas por el tiempo de respuesta.
 */
const crypto = require('node:crypto')

const NO_AUTORIZADO = { error: true, msg: ['no autorizado'] }

const validarAdmin = (req, res, next) => {
  const esperada = process.env.CLAVE_ADMIN
  const recibida = req.get('x-clave-admin')

  // IMPORTANTE: sin CLAVE_ADMIN configurada nadie puede escribir.
  if (!esperada || !recibida) return res.status(401).json(NO_AUTORIZADO)

  // Se comparan los hash para que ambos buffers midan lo mismo.
  const a = crypto.createHash('sha256').update(recibida).digest()
  const b = crypto.createHash('sha256').update(esperada).digest()
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json(NO_AUTORIZADO)

  next()
}

module.exports = { validarAdmin }

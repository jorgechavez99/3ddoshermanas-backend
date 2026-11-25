/**
 * Reglas de validacion con express-validator y el middleware que
 * devuelve 400 con los mensajes si algo no cumple.
 */
const { query, body, param, validationResult } = require('express-validator')

const ESCAPARATES = ['regalos-personalizados', 'figuras-anime', 'piezas-repuestos-3d']

const comprobarErrores = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(400).json({ error: true, msg: errores.array().map((e) => e.msg) })
  }
  next()
}

const validarListado = [
  query('escaparate').optional().isIn(ESCAPARATES).withMessage(`escaparate debe ser uno de: ${ESCAPARATES.join(', ')}`),
  comprobarErrores,
]

const validarId = [param('id').isInt({ min: 1 }).withMessage('id no valido').toInt(), comprobarErrores]

const reglasProducto = [
  body('nombre').trim().isLength({ min: 2, max: 120 }).withMessage('nombre obligatorio (2-120 caracteres)'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .isLength({ max: 140 })
    .withMessage('slug obligatorio: minusculas, numeros y guiones (ej. llavero-con-nombre)'),
  body('escaparate').isIn(ESCAPARATES).withMessage(`escaparate debe ser uno de: ${ESCAPARATES.join(', ')}`),
  body('descripcion').optional().trim().isLength({ max: 500 }).withMessage('descripcion de 500 caracteres como maximo'),
  body('precio_desde').isFloat({ min: 0, max: 9999 }).withMessage('precio_desde debe ser un numero entre 0 y 9999').toFloat(),
  body('foto_url')
    .optional({ values: 'null' })
    .isURL({ protocols: ['https', 'http'], require_protocol: true })
    .isLength({ max: 255 })
    .withMessage('foto_url debe ser una URL completa'),
]

const validarCreacion = [...reglasProducto, comprobarErrores]

const validarActualizacion = [
  param('id').isInt({ min: 1 }).withMessage('id no valido').toInt(),
  ...reglasProducto,
  body('visible').optional().isBoolean().withMessage('visible debe ser true o false').toBoolean(),
  comprobarErrores,
]

module.exports = { validarListado, validarId, validarCreacion, validarActualizacion, ESCAPARATES }

/**
 * Rutas de presupuestos. El precio del chibi es publico; la calculadora
 * completa y las tarifas exigen la clave de administrador.
 */
const express = require('express')
const { query, body } = require('express-validator')
const { getPresupuestoChibi, getTarifas, postCalcular } = require('../controllers/presupuestosController')
const { validarAdmin } = require('../middlewares/validarAdmin')
const { comprobarErrores } = require('../middlewares/validaciones')
const { tarifas } = require('../configs/tarifas')

const router = express.Router()

const validarChibi = [
  query('tamano').isIn(Object.keys(tarifas.recetasChibi)).withMessage('tamano no valido'),
  query('personas_extra').optional().isInt({ min: 0, max: tarifas.extrasChibi.maxPersonasExtra }).withMessage('personas_extra no valido').toInt(),
  query('base_nombre').optional().isBoolean().withMessage('base_nombre debe ser true o false').toBoolean(),
  query('acabado').optional().isIn(Object.keys(tarifas.extrasChibi.acabados)).withMessage('acabado no valido'),
  query('urgente').optional().isBoolean().withMessage('urgente debe ser true o false').toBoolean(),
  comprobarErrores,
]

const validarCalculo = [
  body('trabajo').isObject().withMessage('falta trabajo'),
  body(['trabajo.gramos', 'trabajo.horas']).isFloat({ min: 0, max: 100000 }).withMessage('gramos y horas son obligatorios').toFloat(),
  body(['trabajo.minutosPreparacion', 'trabajo.minutosPostprocesado', 'trabajo.extras']).optional().isFloat({ min: 0 }).toFloat(),
  body('parametros').optional().isObject(),
  comprobarErrores,
]

router.get('/chibi', validarChibi, getPresupuestoChibi)
router.get('/tarifas', validarAdmin, getTarifas)
router.post('/calcular', validarAdmin, validarCalculo, postCalcular)

module.exports = router

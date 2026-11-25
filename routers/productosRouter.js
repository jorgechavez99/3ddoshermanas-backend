/**
 * Rutas de productos. El listado es publico; crear, editar y ocultar
 * exigen la clave de administrador.
 */
const express = require('express')
const { getProductos, crearProducto, actualizarProducto, ocultar } = require('../controllers/productosController')
const { validarListado, validarId, validarCreacion, validarActualizacion } = require('../middlewares/validaciones')
const { validarAdmin } = require('../middlewares/validarAdmin')

const router = express.Router()

router.get('/', validarListado, getProductos)
router.post('/', validarAdmin, validarCreacion, crearProducto)
router.put('/:id', validarAdmin, validarActualizacion, actualizarProducto)
router.patch('/:id/ocultar', validarAdmin, validarId, ocultar)

module.exports = router

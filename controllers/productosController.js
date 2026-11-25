/**
 * Controlador de productos: recibe la peticion, llama al modelo y responde
 * siempre con la forma { error, msg, data }.
 */
const {
  getProductosVisibles,
  postProducto,
  putProducto,
  ocultarProducto,
} = require('../models/modelProductos')

const ERROR_SERVIDOR = { error: true, msg: ['comuniquese con el administrador'] }

// MySQL devuelve ER_DUP_ENTRY cuando el slug ya existe (columna UNIQUE).
const esSlugRepetido = (error) => error?.code === 'ER_DUP_ENTRY'

const getProductos = async (req, res) => {
  try {
    const data = await getProductosVisibles(req.query.escaparate)
    return res.status(200).json({ error: false, msg: ['productos obtenidos'], data })
  } catch (error) {
    console.error('[getProductos]', error)
    return res.status(500).json(ERROR_SERVIDOR)
  }
}

const crearProducto = async (req, res) => {
  try {
    const data = await postProducto(req.body)
    return res.status(201).json({ error: false, msg: ['producto creado'], data })
  } catch (error) {
    if (esSlugRepetido(error)) {
      return res.status(400).json({ error: true, msg: ['ya existe un producto con ese slug'] })
    }
    console.error('[crearProducto]', error)
    return res.status(500).json(ERROR_SERVIDOR)
  }
}

const actualizarProducto = async (req, res) => {
  try {
    const data = await putProducto(Number(req.params.id), req.body)
    if (!data) return res.status(404).json({ error: true, msg: ['producto no encontrado'] })
    return res.status(200).json({ error: false, msg: ['producto actualizado'], data })
  } catch (error) {
    if (esSlugRepetido(error)) {
      return res.status(400).json({ error: true, msg: ['ya existe un producto con ese slug'] })
    }
    console.error('[actualizarProducto]', error)
    return res.status(500).json(ERROR_SERVIDOR)
  }
}

const ocultar = async (req, res) => {
  try {
    const existia = await ocultarProducto(Number(req.params.id))
    if (!existia) return res.status(404).json({ error: true, msg: ['producto no encontrado'] })
    return res.status(200).json({ error: false, msg: ['producto ocultado'] })
  } catch (error) {
    console.error('[ocultar]', error)
    return res.status(500).json(ERROR_SERVIDOR)
  }
}

module.exports = { getProductos, crearProducto, actualizarProducto, ocultar }

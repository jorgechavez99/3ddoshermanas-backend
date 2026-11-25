/**
 * Acceso a la tabla productos.
 * Cada funcion abre una conexion del pool, ejecuta la query y la libera
 * siempre en el finally, aunque falle.
 */
const { pool } = require('../configs/configMysql')
const { queriesProductos } = require('./queriesProductos')

// MySQL guarda los booleanos como 0/1: los convertimos para la API.
const formatear = (fila) => ({ ...fila, visible: Boolean(fila.visible) })

/**
 * Ejecuta una query con una conexion del pool.
 * @param {string} sql
 * @param {Array} valores
 * @returns {Promise<any>} filas o resultado de la escritura
 */
const ejecutar = async (sql, valores = []) => {
  let client
  try {
    client = await pool.getConnection()
    const [resultado] = await client.execute(sql, valores)
    return resultado
  } finally {
    client?.release()
  }
}

/**
 * Lista los productos visibles, opcionalmente de un escaparate.
 * @param {string} [escaparate]
 * @returns {Promise<object[]>}
 */
const getProductosVisibles = async (escaparate) => {
  const filas = escaparate
    ? await ejecutar(queriesProductos.getVisiblesPorEscaparate, [escaparate])
    : await ejecutar(queriesProductos.getVisibles)
  return filas.map(formatear)
}

/**
 * @param {number} id
 * @returns {Promise<object|null>}
 */
const getProductoPorId = async (id) => {
  const filas = await ejecutar(queriesProductos.getPorId, [id])
  return filas[0] ? formatear(filas[0]) : null
}

/**
 * Crea un producto (visible por defecto).
 * @param {{nombre:string, slug:string, escaparate:string, descripcion:string, precio_desde:number, foto_url:?string}} body
 * @returns {Promise<object>} el producto creado
 */
const postProducto = async ({ nombre, slug, escaparate, descripcion = '', precio_desde, foto_url = null }) => {
  const resultado = await ejecutar(queriesProductos.crear, [nombre, slug, escaparate, descripcion, precio_desde, foto_url])
  return getProductoPorId(resultado.insertId)
}

/**
 * Actualiza un producto completo.
 * @returns {Promise<object|null>} el producto actualizado o null si no existe
 */
const putProducto = async (id, { nombre, slug, escaparate, descripcion = '', precio_desde, foto_url = null, visible = true }) => {
  const resultado = await ejecutar(queriesProductos.actualizar, [
    nombre, slug, escaparate, descripcion, precio_desde, foto_url, visible, id,
  ])
  return resultado.affectedRows ? getProductoPorId(id) : null
}

/**
 * Oculta un producto (no se borra para no perder el historial).
 * @returns {Promise<boolean>} true si existia
 */
const ocultarProducto = async (id) => {
  const resultado = await ejecutar(queriesProductos.ocultar, [id])
  return resultado.affectedRows > 0
}

module.exports = { getProductosVisibles, getProductoPorId, postProducto, putProducto, ocultarProducto }

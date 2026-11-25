/**
 * Consultas SQL de productos, siempre parametrizadas (?) para evitar inyeccion SQL.
 */
const CAMPOS = 'id_producto, nombre, slug, escaparate, descripcion, precio_desde, foto_url, visible, creado_en'

const queriesProductos = {
  getVisibles: `SELECT ${CAMPOS} FROM productos WHERE visible = TRUE ORDER BY creado_en DESC, id_producto DESC`,
  getVisiblesPorEscaparate: `SELECT ${CAMPOS} FROM productos WHERE visible = TRUE AND escaparate = ? ORDER BY creado_en DESC, id_producto DESC`,
  getPorId: `SELECT ${CAMPOS} FROM productos WHERE id_producto = ?`,
  crear: `INSERT INTO productos (nombre, slug, escaparate, descripcion, precio_desde, foto_url) VALUES (?, ?, ?, ?, ?, ?)`,
  actualizar: `UPDATE productos SET nombre = ?, slug = ?, escaparate = ?, descripcion = ?, precio_desde = ?, foto_url = ?, visible = ? WHERE id_producto = ?`,
  ocultar: `UPDATE productos SET visible = FALSE WHERE id_producto = ?`,
}

module.exports = { queriesProductos }

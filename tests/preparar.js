/**
 * Prepara la base de datos de test antes de cada prueba:
 * borra la tabla, la vuelve a crear con queries.sql y carga productos de ejemplo.
 * Necesita una MySQL/MariaDB local con la base indicada en .env.test.
 */
const fs = require('node:fs')
const path = require('node:path')
const { pool } = require('../configs/configMysql')

const ESQUEMA = fs.readFileSync(path.join(__dirname, '../models/queries.sql'), 'utf8')
  .split('\n')
  .filter((linea) => !linea.startsWith('--'))
  .join('\n')

const reiniciarBaseDeDatos = async () => {
  await pool.query('DROP TABLE IF EXISTS productos')
  await pool.query(ESQUEMA)
  await pool.query(
    `INSERT INTO productos (nombre, slug, escaparate, descripcion, precio_desde, visible, creado_en) VALUES
     ('Llavero con nombre', 'llavero-con-nombre', 'regalos-personalizados', 'Llavero personalizado', 4.00, TRUE, '2026-11-01 10:00:00'),
     ('Figura chibi', 'figura-chibi', 'figuras-anime', 'Figura estilo chibi', 20.00, TRUE, '2026-11-02 10:00:00'),
     ('Soporte Funko', 'soporte-funko', 'figuras-anime', 'Soporte para Funko', 6.00, TRUE, '2026-11-03 10:00:00'),
     ('Prototipo oculto', 'prototipo-oculto', 'figuras-anime', 'No debe verse', 9.00, FALSE, '2026-11-04 10:00:00')`
  )
}

module.exports = { reiniciarBaseDeDatos, pool }

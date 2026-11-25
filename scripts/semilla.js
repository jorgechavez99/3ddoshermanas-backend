/**
 * Carga productos de ejemplo para ver la galeria funcionando.
 * Uso: npm run semilla   (usa los datos de conexion de .env)
 * No duplica: si el slug ya existe, lo salta.
 */
require('dotenv').config()
const { pool } = require('../configs/configMysql')

const PRODUCTOS = [
  ['Llavero con nombre', 'llavero-con-nombre', 'regalos-personalizados', 'Tu nombre o el de quien quieras, en el color que elijas.', 4],
  ['Pack de 5 llaveros para eventos', 'pack-5-llaveros-eventos', 'regalos-personalizados', 'Detalle para invitados de bodas, comuniones o cumpleaños.', 15],
  ['Placa con nombre para la habitación', 'placa-nombre-habitacion', 'regalos-personalizados', 'Letrero decorativo con nombre para la puerta.', 12],
  ['Figura chibi personalizada', 'figura-chibi-personalizada', 'figuras-anime', 'Tu personaje o tú mismo en estilo chibi, a partir de una foto.', 20],
  ['Soporte para Funko', 'soporte-funko', 'figuras-anime', 'Peana con altura para lucir tu Funko favorito.', 6],
  ['Llavero de anime', 'llavero-anime', 'figuras-anime', 'Llavero de tu personaje favorito.', 5],
  ['Clip de repuesto a medida', 'clip-repuesto-medida', 'piezas-repuestos-3d', 'Clips y enganches que ya no se venden, a partir de la pieza rota.', 8],
  ['Soporte para móvil o tablet', 'soporte-movil-tablet', 'piezas-repuestos-3d', 'Soporte de escritorio a la medida de tu dispositivo.', 10],
  ['Organizador de cajón a medida', 'organizador-cajon-medida', 'piezas-repuestos-3d', 'Separadores hechos a la medida exacta de tu cajón.', 14],
]

const sembrar = async () => {
  let creados = 0
  try {
    for (const producto of PRODUCTOS) {
      const [resultado] = await pool.execute(
        'INSERT IGNORE INTO productos (nombre, slug, escaparate, descripcion, precio_desde) VALUES (?, ?, ?, ?, ?)',
        producto
      )
      creados += resultado.affectedRows
    }
    console.log(`Semilla completada: ${creados} productos nuevos, ${PRODUCTOS.length - creados} ya existían.`)
  } catch (error) {
    console.error('Error al cargar la semilla:', error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

sembrar()

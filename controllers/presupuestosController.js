/**
 * Controlador de presupuestos.
 * - getPresupuestoChibi: publico, solo devuelve el precio final.
 * - postCalcular / getTarifas: privados (clave admin), con desglose y parametros.
 */
const { tarifas } = require('../configs/tarifas')
const { calcularCoste, presupuestoChibi } = require('../helpers/calcularPresupuesto')

const getPresupuestoChibi = (req, res) => {
  try {
    const { tamano, personas_extra, base_nombre, acabado, urgente } = req.query
    const data = presupuestoChibi({
      tamano,
      personasExtra: personas_extra ?? 0,
      baseNombre: base_nombre ?? false,
      acabado: acabado ?? 'un-color',
      urgente: urgente ?? false,
    })
    return res.status(200).json({ error: false, msg: ['presupuesto calculado'], data })
  } catch (error) {
    console.error('[getPresupuestoChibi]', error)
    return res.status(400).json({ error: true, msg: [error.message] })
  }
}

const getTarifas = (req, res) =>
  res.status(200).json({ error: false, msg: ['tarifas actuales'], data: tarifas })

const postCalcular = (req, res) => {
  try {
    // La calculadora admin puede probar otros parametros sin tocar el archivo.
    const parametros = { ...tarifas.parametros, ...(req.body.parametros || {}) }
    const data = calcularCoste(req.body.trabajo, parametros)
    return res.status(200).json({ error: false, msg: ['coste calculado'], data: { ...data, parametros } })
  } catch (error) {
    console.error('[postCalcular]', error)
    return res.status(400).json({ error: true, msg: [error.message] })
  }
}

module.exports = { getPresupuestoChibi, getTarifas, postCalcular }

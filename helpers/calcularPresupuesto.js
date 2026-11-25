/**
 * Calculadora de costes de impresion 3D (mismo modelo que la de 3dfils):
 * material + luz + amortizacion + mantenimiento + mano de obra + extras,
 * y sobre eso margen, IVA, minimo por pedido y redondeo.
 * Funciones puras: no tocan la base de datos, asi se prueban facilmente.
 */
const { tarifas } = require('../configs/tarifas')

const dosDecimales = (n) => Math.round(n * 100) / 100

/**
 * Redondea un precio hacia arriba al escalon elegido.
 * @param {number} precio
 * @param {'0.99'|'0.50'|'1.00'|'ninguno'} modo
 * @returns {number}
 */
const redondearPrecio = (precio, modo) => {
  const p = dosDecimales(precio)
  if (modo === '0.99') {
    const entero = Math.floor(p)
    return p <= entero + 0.99 ? dosDecimales(entero + 0.99) : dosDecimales(entero + 1.99)
  }
  if (modo === '0.50') return Math.ceil(p * 2) / 2
  if (modo === '1.00') return Math.ceil(p)
  return p
}

/**
 * Calcula coste y precio de un trabajo de impresion.
 * @param {{gramos:number, horas:number, minutosPreparacion?:number, minutosPostprocesado?:number, extras?:number, recargo?:number}} trabajo
 * @param {object} p parametros de configs/tarifas.js (o los que envie la calculadora admin)
 * @returns {{desglose:object, costeTotal:number, precioSinIva:number, iva:number, precioFinal:number}}
 */
const calcularCoste = (trabajo, p) => {
  const { gramos, horas, minutosPreparacion = 0, minutosPostprocesado = 0, extras = 0, recargo = 0 } = trabajo
  for (const [nombre, valor] of Object.entries({ gramos, horas, minutosPreparacion, minutosPostprocesado, extras, recargo })) {
    if (!Number.isFinite(valor) || valor < 0) throw new Error(`valor no valido en ${nombre}`)
  }

  const horasVidaUtil = p.mesesAmortizacion * 30 * p.horasUsoDia
  const desglose = {
    material: gramos * (1 + p.merma) * (p.precioBobina / p.pesoBobina),
    luz: horas * (p.consumoW / 1000) * p.precioKwh,
    amortizacion: horas * (p.precioImpresora / horasVidaUtil),
    mantenimiento: horas * (p.mantenimientoMes / (30 * p.horasUsoDia)),
    manoDeObra: ((minutosPreparacion + minutosPostprocesado) / 60) * p.precioHora,
    extras,
  }
  const costeTotal = Object.values(desglose).reduce((a, b) => a + b, 0)
  const precioSinIva = costeTotal * (1 + p.margen) * (1 + recargo)
  const conIva = Math.max(precioSinIva * (1 + p.iva), p.precioMinimo)
  const precioFinal = redondearPrecio(conIva, p.redondeo)

  return {
    desglose: Object.fromEntries(Object.entries(desglose).map(([k, v]) => [k, dosDecimales(v)])),
    costeTotal: dosDecimales(costeTotal),
    precioSinIva: dosDecimales(precioSinIva),
    iva: dosDecimales(precioFinal - precioFinal / (1 + p.iva)),
    precioFinal,
  }
}

/**
 * Precio publico de un chibi. Solo devuelve el precio final y las opciones
 * normalizadas: el desglose y el margen no salen del backend.
 * @param {{tamano:string, personasExtra?:number, baseNombre?:boolean, acabado?:string, urgente?:boolean}} opciones
 * @returns {{precioFinal:number, opciones:object}}
 */
const presupuestoChibi = ({ tamano, personasExtra = 0, baseNombre = false, acabado = 'un-color', urgente = false }) => {
  const { parametros, recetasChibi, extrasChibi } = tarifas
  const receta = recetasChibi[tamano]
  const acabadoElegido = extrasChibi.acabados[acabado]
  if (!receta) throw new Error('tamano no valido')
  if (!acabadoElegido) throw new Error('acabado no valido')
  if (!Number.isInteger(personasExtra) || personasExtra < 0 || personasExtra > extrasChibi.maxPersonasExtra) {
    throw new Error('personasExtra no valido')
  }

  // Cada persona extra añade material, impresora y modelado.
  const factor = 1 + personasExtra * extrasChibi.personaExtra.factorMaterialYTiempo
  const resultado = calcularCoste(
    {
      gramos: receta.gramos * factor,
      horas: receta.horas * factor,
      minutosPreparacion:
        receta.minutosModelado + personasExtra * extrasChibi.personaExtra.minutosModeladoExtra,
      minutosPostprocesado: receta.minutosAcabado + acabadoElegido.minutosExtra,
      extras: receta.packaging + acabadoElegido.coste + (baseNombre ? extrasChibi.baseNombre.coste : 0),
      recargo: urgente ? extrasChibi.urgente.recargo : 0,
    },
    parametros
  )

  return {
    precioFinal: resultado.precioFinal,
    opciones: { tamano, etiquetaTamano: receta.etiqueta, personasExtra, baseNombre, acabado, etiquetaAcabado: acabadoElegido.etiqueta, urgente },
  }
}

module.exports = { calcularCoste, redondearPrecio, presupuestoChibi }

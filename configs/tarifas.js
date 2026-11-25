/**
 * Tarifas y parametros de la calculadora de costes.
 *
 * IMPORTANTE: este archivo es privado (solo vive en el backend). La web
 * publica nunca recibe estos numeros, solo el precio final.
 * Para cambiar precios basta con editar este archivo y reiniciar la API:
 *   pm2 reload 3ddoshermanas-api
 */

const parametros = {
  // Material (PLA Elegoo)
  precioBobina: 20, // euros
  pesoBobina: 1000, // gramos
  merma: 0.1, // fallos y purgas (los soportes ya van en los gramos del slicer)

  // Electricidad
  consumoW: 120, // estimado; medir con enchufe medidor
  precioKwh: 0.2, // euros/kWh

  // Impresora Elegoo Centauri Carbon 2 Combo
  precioImpresora: 450,
  mesesAmortizacion: 24,
  horasUsoDia: 8,
  mantenimientoMes: 5,

  // Trabajo de Jorge y Mary
  precioHora: 12, // modelado, preparacion y acabado

  // Venta
  margen: 0.4,
  iva: 0.21,
  precioMinimo: 5,
  redondeo: '0.99', // '0.99' | '0.50' | '1.00' | 'ninguno'
}

/**
 * Recetas del chibi por tamaño.
 * El mediano son los datos reales del slicer (figura de 120 mm);
 * pequeño y grande estan escalados y conviene confirmarlos imprimiendo.
 */
const recetasChibi = {
  pequeno: { etiqueta: 'Pequeño (8 cm)', gramos: 18, horas: 1.2, minutosModelado: 45, minutosAcabado: 10, packaging: 0.9 },
  mediano: { etiqueta: 'Mediano (12 cm)', gramos: 60.4, horas: 2.9, minutosModelado: 45, minutosAcabado: 20, packaging: 1.2 },
  grande: { etiqueta: 'Grande (18 cm)', gramos: 200, horas: 8, minutosModelado: 60, minutosAcabado: 30, packaging: 1.7 },
}

const extrasChibi = {
  // Cada persona o mascota extra en la misma figura.
  personaExtra: { factorMaterialYTiempo: 0.6, minutosModeladoExtra: 30 },
  baseNombre: { coste: 3 },
  acabados: {
    'un-color': { etiqueta: 'Un color', coste: 0, minutosExtra: 0 },
    multicolor: { etiqueta: 'Varios colores (multicolor)', coste: 8, minutosExtra: 0 },
    pintado: { etiqueta: 'Pintada a mano', coste: 0, minutosExtra: 60 },
  },
  urgente: { recargo: 0.2 },
  maxPersonasExtra: 3,
}

module.exports = { tarifas: { parametros, recetasChibi, extrasChibi } }

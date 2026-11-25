/**
 * Tests de la calculadora de costes (funciones puras, sin base de datos).
 * Los numeros de referencia salen del chibi mediano real del slicer de Jorge:
 * 60,4 g de PLA y 2 h 54 min de impresion.
 */
import { describe, it, expect } from 'vitest'
import { calcularCoste, redondearPrecio, presupuestoChibi } from '../helpers/calcularPresupuesto.js'
import { tarifas } from '../configs/tarifas.js'

describe('redondearPrecio', () => {
  it('redondea hacia arriba al ,99 siguiente', () => {
    expect(redondearPrecio(26.92, '0.99')).toBe(26.99)
    expect(redondearPrecio(27.0, '0.99')).toBe(27.99)
    expect(redondearPrecio(26.99, '0.99')).toBe(26.99)
  })

  it('sin redondeo deja dos decimales', () => {
    expect(redondearPrecio(26.924, 'ninguno')).toBe(26.92)
  })
})

describe('calcularCoste', () => {
  const trabajo = { gramos: 60.4, horas: 2.9, minutosPreparacion: 45, minutosPostprocesado: 20, extras: 1.2 }

  it('desglosa cada concepto como la calculadora de 3dfils', () => {
    const r = calcularCoste(trabajo, tarifas.parametros)
    expect(r.desglose.material).toBeCloseTo(1.33, 2)
    expect(r.desglose.luz).toBeCloseTo(0.07, 2)
    expect(r.desglose.amortizacion).toBeCloseTo(0.23, 2)
    expect(r.desglose.mantenimiento).toBeCloseTo(0.06, 2)
    expect(r.desglose.manoDeObra).toBeCloseTo(13.0, 2)
    expect(r.desglose.extras).toBe(1.2)
  })

  it('aplica margen e IVA sobre el coste total y redondea a ,99', () => {
    const r = calcularCoste(trabajo, tarifas.parametros)
    expect(r.costeTotal).toBeCloseTo(15.89, 1)
    expect(r.precioSinIva).toBeCloseTo(22.25, 1)
    expect(r.precioFinal).toBe(26.99)
  })

  it('respeta el precio minimo por pedido', () => {
    const r = calcularCoste({ gramos: 1, horas: 0.1, minutosPreparacion: 0, minutosPostprocesado: 0 }, tarifas.parametros)
    expect(r.precioFinal).toBeGreaterThanOrEqual(tarifas.parametros.precioMinimo)
  })

  it('rechaza valores negativos', () => {
    expect(() => calcularCoste({ ...trabajo, gramos: -5 }, tarifas.parametros)).toThrow()
  })
})

describe('presupuestoChibi', () => {
  it('el mediano basico cuesta 26,99 con IVA', () => {
    expect(presupuestoChibi({ tamano: 'mediano' }).precioFinal).toBe(26.99)
  })

  it('cuanto mas grande, mas caro', () => {
    const p = presupuestoChibi({ tamano: 'pequeno' }).precioFinal
    const m = presupuestoChibi({ tamano: 'mediano' }).precioFinal
    const g = presupuestoChibi({ tamano: 'grande' }).precioFinal
    expect(p).toBeLessThan(m)
    expect(m).toBeLessThan(g)
  })

  it('cada extra sube el precio', () => {
    const base = presupuestoChibi({ tamano: 'mediano' }).precioFinal
    expect(presupuestoChibi({ tamano: 'mediano', personasExtra: 1 }).precioFinal).toBeGreaterThan(base)
    expect(presupuestoChibi({ tamano: 'mediano', baseNombre: true }).precioFinal).toBeGreaterThan(base)
    expect(presupuestoChibi({ tamano: 'mediano', acabado: 'multicolor' }).precioFinal).toBeGreaterThan(base)
    expect(presupuestoChibi({ tamano: 'mediano', acabado: 'pintado' }).precioFinal).toBeGreaterThan(base)
    expect(presupuestoChibi({ tamano: 'mediano', urgente: true }).precioFinal).toBeGreaterThan(base)
  })

  it('no expone costes ni margen en la respuesta publica', () => {
    const r = presupuestoChibi({ tamano: 'mediano' })
    expect(Object.keys(r).sort()).toEqual(['opciones', 'precioFinal'])
  })

  it('rechaza un tamano que no existe', () => {
    expect(() => presupuestoChibi({ tamano: 'gigante' })).toThrow()
  })
})

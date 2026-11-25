/**
 * Tests de las rutas de presupuestos.
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'

const CLAVE = 'clave-de-test-solo-local'

describe('GET /api/v1/presupuestos/chibi', () => {
  it('devuelve el precio del mediano sin exponer costes', async () => {
    const res = await request(app).get('/api/v1/presupuestos/chibi?tamano=mediano')
    expect(res.status).toBe(200)
    expect(res.body.data.precioFinal).toBe(26.99)
    expect(JSON.stringify(res.body)).not.toMatch(/margen|desglose|precioHora/)
  })

  it('convierte los parametros de texto de la URL', async () => {
    const res = await request(app).get('/api/v1/presupuestos/chibi?tamano=mediano&personas_extra=1&base_nombre=true&acabado=pintado&urgente=false')
    expect(res.status).toBe(200)
    expect(res.body.data.opciones).toMatchObject({ personasExtra: 1, baseNombre: true, acabado: 'pintado', urgente: false })
    expect(res.body.data.precioFinal).toBeGreaterThan(26.99)
  })

  it('rechaza opciones no validas con 400', async () => {
    expect((await request(app).get('/api/v1/presupuestos/chibi?tamano=gigante')).status).toBe(400)
    expect((await request(app).get('/api/v1/presupuestos/chibi?tamano=mediano&personas_extra=9')).status).toBe(400)
    expect((await request(app).get('/api/v1/presupuestos/chibi')).status).toBe(400)
  })
})

describe('calculadora privada', () => {
  it('GET /tarifas y POST /calcular exigen la clave', async () => {
    expect((await request(app).get('/api/v1/presupuestos/tarifas')).status).toBe(401)
    expect((await request(app).post('/api/v1/presupuestos/calcular').send({ trabajo: { gramos: 10, horas: 1 } })).status).toBe(401)
  })

  it('con clave devuelve el desglose y permite probar otros parametros', async () => {
    const res = await request(app)
      .post('/api/v1/presupuestos/calcular')
      .set('x-clave-admin', CLAVE)
      .send({ trabajo: { gramos: 60.4, horas: 2.9, minutosPreparacion: 45, minutosPostprocesado: 20, extras: 1.2 }, parametros: { iva: 0 } })
    expect(res.status).toBe(200)
    expect(res.body.data.desglose.manoDeObra).toBe(13)
    expect(res.body.data.iva).toBe(0)
  })

  it('valida el trabajo', async () => {
    const res = await request(app).post('/api/v1/presupuestos/calcular').set('x-clave-admin', CLAVE).send({ trabajo: { gramos: -1 } })
    expect(res.status).toBe(400)
  })
})

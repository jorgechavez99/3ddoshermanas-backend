/**
 * Tests de integracion de la API de productos contra una MariaDB local.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { reiniciarBaseDeDatos, pool } from './preparar.js'

beforeEach(async () => {
  await reiniciarBaseDeDatos()
})

afterAll(async () => {
  await pool.end()
})

describe('GET /api/v1/productos', () => {
  it('devuelve solo los productos visibles, del mas nuevo al mas antiguo', async () => {
    const res = await request(app).get('/api/v1/productos')
    expect(res.status).toBe(200)
    expect(res.body.error).toBe(false)
    expect(res.body.data.map((p) => p.slug)).toEqual(['soporte-funko', 'figura-chibi', 'llavero-con-nombre'])
  })

  it('filtra por escaparate', async () => {
    const res = await request(app).get('/api/v1/productos?escaparate=figuras-anime')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data.every((p) => p.escaparate === 'figuras-anime')).toBe(true)
  })

  it('devuelve el precio como numero y visible como booleano', async () => {
    const res = await request(app).get('/api/v1/productos?escaparate=regalos-personalizados')
    expect(res.body.data[0].precio_desde).toBe(4)
    expect(res.body.data[0].visible).toBe(true)
  })

  it('rechaza un escaparate que no existe con 400', async () => {
    const res = await request(app).get('/api/v1/productos?escaparate=coches')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
  })
})

/**
 * Tests de las rutas de escritura: proteccion con clave y validaciones.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { reiniciarBaseDeDatos, pool } from './preparar.js'

const CLAVE = 'clave-de-test-solo-local'
const nuevo = {
  nombre: 'Placa con nombre',
  slug: 'placa-con-nombre',
  escaparate: 'regalos-personalizados',
  descripcion: 'Placa para la puerta de la habitación',
  precio_desde: 12.5,
}

beforeEach(async () => {
  await reiniciarBaseDeDatos()
})

afterAll(async () => {
  await pool.end()
})

const contarProductos = async () => {
  const [filas] = await pool.query('SELECT COUNT(*) AS total FROM productos')
  return filas[0].total
}

describe('POST /api/v1/productos', () => {
  it('sin clave responde 401 y no crea nada', async () => {
    const res = await request(app).post('/api/v1/productos').send(nuevo)
    expect(res.status).toBe(401)
    expect(await contarProductos()).toBe(4)
  })

  it('con clave incorrecta responde 401', async () => {
    const res = await request(app).post('/api/v1/productos').set('x-clave-admin', 'otra').send(nuevo)
    expect(res.status).toBe(401)
    expect(await contarProductos()).toBe(4)
  })

  it('con clave crea el producto (201) y aparece en el listado publico', async () => {
    const res = await request(app).post('/api/v1/productos').set('x-clave-admin', CLAVE).send(nuevo)
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ slug: 'placa-con-nombre', precio_desde: 12.5, visible: true })
    const lista = await request(app).get('/api/v1/productos?escaparate=regalos-personalizados')
    expect(lista.body.data.map((p) => p.slug)).toContain('placa-con-nombre')
  })

  it('slug repetido responde 400 con mensaje claro', async () => {
    const res = await request(app)
      .post('/api/v1/productos')
      .set('x-clave-admin', CLAVE)
      .send({ ...nuevo, slug: 'figura-chibi' })
    expect(res.status).toBe(400)
    expect(res.body.msg).toContain('ya existe un producto con ese slug')
  })

  it('datos invalidos responden 400 con los motivos', async () => {
    const res = await request(app)
      .post('/api/v1/productos')
      .set('x-clave-admin', CLAVE)
      .send({ nombre: 'X', slug: 'Con Espacios', escaparate: 'coches', precio_desde: -3 })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe(true)
    expect(res.body.msg.length).toBeGreaterThanOrEqual(4)
  })

  it('JSON mal formado responde 400', async () => {
    const res = await request(app)
      .post('/api/v1/productos')
      .set('x-clave-admin', CLAVE)
      .set('Content-Type', 'application/json')
      .send('{"nombre":')
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/v1/productos/:id', () => {
  it('actualiza un producto existente', async () => {
    const res = await request(app)
      .put('/api/v1/productos/2')
      .set('x-clave-admin', CLAVE)
      .send({ ...nuevo, slug: 'figura-chibi', escaparate: 'figuras-anime', precio_desde: 22 })
    expect(res.status).toBe(200)
    expect(res.body.data.precio_desde).toBe(22)
  })

  it('responde 404 si el producto no existe', async () => {
    const res = await request(app).put('/api/v1/productos/999').set('x-clave-admin', CLAVE).send(nuevo)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/v1/productos/:id/ocultar', () => {
  it('oculta el producto y deja de salir en el listado publico', async () => {
    const res = await request(app).patch('/api/v1/productos/1/ocultar').set('x-clave-admin', CLAVE)
    expect(res.status).toBe(200)
    const lista = await request(app).get('/api/v1/productos')
    expect(lista.body.data.map((p) => p.slug)).not.toContain('llavero-con-nombre')
  })

  it('responde 400 con un id no numerico y 404 si no existe', async () => {
    expect((await request(app).patch('/api/v1/productos/abc/ocultar').set('x-clave-admin', CLAVE)).status).toBe(400)
    expect((await request(app).patch('/api/v1/productos/999/ocultar').set('x-clave-admin', CLAVE)).status).toBe(404)
  })
})

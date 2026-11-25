# 3D Dos Hermanas - API

API del catálogo de productos de 3D Dos Hermanas. La web (repo `3ddoshermanas-frontend`) la usa para mostrar la galería de cada escaparate; Jorge y Mary la usan para añadir productos sin tocar código.

## Qué hace

- Lista los productos visibles, de todos o de un escaparate.
- Crea, edita y oculta productos, solo con la clave de administrador.
- Valida los datos de entrada y responde siempre con el mismo formato.

## Tecnologías

Node.js 22, Express 4, MySQL / MariaDB (mysql2), express-validator, cors, dotenv. Tests con Vitest y Supertest.

## Puesta en marcha

```bash
git clone https://github.com/jorgechavez99/3ddoshermanas-backend.git
cd 3ddoshermanas-backend
npm install
cp .env_template .env              # rellenar datos de MySQL y CLAVE_ADMIN
mysql -u <usuario> -p tienda3d < models/queries.sql
npm run semilla                    # opcional: productos de ejemplo
npm run dev
```

Comprobar: http://127.0.0.1:4010/api/v1/salud

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Arranca con nodemon |
| `npm start` | Arranca en producción |
| `npm test` | Tests de integración (necesita MySQL local y `.env.test`, ver plantilla) |
| `npm run semilla` | Carga 9 productos de ejemplo sin duplicar |

## Variables de entorno

| Variable | Para qué sirve | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto de la API (solo escucha en 127.0.0.1) | `4010` |
| `DB_HOST` / `DB_PORT` | Servidor MySQL | `localhost` / `3306` |
| `DB_USER` / `DB_PASSWORD` | Usuario de MySQL | `app3d` / (secreto) |
| `DB_NAME` | Base de datos | `tienda3d` |
| `CLAVE_ADMIN` | Clave para crear, editar y ocultar | 64 caracteres aleatorios |
| `ORIGEN_WEB` | Dominios que pueden llamar desde el navegador | `https://3ddoshermanas.com` |

## Estructura de carpetas

```
app.js            # arranque: middlewares, rutas /api/v1/..., listen
configs/          # pool de MySQL
routers/          # productosRouter.js: solo define rutas
controllers/      # productosController.js: req/res, status, try/catch
models/           # modelProductos.js, queriesProductos.js, queries.sql
middlewares/      # validaciones (express-validator) y validarAdmin
scripts/          # semilla.js
tests/            # tests de integración
deploy/           # configuración de PM2
```

## Endpoints

Todas las respuestas: `{ error: false, msg: ['...'], data }` o `{ error: true, msg: ['...'] }`.

| Método | Ruta | Qué hace | Body |
| --- | --- | --- | --- |
| GET | `/api/v1/salud` | Comprueba que la API funciona | - |
| GET | `/api/v1/productos?escaparate=` | Lista los visibles (escaparate opcional: `regalos-personalizados`, `figuras-anime`, `piezas-repuestos-3d`) | - |
| POST | `/api/v1/productos` | Crea un producto (admin) | `nombre, slug, escaparate, precio_desde, descripcion?, foto_url?` |
| PUT | `/api/v1/productos/:id` | Actualiza un producto (admin) | lo mismo + `visible?` |
| PATCH | `/api/v1/productos/:id/ocultar` | Lo quita de la web sin borrarlo (admin) | - |

Las rutas de admin necesitan la cabecera `x-clave-admin: <CLAVE_ADMIN>`. Ejemplo:

```bash
curl -X POST https://api.3ddoshermanas.com/api/v1/productos \
  -H "Content-Type: application/json" -H "x-clave-admin: $CLAVE_ADMIN" \
  -d '{"nombre":"Llavero Pikachu","slug":"llavero-pikachu","escaparate":"figuras-anime","precio_desde":5}'
```

## Decisiones y pendientes

- Clave de administrador en vez de usuarios y login: hay dos personas que editan; cuando haya panel se pasará a usuarios con Auth0 o JWT.
- Ocultar en vez de borrar: no se pierde el historial.
- Las fotos son URLs (carpeta servida por Nginx); falta un endpoint de subida de fotos.
- Pendiente: panel de administración, pedidos, pagos.

## Autores

Jorge Chávez y Mary - 3D Dos Hermanas.

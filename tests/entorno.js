// Carga las variables de .env.test antes de importar la app en los tests.
require('dotenv').config({ path: require('node:path').join(__dirname, '../.env.test'), override: true })

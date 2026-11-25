/**
 * Conexion a MySQL con un pool de conexiones (mysql2/promise).
 * Los datos de conexion vienen de .env; nunca se escriben en el codigo.
 */
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // DECIMAL llega como texto por defecto; lo pedimos como numero.
  decimalNumbers: true,
  charset: 'utf8mb4',
})

module.exports = { pool }

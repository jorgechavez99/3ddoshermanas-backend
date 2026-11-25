/**
 * Configuracion de PM2 de la API en el VPS.
 * Escucha solo en 127.0.0.1:4010; Nginx la publica en api.3ddoshermanas.com.
 */
module.exports = {
  apps: [
    {
      name: '3ddoshermanas-api',
      cwd: '/var/www/3ddoshermanas-backend',
      script: 'app.js',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '200M',
    },
  ],
}

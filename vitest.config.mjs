import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // Todos los tests comparten la misma base de datos: se ejecutan en serie.
    fileParallelism: false,
    setupFiles: ['./tests/entorno.js'],
  },
})

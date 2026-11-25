-- Esquema de la base de datos de 3D Dos Hermanas.
-- Ejecutar una vez en el servidor: mysql -u <usuario> -p tienda3d < models/queries.sql

CREATE TABLE IF NOT EXISTS productos (
  id_producto   INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  slug          VARCHAR(140) NOT NULL UNIQUE,
  escaparate    ENUM('regalos-personalizados', 'figuras-anime', 'piezas-repuestos-3d') NOT NULL,
  descripcion   VARCHAR(500) NOT NULL DEFAULT '',
  precio_desde  DECIMAL(6,2) NOT NULL,
  foto_url      VARCHAR(255) NULL,
  visible       BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_escaparate_visible (escaparate, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

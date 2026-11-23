-- Stella Maris Joyas — estructura de la base (solo referencia).
-- No hace falta importarlo: el servidor crea las tablas solo al arrancar
-- y pone al día solo las bases de versiones anteriores.


CREATE TABLE IF NOT EXISTS `ajustes` (
  `clave` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contadores` (
  `nombre` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ultimo` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `fotos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `datos` mediumblob NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pendientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` int unsigned NOT NULL,
  `foto_id` int NOT NULL,
  `material` enum('oro','plata','acero','plata-oro') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subcategoria` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `variante` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` int unsigned NOT NULL DEFAULT '0',
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `detalle` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `borrada_en` datetime DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_borrada` (`borrada_en`),
  KEY `fk_pend_foto` (`foto_id`),
  CONSTRAINT `fk_pend_foto` FOREIGN KEY (`foto_id`) REFERENCES `fotos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `piezas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material` enum('oro','plata','acero','plata-oro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategoria` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `variante` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` int unsigned NOT NULL,
  `detalle` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `estado` enum('disponible','reservado','vendido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'disponible',
  `ingreso` date NOT NULL,
  `foto_id` int DEFAULT NULL,
  `reserva_cliente` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reserva_sena` int unsigned DEFAULT NULL,
  `reserva_fecha` date DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_estado` (`estado`),
  KEY `fk_pieza_foto` (`foto_id`),
  CONSTRAINT `fk_pieza_foto` FOREIGN KEY (`foto_id`) REFERENCES `fotos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'duena',
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pieza_id` int NOT NULL,
  `codigo` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material` enum('oro','plata','acero','plata-oro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategoria` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `variante` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` int unsigned NOT NULL,
  `sena` int unsigned NOT NULL DEFAULT '0',
  `medio_pago` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendido_por` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fecha` (`fecha`),
  KEY `fk_venta_pieza` (`pieza_id`),
  CONSTRAINT `fk_venta_pieza` FOREIGN KEY (`pieza_id`) REFERENCES `piezas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO contadores (nombre, ultimo) VALUES ('oro',0),('plata',0),('acero',0),('plata-oro',0),('foto',0);

SET
SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET
time_zone = "+00:00";

CREATE
DATABASE IF NOT EXISTS `central_reservas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `central_reservas`;

-- Eliminar tablas respetando el orden de dependencias
DROP TABLE IF EXISTS cancelaciones;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS recursos;
DROP TABLE IF EXISTS tipos_recurso;
DROP TABLE IF EXISTS usuarios;



-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de recurso (hotel, museo, ruta...)
CREATE TABLE tipos_recurso (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla de recursos turísticos
CREATE TABLE recursos (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    plazas INT NOT NULL,
    precio DECIMAL(8,2) NOT NULL,
    id_tipo INT,
    FOREIGN KEY (id_tipo) REFERENCES tipos_recurso(id_tipo)
);

-- Tabla de reservas
CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_recurso INT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    confirmada BOOLEAN DEFAULT FALSE,
    total_precio DECIMAL(8,2),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_recurso) REFERENCES recursos(id_recurso)
);

-- Tabla de cancelaciones
CREATE TABLE cancelaciones (
    id_cancelacion INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT,
    fecha_cancelacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-07-2025 a las 23:05:10
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ferremas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `id_pago` varchar(255) DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'pendiente',
  `estado_pago` varchar(50) DEFAULT 'Pendiente',
  `productos` longtext NOT NULL,
  `comprador_nombre` varchar(255) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `id_pago`, `cliente_id`, `usuario_id`, `estado`, `estado_pago`, `productos`, `comprador_nombre`, `total`, `fecha`) VALUES
(5, '1324013966', NULL, NULL, 'aceptado', 'Pendiente', '', NULL, NULL, '2025-07-10 15:41:43'),
(6, '1339015581', NULL, NULL, 'preparado', 'Pendiente', '', NULL, NULL, '2025-07-10 15:43:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `Nombre` varchar(255) NOT NULL,
  `Descripcion` varchar(255) NOT NULL,
  `Precio` int(11) NOT NULL,
  `Imagen` varchar(255) NOT NULL,
  `categoria` varchar(100) NOT NULL DEFAULT 'Sin categoría'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `Nombre`, `Descripcion`, `Precio`, `Imagen`, `categoria`) VALUES
(1, 'Set Eléctrico', 'Kit Eléctrico 17 Accesorios', 1500, 'assets/img/SetElectrico.png', 'Herramientas Eléctricas'),
(2, 'Taladro', 'Taladro percutor Inal DeWALT', 2000, 'assets/img/taladrobosch.jpg', 'Herramientas Eléctricas'),
(3, 'Llave Inglesa', 'Llave Inglesa Pavonada 87-046 Stanley', 2000, 'assets/img/LlaveInglesa.jpg', 'Herramientas Manuales'),
(4, 'Martillo', 'Martillo carpintero 20 Oz acero', 1500, 'assets/img/martillo.jpg', 'Herramientas Manuales'),
(5, 'Set Llaves MAKITA', 'Set de Llaves y Dados de 172 piezas', 1800, 'assets/img/SetLlavesMakita.jpg', 'Herramientas Manuales');

-- --------------------------------------------------------


-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `NombreCompleto` varchar(255) NOT NULL,
  `Rol` varchar(255) NOT NULL,
  `Correo` varchar(255) NOT NULL,
  `Clave` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `NombreCompleto`, `Rol`, `Correo`, `Clave`) VALUES
(1, 'joseeee', 'Admin', 'jose123@gmail.com', '$2b$10$RDu0t3svRAvbgOmwJNkhAO1RKX6pUgAZMRt/XydIo/oM5l6x50XXu'),
(2, 'Gabo31082001', 'Cliente', 'gab1@gmail.com', '$2b$10$qUT1FqbFiyEYwSQgXGZshe9R9NIqOR5XThhCpVs0hye3xcch9SeFq'),
(3, 'bodeguero', 'Bodeguero', 'bodega@gmail.com', '$2b$10$ipxrKCL.2dKgplqNV3pLl.UC4/Fguw3aT1Erg9SKKKQE5Gy3v.juK'),
(4, 'Yulied Quintero', 'Admin', 'ya.quintero@gmail.com', '$2b$10$p4dwa8kDSeUTQ1kjrTuzdu27Um9mZUw8NHiQbEALMGQgVIcpdFHvy'),
(5, 'Ana', 'Admin', 'ana123@gmail.com', '$2b$10$uqihJqdKFq2t/lr7RPuCtOHsF20bGC.RON8iuVWE2r1mPi/hBvtx.'),
(6, 'Juan López', 'Bodeguero', 'Juan123@gmail.com', '$2b$10$Mt7J5nAD3b8oQuIfLGyStumyJUQe.9V32EleurtF0SAPG44hccUqO'),
(10, 'kee', 'Bodeguero', 'kee@gmail.com', '$2b$10$4.x9XiCLsT4MtVbnPhrdMu.AibBHJl88Vaqm7.EGGXC84W3aOTpZ.');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Correo` (`Correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

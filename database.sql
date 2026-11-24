-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-11-2026 a las 22:40:31
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `llegaya`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(4, 'Bebidas'),
(3, 'Empanadas'),
(1, 'Hamburguesas'),
(2, 'Pizzas'),
(5, 'Postres');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` int(10) UNSIGNED NOT NULL,
  `id_pedido` int(10) UNSIGNED NOT NULL,
  `id_producto` int(10) UNSIGNED NOT NULL,
  `cantidad` int(10) UNSIGNED NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id_detalle`, `id_pedido`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 2, 6500.00, 13000.00),
(2, 1, 6, 1, 2800.00, 2800.00),
(3, 2, 1, 2, 6500.00, 13000.00),
(4, 2, 6, 1, 2800.00, 2800.00),
(5, 3, 1, 1, 6500.00, 6500.00),
(6, 4, 1, 1, 6500.00, 6500.00),
(7, 4, 6, 1, 2800.00, 2800.00),
(8, 5, 8, 2, 3200.00, 6400.00),
(9, 5, 3, 1, 9000.00, 9000.00),
(10, 5, 9, 1, 2500.00, 2500.00),
(11, 5, 5, 1, 12000.00, 12000.00),
(12, 6, 8, 2, 3200.00, 6400.00),
(13, 6, 3, 1, 9000.00, 9000.00),
(14, 6, 9, 1, 2500.00, 2500.00),
(15, 6, 5, 1, 12000.00, 12000.00),
(16, 7, 8, 2, 3200.00, 6400.00),
(17, 7, 3, 1, 9000.00, 9000.00),
(18, 7, 9, 1, 2500.00, 2500.00),
(19, 7, 5, 1, 12000.00, 12000.00),
(20, 8, 8, 2, 3200.00, 6400.00),
(21, 8, 3, 1, 9000.00, 9000.00),
(22, 8, 9, 1, 2500.00, 2500.00),
(23, 8, 5, 1, 12000.00, 12000.00),
(24, 9, 8, 1, 3200.00, 3200.00),
(25, 10, 5, 1, 12000.00, 12000.00),
(26, 10, 8, 1, 3200.00, 3200.00),
(27, 11, 8, 1, 3200.00, 3200.00),
(28, 11, 5, 1, 12000.00, 12000.00),
(29, 12, 8, 1, 3200.00, 3200.00),
(30, 12, 5, 1, 12000.00, 12000.00),
(31, 13, 5, 1, 12000.00, 12000.00),
(32, 13, 6, 1, 2800.00, 2800.00),
(33, 14, 8, 1, 3200.00, 3200.00),
(34, 14, 5, 1, 12000.00, 12000.00),
(35, 15, 6, 1, 2800.00, 2800.00),
(36, 15, 8, 1, 3200.00, 3200.00),
(37, 16, 7, 1, 1500.00, 1500.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id_pago` int(10) UNSIGNED NOT NULL,
  `id_pedido` int(10) UNSIGNED NOT NULL,
  `mp_preference_id` varchar(100) DEFAULT NULL,
  `mp_payment_id` varchar(100) DEFAULT NULL,
  `metodo` varchar(50) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','aprobado','rechazado','cancelado') NOT NULL DEFAULT 'pendiente',
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagos`
--

INSERT INTO `pagos` (`id_pago`, `id_pedido`, `mp_preference_id`, `mp_payment_id`, `metodo`, `monto`, `estado`, `fecha`) VALUES
(1, 1, '3856149108-6ab83a89-18d6-4a59-bc44-3b03554ec2c6', NULL, NULL, 15800.00, 'pendiente', '2026-11-17 21:26:55'),
(2, 2, '3856149108-c9691baf-84de-484e-934f-0fa05b061720', NULL, NULL, 15800.00, 'pendiente', '2026-11-17 21:31:56'),
(3, 3, '3856149108-21d250a4-c108-4e08-88b8-081d017ceb2e', NULL, NULL, 6500.00, 'pendiente', '2026-11-17 21:38:25'),
(4, 4, '3856149108-abeb6e9a-4902-4459-acc9-c8af4b05cae2', NULL, NULL, 9300.00, 'pendiente', '2026-11-17 21:39:10'),
(5, 5, '3856149108-e2845594-c9c9-4ebc-a343-44b9e42e63c7', NULL, NULL, 29900.00, 'pendiente', '2026-11-17 23:26:08'),
(6, 6, '3856149108-598a2cf1-175a-452e-8aa7-5d834220327c', NULL, NULL, 29900.00, 'pendiente', '2026-11-17 23:53:33'),
(7, 7, '3856149108-cef8344d-b413-43d9-b816-9363aa3ea803', NULL, NULL, 29900.00, 'pendiente', '2026-11-18 00:06:41'),
(8, 8, '3856149108-f0ac96a9-b9ad-470f-ad57-c7d7cbcbba03', NULL, NULL, 29900.00, 'pendiente', '2026-11-18 18:10:21'),
(9, 9, '3856149108-f434dab7-f4f9-4b59-acac-6b1a426c370d', NULL, NULL, 3200.00, 'pendiente', '2026-11-18 18:12:39'),
(10, 10, '3856149108-d6efaec4-cf55-429d-b490-15f56d748d84', NULL, NULL, 15200.00, 'pendiente', '2026-11-19 00:38:24'),
(11, 12, '3856149108-4b4a8df9-4b9e-412a-abd5-044606cbe048', NULL, NULL, 15200.00, 'pendiente', '2026-11-19 13:26:34'),
(12, 13, '3856149108-3cc22ff9-3197-4e03-a037-92a365986eac', NULL, NULL, 14800.00, 'pendiente', '2026-11-19 13:36:58'),
(13, 14, '3856149108-8ace3be3-8425-4804-bf58-e2bb515c7520', NULL, NULL, 15200.00, 'pendiente', '2026-11-19 14:38:41'),
(14, 15, '3856149108-3e0653d0-43e8-410c-afd9-e01e63b8f3f7', NULL, NULL, 6000.00, 'pendiente', '2026-11-20 18:57:46'),
(15, 16, '3856149108-b555d233-e8ce-47bc-964d-6819078ad4fd', NULL, NULL, 1500.00, 'pendiente', '2026-11-24 19:22:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `direccion_entrega` varchar(200) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagado','en_camino','entregado','cancelado') NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `id_usuario`, `fecha`, `direccion_entrega`, `observaciones`, `total`, `estado`) VALUES
(1, 1, '2026-11-17 21:26:54', 'Calle Falsa 123', NULL, 15800.00, 'pendiente'),
(2, 1, '2026-11-17 21:31:56', 'Calle Falsa 123', NULL, 15800.00, 'pendiente'),
(3, 1, '2026-11-17 21:38:24', 'Calle Falsa 123', NULL, 6500.00, 'pendiente'),
(4, 1, '2026-11-17 21:39:09', 'Calle Falsa 123', NULL, 9300.00, 'pendiente'),
(5, 2, '2026-11-17 23:26:08', 'mendoza 173', ',', 29900.00, 'pendiente'),
(6, 2, '2026-11-17 23:53:32', 'mendoza 173', NULL, 29900.00, 'pendiente'),
(7, 2, '2026-11-18 00:06:40', 'mendoza 173', NULL, 29900.00, 'pendiente'),
(8, 2, '2026-11-18 18:10:20', 'mendoza 173', NULL, 29900.00, 'pendiente'),
(9, 2, '2026-11-18 18:12:37', 'sarmiento 187', 'cfhd', 3200.00, 'pendiente'),
(10, 3, '2026-11-19 00:38:23', 'mendoza 234', NULL, 15200.00, 'en_camino'),
(11, 3, '2026-11-19 13:26:14', 'ieeiwneifnws', NULL, 15200.00, 'cancelado'),
(12, 3, '2026-11-19 13:26:33', 'ieeiwneifnws', NULL, 15200.00, 'en_camino'),
(13, 3, '2026-11-19 13:36:57', 'ybuyv', NULL, 14800.00, 'pendiente'),
(14, 3, '2026-11-19 14:38:40', '.', NULL, 15200.00, 'pendiente'),
(15, 3, '2026-11-20 18:57:45', 'wdwefdwe', NULL, 6000.00, 'pendiente'),
(16, 3, '2026-11-24 19:22:07', 'mendoza 123', NULL, 1500.00, 'entregado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(10) UNSIGNED NOT NULL,
  `id_categoria` int(10) UNSIGNED DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `id_categoria`, `nombre`, `descripcion`, `precio`, `imagen`, `stock`, `activo`, `fecha_creacion`) VALUES
(1, 1, 'Hamburguesa Clásica', 'Carne, lechuga, tomate y queso', 6500.00, 'hamburguesa-simple.jpg.jpg', 50, 1, '2026-11-17 17:55:51'),
(2, 1, 'Hamburguesa Doble', 'Doble carne, cheddar y panceta', 8500.00, 'hamburguesa-doble.jpg.jpg', 40, 1, '2026-11-17 17:55:51'),
(3, 2, 'Pizza Muzzarella', 'Pizza grande con muzzarella y aceitunas', 9000.00, 'pizza-muzzarella.jpg.jpg', 30, 1, '2026-11-17 17:55:51'),
(4, 2, 'Pizza Napolitana', 'Muzzarella, tomate, ajo y albahaca', 9800.00, 'pizza-napolitana.jpg.jpg', 30, 1, '2026-11-17 17:55:51'),
(5, 3, 'Docena de empanadas', 'Carne, pollo o jamón y queso', 12000.00, 'docena-de-empanadas.jpg.jpg', 25, 1, '2026-11-17 17:55:51'),
(6, 4, 'Gaseosa 1.5 L', 'Cola, lima-limón o naranja', 2800.00, 'gaseosa.jpg.jpg', 100, 1, '2026-11-17 17:55:51'),
(7, 4, 'Agua mineral 500 ml', 'Sin gas', 1500.00, 'agua-mineral.jpg.jpg', 87, 1, '2026-11-17 17:55:51'),
(8, 5, 'Flan con dulce de leche', 'Porción individual con crema', 3200.00, 'flan-dulce-de-leche.jpg.jpg', 20, 1, '2026-11-17 17:55:51'),
(9, 4, 'Jugo de naranja', 'Exprimido', 2500.00, 'exprimido-de-naranja.jpg.jpg', 30, 1, '2026-11-17 20:24:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `rol` enum('cliente','admin') NOT NULL DEFAULT 'cliente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `email`, `password`, `telefono`, `direccion`, `rol`, `fecha_registro`) VALUES
(1, 'Ana', 'Perez', 'ana@test.com', '$2b$10$TFJnmxU4G6jRlDPo1GSYE.cNSJrGDyTFfnWB77xVCXR/UO9Yrg4nC', NULL, NULL, 'admin', '2026-11-17 18:14:12'),
(2, 'julieta', 'fauret', 'julietafauret08@gmail.com', '$2b$10$7lDdxiXOuAobOyMX4taRFuaQJ9d1o4wZ2PJB1v1Phtpk5cicX.Ud2', '2281323477', 'mendoza 173', 'admin', '2026-11-17 23:00:48'),
(3, 'Maria', 'Lopez', 'marialopez@gmail.com', '$2b$10$tD8bmspnz9fFNCI3/TSyfuY4PjFPtmuofU..8Jh62wvh5wvvaGwrO', '2281595959', 'mendoza 234', 'cliente', '2026-11-19 00:37:08');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `uq_categorias_nombre` (`nombre`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `idx_detalle_pedido` (`id_pedido`),
  ADD KEY `idx_detalle_producto` (`id_producto`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `idx_pagos_pedido` (`id_pedido`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `idx_pedidos_usuario` (`id_usuario`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `idx_productos_categoria` (`id_categoria`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uq_usuarios_email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id_pago` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `fk_pagos_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedidos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

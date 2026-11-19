const pool = require('../db');
const { Preference } = require('mercadopago');
const mp = require('../mercadopago');

class ErrorNegocio extends Error {}

const redondear = (n) => Math.round(n * 100) / 100;

// Crea el pedido con sus ítems y genera el link de pago de Mercado Pago
exports.crear = async (req, res) => {
  const { direccion_entrega, observaciones, items } = req.body;

  if (!direccion_entrega || !direccion_entrega.trim()) {
    return res.status(400).json({ error: 'Ingresá la dirección de entrega' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  // Unimos productos repetidos y validamos cantidades
  const cantidades = new Map();
  for (const it of items) {
    const id = Number(it.id_producto);
    const cant = Number(it.cantidad);
    if (!Number.isInteger(id) || !Number.isInteger(cant) || cant < 1) {
      return res.status(400).json({ error: 'Hay un ítem inválido en el carrito' });
    }
    cantidades.set(id, (cantidades.get(id) || 0) + cant);
  }

  const conn = await pool.getConnection();
  const detalle = [];
  let total = 0;
  let id_pedido;

  try {
    await conn.beginTransaction();

    // Los precios se leen de la base: nunca se confía en los precios que manda el front
    for (const [id, cant] of cantidades) {
      const [filas] = await conn.query(
        'SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto = ? AND activo = 1',
        [id]
      );
      if (filas.length === 0) {
        throw new ErrorNegocio('Un producto del carrito ya no está disponible');
      }
      const p = filas[0];
      if (p.stock < cant) {
        throw new ErrorNegocio(`No hay stock suficiente de "${p.nombre}" (quedan ${p.stock})`);
      }
      const precio = Number(p.precio);
      total += precio * cant;
      detalle.push({ id_producto: p.id_producto, nombre: p.nombre, cantidad: cant, precio });
    }
    total = redondear(total);

    const [r] = await conn.query(
      `INSERT INTO pedidos (id_usuario, direccion_entrega, observaciones, total)
       VALUES (?, ?, ?, ?)`,
      [req.usuario.id, direccion_entrega.trim(), observaciones || null, total]
    );
    id_pedido = r.insertId;

    for (const d of detalle) {
      await conn.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [id_pedido, d.id_producto, d.cantidad, d.precio, redondear(d.precio * d.cantidad)]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    if (err instanceof ErrorNegocio) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Error en el servidor' });
  } finally {
    conn.release();
  }

  // Generar el link de pago en Mercado Pago
  try {
    const front = process.env.FRONT_URL;
    const preferencia = await new Preference(mp).create({
      body: {
        items: detalle.map((d) => ({
          id: String(d.id_producto),
          title: d.nombre,
          quantity: d.cantidad,
          unit_price: d.precio,
          currency_id: 'ARS'
        })),
        external_reference: String(id_pedido),
        back_urls: {
          success: `${front}/pago/resultado`,
          failure: `${front}/pago/resultado`,
          pending: `${front}/pago/resultado`
        }
      }
    });

    await pool.query(
      'INSERT INTO pagos (id_pedido, mp_preference_id, monto) VALUES (?, ?, ?)',
      [id_pedido, preferencia.id, total]
    );

    res.status(201).json({ id_pedido, total, init_point: preferencia.init_point });
  } catch (err) {
    console.error('Error con Mercado Pago:', err);
    await pool.query("UPDATE pedidos SET estado = 'cancelado' WHERE id_pedido = ?", [id_pedido]);
    res.status(502).json({ error: 'No se pudo iniciar el pago, intentá de nuevo' });
  }
};

// Historial de pedidos del usuario logueado
exports.misPedidos = async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT p.id_pedido, p.fecha, p.total, p.estado, p.direccion_entrega,
              (SELECT estado FROM pagos WHERE id_pedido = p.id_pedido
               ORDER BY id_pago DESC LIMIT 1) AS estado_pago
       FROM pedidos p
       WHERE p.id_usuario = ?
       ORDER BY p.fecha DESC`,
      [req.usuario.id]
    );
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Detalle de un pedido (el dueño o un admin)
exports.obtener = async (req, res) => {
  try {
    const [peds] = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [req.params.id]);
    if (peds.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const pedido = peds[0];
    if (pedido.id_usuario !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tenés acceso a este pedido' });
    }

    const [items] = await pool.query(
      `SELECT d.id_producto, pr.nombre, pr.imagen, d.cantidad, d.precio_unitario, d.subtotal
       FROM detalle_pedido d
       JOIN productos pr ON pr.id_producto = d.id_producto
       WHERE d.id_pedido = ?`,
      [req.params.id]
    );
    res.json({ ...pedido, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Solo admin: todos los pedidos
exports.listarTodos = async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT p.id_pedido, p.fecha, p.total, p.estado, p.direccion_entrega,
              u.nombre, u.apellido, u.email
       FROM pedidos p
       JOIN usuarios u ON u.id_usuario = p.id_usuario
       ORDER BY p.fecha DESC`
    );
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Solo admin: cambiar el estado (pagado -> en_camino -> entregado)
exports.cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const validos = ['pendiente', 'pagado', 'en_camino', 'entregado', 'cancelado'];
    if (!validos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const [r] = await pool.query('UPDATE pedidos SET estado = ? WHERE id_pedido = ?', [
      estado,
      req.params.id
    ]);
    if (r.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
// Solo admin: obtener métricas para el dashboard
exports.obtenerMetricas = async (req, res) => {
  try {
    // 1. Total recaudado (solo pedidos pagados o entregados)
    const [recaudacion] = await pool.query(
      "SELECT SUM(total) AS total FROM pedidos WHERE estado IN ('pagado', 'entregado')"
    );
    
    // 2. Cantidad total de pedidos
    const [pedidosTotales] = await pool.query("SELECT COUNT(*) AS total FROM pedidos");
    
    // 3. Ventas de hoy
    const [ventasHoy] = await pool.query(
      "SELECT COUNT(*) AS total FROM pedidos WHERE DATE(fecha) = CURDATE()"
    );

    res.json({
      recaudacionTotal: recaudacion[0].total || 0,
      pedidosTotales: pedidosTotales[0].total || 0,
      ventasHoy: ventasHoy[0].total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
};
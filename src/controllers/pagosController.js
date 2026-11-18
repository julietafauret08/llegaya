const pool = require('../db');
const { Payment } = require('mercadopago');
const mp = require('../mercadopago');

const traducirEstado = (s) => {
  if (s === 'approved') return 'aprobado';
  if (s === 'rejected') return 'rechazado';
  if (['cancelled', 'refunded', 'charged_back'].includes(s)) return 'cancelado';
  return 'pendiente'; // pending, in_process, authorized
};

exports.confirmar = async (req, res) => {
  const { payment_id } = req.body;
  if (!payment_id) {
    return res.status(400).json({ error: 'Falta el payment_id' });
  }

  // 1) Consultar el pago directamente a Mercado Pago
  let pagoMP;
  try {
    pagoMP = await new Payment(mp).get({ id: payment_id });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'No se pudo verificar el pago en Mercado Pago' });
  }

  const id_pedido = Number(pagoMP.external_reference);
  const estadoPago = traducirEstado(pagoMP.status);

  const conn = await pool.getConnection();
  try {
    // 2) Validar que el pedido exista, sea del usuario y el monto coincida
    const [peds] = await conn.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id_pedido]);
    if (peds.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const pedido = peds[0];
    if (pedido.id_usuario !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tenés acceso a este pedido' });
    }
    if (Math.abs(Number(pagoMP.transaction_amount) - Number(pedido.total)) > 0.01) {
      return res.status(400).json({ error: 'El monto del pago no coincide con el pedido' });
    }

    // 3) Guardar el resultado
    await conn.beginTransaction();

    await conn.query(
      'UPDATE pagos SET mp_payment_id = ?, metodo = ?, estado = ? WHERE id_pedido = ?',
      [String(pagoMP.id), pagoMP.payment_method_id || null, estadoPago, id_pedido]
    );

    if (estadoPago === 'aprobado') {
      // Solo pasa de pendiente a pagado una vez (si se llama dos veces no descuenta stock doble)
      const [upd] = await conn.query(
        "UPDATE pedidos SET estado = 'pagado' WHERE id_pedido = ? AND estado = 'pendiente'",
        [id_pedido]
      );
      if (upd.affectedRows === 1) {
        const [items] = await conn.query(
          'SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ?',
          [id_pedido]
        );
        for (const it of items) {
          await conn.query(
            'UPDATE productos SET stock = IF(stock >= ?, stock - ?, 0) WHERE id_producto = ?',
            [it.cantidad, it.cantidad, it.id_producto]
          );
        }
      }
    }

    await conn.commit();

    const [[actual]] = await conn.query('SELECT estado FROM pedidos WHERE id_pedido = ?', [id_pedido]);
    res.json({ id_pedido, estado_pago: estadoPago, estado_pedido: actual.estado });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  } finally {
    conn.release();
  }
};
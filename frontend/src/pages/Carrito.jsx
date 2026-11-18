import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearPrecio } from '../utils/formato.js';
import { toast } from '../utils/alertas.js';

export default function Carrito() {
  const { items, cambiarCantidad, quitar, vaciar, total, cantidadTotal } = useCart();
  const { usuario, token } = useAuth(); // Aseguramos usar el token del AuthContext
  const navigate = useNavigate();

  const [direccion, setDireccion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleFinalizarCompra = async () => {
    if (!usuario) {
      toast('Tenés que iniciar sesión para comprar');
      navigate('/login', { state: { desde: '/carrito' } });
      return;
    }
    if (items.length === 0) {
      toast('El carrito está vacío');
      return;
    }
    if (!direccion.trim()) {
      toast('Ingresá la dirección de entrega');
      return;
    }

    setProcesando(true);
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          direccion_entrega: direccion.trim(),
          observaciones: observaciones.trim() || null,
          items: items.map((i) => ({
            id_producto: i.id_producto,
            cantidad: i.cantidad
          }))
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast(data.error || 'No se pudo crear el pedido');
        setProcesando(false);
        return;
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast('No se pudo iniciar el pago');
        setProcesando(false);
      }
    } catch (err) {
      console.error(err);
      toast('Error de conexión');
      setProcesando(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="carrito carrito--vacio">
        <h1>Tu carrito está vacío</h1>
        <p>Todavía no agregaste ningún producto.</p>
        <Link to="/" className="boton">Ver catálogo</Link>
      </section>
    );
  }

  return (
    <section className="carrito">
      <h1>Tu carrito ({cantidadTotal} {cantidadTotal === 1 ? 'ítem' : 'ítems'})</h1>

      <ul className="carrito__lista">
        {items.map((item) => (
          <li key={item.id_producto} className="carrito__item">
            <div className="carrito__imagen">
              {item.imagen ? (
                <img src={`/img/${item.imagen}`} alt={item.nombre} />
              ) : (
                <span>🍽️</span>
              )}
            </div>

            <div className="carrito__info">
              <h3>{item.nombre}</h3>
              <p className="carrito__precio-unitario">{formatearPrecio(item.precio)} c/u</p>
            </div>

            <div className="carrito__cantidad">
              <button
                onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}
                disabled={item.cantidad <= 1}
                aria-label="Restar"
              >
                −
              </button>
              <span>{item.cantidad}</span>
              <button
                onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}
                disabled={item.cantidad >= item.stock}
                aria-label="Sumar"
              >
                +
              </button>
            </div>

            <strong className="carrito__subtotal">
              {formatearPrecio(item.precio * item.cantidad)}
            </strong>

            <button
              className="carrito__quitar"
              onClick={() => {
                quitar(item.id_producto);
                toast('Producto eliminado');
              }}
              aria-label={`Quitar ${item.nombre}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="carrito__entrega">
        <h2>Datos de entrega</h2>
        <label className="campo">
          <span>Dirección *</span>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Calle, número, piso, ciudad"
            required
          />
        </label>
        <label className="campo">
          <span>Observaciones (opcional)</span>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Timbre, referencias, aclaraciones…"
            rows={2}
          />
        </label>
      </div>

      <div className="carrito__resumen">
        <div className="carrito__total">
          <span>Total</span>
          <strong>{formatearPrecio(total)}</strong>
        </div>

        <div className="carrito__acciones">
          <button className="boton boton--secundario" onClick={vaciar} disabled={procesando}>
            Vaciar carrito
          </button>
          <button className="boton" onClick={handleFinalizarCompra} disabled={procesando}>
            {procesando ? 'Procesando…' : 'Finalizar y pagar'}
          </button>
        </div>
      </div>
    </section>
  );
}
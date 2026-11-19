import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearPrecio } from '../utils/formato.js';
import { toast } from '../utils/alertas.js';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck } from 'lucide-react';
import '../styles/Carrito.css';

export default function Carrito() {
  const { items, cambiarCantidad, quitar, vaciar, total, cantidadTotal } = useCart();
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  // ACÁ ESTÁ EL CAMBIO: Si el usuario tiene dirección guardada, la autocompletamos
  const [direccion, setDireccion] = useState(usuario?.direccion || '');
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleFinalizarCompra = async () => {
    if (!usuario || !token) {
      toast('Tenés que iniciar sesión para comprar');
      navigate('/login', { state: { desde: '/carrito' } });
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
          items: items.map((i) => ({ id_producto: i.id_producto, cantidad: i.cantidad }))
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el pedido');
      
      if (data.init_point) window.location.href = data.init_point;
      else throw new Error('No se pudo iniciar el pago');
      
    } catch (err) {
      toast(err.message);
      setProcesando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="carrito-vacio">
        <div className="carrito-vacio-icon">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Parece que todavía no agregaste nada.</p>
        <Link to="/" className="btn-primario">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <div className="carrito-header">
        <Link to="/" className="btn-volver"><ArrowLeft size={20} /> Seguir comprando</Link>
        <h1>Tu Carrito ({cantidadTotal} {cantidadTotal === 1 ? 'ítem' : 'ítems'})</h1>
      </div>

      <div className="carrito-layout">
        {/* COLUMNA IZQUIERDA: LISTA */}
        <div className="carrito-items-col">
          {items.map((item) => (
            <div key={item.id_producto} className="item-card">
              <div className="item-imagen">
                {item.imagen ? <img src={`/img/${item.imagen}`} alt={item.nombre} /> : <span>🍽️</span>}
              </div>
              <div className="item-info">
                <h3>{item.nombre}</h3>
                <p className="item-precio">{formatearPrecio(item.precio)}</p>
              </div>
              <div className="item-controles">
                <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)} disabled={item.cantidad <= 1}><Minus size={16} /></button>
                <span>{item.cantidad}</span>
                <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)} disabled={item.cantidad >= item.stock}><Plus size={16} /></button>
              </div>
              <div className="item-subtotal">
                {formatearPrecio(item.precio * item.cantidad)}
              </div>
              <button className="btn-eliminar" onClick={() => quitar(item.id_producto)}><Trash2 size={20} /></button>
            </div>
          ))}
          <button className="btn-vaciar" onClick={vaciar}>Vaciar carrito</button>
        </div>

        {/* COLUMNA DERECHA: RESUMEN Y PAGO */}
        <div className="carrito-checkout-col">
          <div className="checkout-card">
            <h2>Resumen de compra</h2>
            
            <div className="checkout-row">
              <span>Subtotal</span>
              <span>{formatearPrecio(total)}</span>
            </div>
            <div className="checkout-row">
              <span>Envío</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>Gratis</span>
            </div>
            
            <hr className="checkout-divider" />
            
            <div className="checkout-total">
              <span>Total</span>
              <strong>{formatearPrecio(total)}</strong>
            </div>

            <div className="checkout-form">
              <h3>Datos de entrega</h3>
              <input type="text" placeholder="Dirección completa *" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
              <textarea placeholder="Observaciones (opcional)" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>

            <button className="btn-pagar" onClick={handleFinalizarCompra} disabled={procesando}>
              {procesando ? 'Procesando...' : 'Finalizar y pagar'}
            </button>
            
            <p className="checkout-secure"><ShieldCheck size={16} /> Pago 100% seguro con Mercado Pago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
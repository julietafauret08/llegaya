import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom'; // 1. Importamos useNavigate
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ResultadoPago() {
  const [params] = useSearchParams();
  const { token } = useAuth(); 
  const { vaciar } = useCart();
  const navigate = useNavigate(); // 2. Inicializamos navigate
  const [estado, setEstado] = useState('verificando');
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const payment_id = params.get('payment_id');

    if (!payment_id) {
      setEstado('error');
      return;
    }
    if (!token) {
      setEstado('error');
      return;
    }

    fetch('/api/pagos/confirmar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ payment_id })
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) {
          setEstado('error');
          return;
        }
        setPedido(d);
        if (d.estado_pago === 'aprobado') {
          vaciar();
          setEstado('aprobado');
          
          // 3. ACÁ ESTÁ LA MAGIA: Esperamos 5 segundos y redirigimos a /pedidos
          setTimeout(() => {
            navigate('/pedidos');
          }, 5000); 

        } else if (d.estado_pago === 'pendiente') {
          setEstado('pendiente');
        } else {
          setEstado('rechazado');
        }
      })
      .catch(() => setEstado('error'));
  }, [params, token, vaciar, navigate]); // 4. Agregamos navigate a las dependencias

  return (
    <section className="resultado-pago" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      {estado === 'verificando' && <h2>Verificando el pago…</h2>}

      {estado === 'aprobado' && (
        <>
          <h1>¡Pago aprobado! 🎉</h1>
          <p>Tu pedido #{pedido?.id_pedido} ya está confirmado.</p>
          <p>Te avisamos cuando salga para entrega.</p>
          
          {/* Texto informativo para el usuario */}
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '1rem' }}>
            Serás redirigido a tus pedidos en unos segundos...
          </p>

          <Link to="/pedidos" className="boton">Ver mis pedidos</Link>
        </>
      )}

      {estado === 'pendiente' && (
        <>
          <h1>Pago pendiente ⏳</h1>
          <p>
            Si elegiste pagar en efectivo, acordate de abonar el cupón de
            Rapipago / Pago Fácil. Tu pedido se confirma cuando se acredita.
          </p>
          <Link to="/pedidos" className="boton">Ver mis pedidos</Link>
        </>
      )}

      {estado === 'rechazado' && (
        <>
          <h1>Pago rechazado ❌</h1>
          <p>No pudimos procesar el pago. Podés intentar de nuevo.</p>
          <Link to="/carrito" className="boton">Volver al carrito</Link>
        </>
      )}

      {estado === 'error' && (
        <>
          <h1>No pudimos verificar el pago</h1>
          <p>Si el problema persiste, revisá "Mis pedidos".</p>
          <Link to="/pedidos" className="boton">Ir a mis pedidos</Link>
        </>
      )}
    </section>
  );
}
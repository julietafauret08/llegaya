import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/MisPedidos.css';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';

const API_URL = '/api';

const ESTADOS = {
  pendiente: { label: 'Pendiente', clase: 'pendiente' },
  pagado: { label: 'Pagado', clase: 'pagado' },
  aprobado: { label: 'Pagado', clase: 'pagado' },
  en_camino: { label: 'En camino', clase: 'en_camino' },
  entregado: { label: 'Entregado', clase: 'entregado' },
  cancelado: { label: 'Cancelado', clase: 'cancelado' },
  rechazado: { label: 'Rechazado', clase: 'cancelado' },
};

const formatearPrecio = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(n) || 0);

const formatearFecha = (f) => {
  const d = new Date(f);
  if (!f || isNaN(d)) return 'Fecha no disponible';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
};

function PedidoCard({ pedido, token }) {
  const [abierto, setAbierto] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const [cargando, setCargando] = useState(false);

  const estado = ESTADOS[pedido.estado] ?? { label: pedido.estado, clase: 'pendiente' };

  // Función para traer el detalle del pedido
  const toggleDetalle = async () => {
    if (!abierto && detalle.length === 0) {
      setCargando(true);
      try {
        const res = await fetch(`${API_URL}/pedidos/${pedido.id_pedido}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.items) setDetalle(data.items);
      } catch (err) {
        console.error('Error al traer detalle');
      } finally {
        setCargando(false);
      }
    }
    setAbierto(!abierto);
  };

  return (
    <article className="pedido-card" style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      
      {/* CABECERA DEL PEDIDO (Clickeable) */}
      <div 
        onClick={toggleDetalle}
        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: abierto ? '1px solid #f3f4f6' : 'none' }}
      >
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>Pedido #{pedido.id_pedido}</h3>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{formatearFecha(pedido.fecha)}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span className={`status-badge ${estado.clase}`} style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {estado.label}
          </span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Total</span>
            <strong style={{ fontSize: '1.2rem', color: '#111' }}>{formatearPrecio(pedido.total)}</strong>
          </div>
          {abierto ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
        </div>
      </div>

      {/* DETALLE DEL PEDIDO (Se muestra al hacer clic) */}
      {abierto && (
        <div style={{ padding: '1.5rem', background: '#fafafa' }}>
          {cargando ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando detalle...</p>
          ) : detalle.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Este pedido no tiene detalle cargado.</p>
          ) : (
            <>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#374151', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={16} /> Productos
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {detalle.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px dashed #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ background: '#e5e7eb', color: '#374151', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {item.cantidad}x
                      </span>
                      <span style={{ fontWeight: '500', color: '#111' }}>{item.nombre}</span>
                    </div>
                    <span style={{ color: '#4b5563', fontWeight: '600' }}>
                      {formatearPrecio(item.precio_unitario * item.cantidad)}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span>Total pagado</span>
                <span>{formatearPrecio(pedido.total)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default function MisPedidos() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    if (!token) {
      setError('Tenés que iniciar sesión para ver tus pedidos.');
      setCargando(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/pedidos/mios`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (res.status === 401 || res.status === 403) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
        if (!res.ok) throw new Error('No pudimos cargar tus pedidos.');

        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.pedidos ?? [];
        lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setPedidos(lista);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Ocurrió un error inesperado.');
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    })();

    return () => controller.abort();
  }, [token]);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#111', margin: '0 0 0.5rem 0' }}>Mis pedidos</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Hacé clic en un pedido para ver el detalle de tu compra.</p>
      </header>

      {cargando && <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando pedidos...</p>}

      {!cargando && error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!cargando && !error && pedidos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '12px' }}>
          <span style={{ fontSize: '3rem' }}>🛍️</span>
          <h2>Todavía no hiciste pedidos</h2>
          <p style={{ color: '#6b7280' }}>Cuando compres algo, va a aparecer acá.</p>
        </div>
      )}

      {!cargando && !error && pedidos.length > 0 && (
        <div>
          {pedidos.map((p) => (
            <PedidoCard key={p.id_pedido} pedido={p} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
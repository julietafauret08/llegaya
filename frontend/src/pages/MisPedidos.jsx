import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // <--- IMPORTAMOS EL AUTH
import '../styles/MisPedidos.css';

const API_URL = '/api';

const ESTADOS = {
  pendiente: { label: 'Pendiente', clase: 'pendiente' },
  pagado: { label: 'Pagado', clase: 'pagado' },
  aprobado: { label: 'Pagado', clase: 'pagado' },
  enviado: { label: 'En camino', clase: 'enviado' },
  entregado: { label: 'Entregado', clase: 'entregado' },
  cancelado: { label: 'Cancelado', clase: 'cancelado' },
  rechazado: { label: 'Rechazado', clase: 'cancelado' },
};

const formatearPrecio = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const formatearFecha = (f) => {
  const d = new Date(f);
  if (!f || isNaN(d)) return 'Fecha no disponible';
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const normalizarPedido = (p) => {
  const items = (p.items ?? p.productos ?? p.detalle ?? []).map((i) => ({
    nombre: i.nombre ?? i.producto ?? 'Producto',
    cantidad: Number(i.cantidad) || 1,
    precio: Number(i.precio ?? i.precio_unitario) || 0,
  }));
  const totalCalculado = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  return {
    id: p.id ?? p.id_pedido,
    fecha: p.fecha ?? p.created_at ?? p.creado_en,
    estado: String(p.estado ?? 'pendiente').toLowerCase(),
    total: p.total ?? totalCalculado,
    items,
  };
};

function PedidoCard({ pedido, abierto, onToggle }) {
  const estado = ESTADOS[pedido.estado] ?? {
    label: pedido.estado,
    clase: 'pendiente',
  };
  const cantidadTotal = pedido.items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <article className="pedido-card">
      <button
        type="button"
        className="pedido-header"
        onClick={onToggle}
        aria-expanded={abierto}
      >
        <div className="pedido-info">
          <span className="pedido-numero">Pedido #{pedido.id}</span>
          <span className="pedido-fecha">{formatearFecha(pedido.fecha)}</span>
        </div>

        <span className={`badge badge-${estado.clase}`}>{estado.label}</span>

        <div className="pedido-total">
          <span className="pedido-total-label">Total</span>
          <strong>{formatearPrecio(pedido.total)}</strong>
        </div>

        <span className={`chevron ${abierto ? 'abierto' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {abierto && (
        <div className="pedido-detalle">
          {pedido.items.length === 0 ? (
            <p className="detalle-vacio">Este pedido no tiene detalle cargado.</p>
          ) : (
            <>
              <ul className="items-lista">
                {pedido.items.map((item, idx) => (
                  <li key={idx} className="item-fila">
                    <span className="item-cantidad">{item.cantidad}×</span>
                    <span className="item-nombre">{item.nombre}</span>
                    <span className="item-precio">
                      {formatearPrecio(item.precio * item.cantidad)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="detalle-resumen">
                <span>
                  {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}
                </span>
                <strong>{formatearPrecio(pedido.total)}</strong>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default function MisPedidos() {
  const { token } = useAuth(); // <--- LEEMOS EL TOKEN DEL CONTEXTO
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [abiertoId, setAbiertoId] = useState(null);

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

        if (res.status === 401 || res.status === 403) {
          throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
        }
        if (!res.ok) throw new Error('No pudimos cargar tus pedidos.');

        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.pedidos ?? [];
        const normalizados = lista.map(normalizarPedido);

        normalizados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setPedidos(normalizados);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Ocurrió un error inesperado.');
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    })();

    return () => controller.abort();
  }, [token]); // <--- AHORA DEPENDE DEL TOKEN DEL CONTEXTO

  return (
    <div className="pedidos-page">
      <header className="pedidos-titulo">
        <h1>Mis pedidos</h1>
        <p>Seguí el estado de tus compras y revisá el detalle de cada una.</p>
      </header>

      {cargando && (
        <div className="pedidos-lista" aria-busy="true">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" />
          ))}
        </div>
      )}

      {!cargando && error && (
        <div className="estado-mensaje error" role="alert">
          <span className="estado-icono">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {!cargando && !error && pedidos.length === 0 && (
        <div className="estado-mensaje">
          <span className="estado-icono">🛍️</span>
          <h2>Todavía no hiciste pedidos</h2>
          <p>Cuando compres algo, va a aparecer acá.</p>
          <a href="/" className="btn-primario">
            Ir al catálogo
          </a>
        </div>
      )}

      {!cargando && !error && pedidos.length > 0 && (
        <div className="pedidos-lista">
          {pedidos.map((p) => (
            <PedidoCard
              key={p.id}
              pedido={p}
              abierto={abiertoId === p.id}
              onToggle={() => setAbiertoId(abiertoId === p.id ? null : p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
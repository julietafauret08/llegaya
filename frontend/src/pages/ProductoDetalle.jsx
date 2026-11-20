import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatearPrecio } from '../utils/formato.js';
import { toast } from '../utils/alertas.js';
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShieldCheck, Store } from 'lucide-react';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregar } = useCart();
  
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/productos/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast(data.error);
          navigate('/');
        } else {
          setProducto(data);
        }
        setCargando(false);
      })
      .catch(() => {
        toast('Error al cargar el producto');
        setCargando(false);
      });
  }, [id, navigate]);

  const handleAgregar = () => {
    // Agregamos el producto la cantidad de veces seleccionada
    for (let i = 0; i < cantidad; i++) {
      agregar(producto);
    }
    toast(`${cantidad} ${producto.nombre} agregado/s al carrito`);
  };

  if (cargando) return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Cargando producto...</p>;
  if (!producto) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600' }}>
        <ArrowLeft size={20} /> Volver al catálogo
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem', background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        {/* Imagen del producto */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', height: '400px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {producto.imagen ? (
            <img src={`/img/${producto.imagen}`} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '8rem' }}>🍽️</span>
          )}
        </div>

        {/* Información del producto */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {producto.categoria || 'General'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <Star size={16} fill="#f59e0b" /> 4.8 (120+ reseñas)
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#111827', lineHeight: 1.1 }}>{producto.nombre}</h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>{producto.descripcion || 'Sin descripción detallada.'}</p>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Store size={24} color="#e63946" />
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#111' }}>Vendido por LlegaYa</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Local verificado • Calificación 4.9</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4b5563', fontSize: '0.9rem' }}>
              <Clock size={18} /> 30-45 min
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4b5563', fontSize: '0.9rem' }}>
              <MapPin size={18} /> Envío a tu zona
            </span>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#111', margin: '0 0 1rem 0' }}>{formatearPrecio(producto.precio)}</p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '12px', padding: '0.5rem' }}>
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1} style={{ background: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: cantidad <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Minus size={18} />
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{cantidad}</span>
                <button onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))} disabled={cantidad >= producto.stock} style={{ background: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: cantidad >= producto.stock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Plus size={18} />
                </button>
              </div>
              
              <button 
                onClick={handleAgregar} 
                disabled={producto.stock < 1}
                style={{ flex: 1, background: producto.stock < 1 ? '#fca5a5' : '#e63946', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: producto.stock < 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
              >
                {producto.stock < 1 ? 'Sin Stock' : `Agregar ${cantidad} al carrito`}
              </button>
            </div>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.85rem', marginTop: '1rem', justifyContent: 'center' }}>
              <ShieldCheck size={16} /> Compra protegida
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
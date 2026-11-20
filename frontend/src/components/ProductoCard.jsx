import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { useCart } from '../context/CartContext.jsx';
import { formatearPrecio } from '../utils/formato.js';
import { toast } from '../utils/alertas.js';
import { Plus } from 'lucide-react';
import '../styles/ProductoCard.css';

export default function ProductoCard({ producto }) {
  const { agregar } = useCart();
  const navigate = useNavigate(); // Para redirigir
  const [sinImagen, setSinImagen] = useState(!producto.imagen);
  const agotado = producto.stock < 1;

  // Detenemos la propagación para que al hacer clic en "Agregar" no te lleve al detalle
  const handleAgregar = (e) => {
    e.stopPropagation(); 
    e.preventDefault();
    agregar(producto);
    toast('Agregado al carrito');
  };

  // Al hacer clic en la tarjeta, vamos al detalle
  const handleCardClick = () => {
    navigate(`/producto/${producto.id_producto}`);
  };

  return (
    <article 
      className="producto" 
      onClick={handleCardClick} 
      style={{ cursor: 'pointer' }} // Para que se vea que es clickeable
    >
      <div className="producto__imagen">
        {sinImagen ? (
          <span className="producto__emoji">🍽️</span>
        ) : (
          <img
            src={`/img/${producto.imagen}`}
            alt={producto.nombre}
            onError={() => setSinImagen(true)}
          />
        )}
      </div>

      <div className="producto__cuerpo">
        <span className="producto__categoria">{producto.categoria || 'General'}</span>
        <h3>{producto.nombre}</h3>
        <p className="producto__descripcion">{producto.descripcion}</p>

        <div className="producto__pie">
          <strong className="producto__precio">{formatearPrecio(producto.precio)}</strong>
          <button 
            className="boton" 
            onClick={handleAgregar} 
            disabled={agotado}
            style={{ padding: '0.5rem 1rem', borderRadius: '20px' }}
          >
            {agotado ? 'Agotado' : <><Plus size={16} /> Agregar</>}
          </button>
        </div>
      </div>
    </article>
  );
}
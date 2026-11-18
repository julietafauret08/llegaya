import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatearPrecio } from '../utils/formato.js';
import { toast } from '../utils/alertas.js';

export default function ProductoCard({ producto }) {
  const { agregar } = useCart();
  const [sinImagen, setSinImagen] = useState(!producto.imagen);
  const agotado = producto.stock < 1;

  const handleAgregar = () => {
    agregar(producto);
    toast('Agregado al carrito');
  };

  return (
    <article className="producto">
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
        <span className="producto__categoria">{producto.categoria || 'Sin categoría'}</span>
        <h3>{producto.nombre}</h3>
        <p className="producto__descripcion">{producto.descripcion}</p>

        <div className="producto__pie">
          <strong className="producto__precio">{formatearPrecio(producto.precio)}</strong>
          <button className="boton" onClick={handleAgregar} disabled={agotado}>
            {agotado ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}
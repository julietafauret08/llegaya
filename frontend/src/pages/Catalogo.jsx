import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import ProductoCard from '../components/ProductoCard.jsx';
import { alertaError } from '../utils/alertas.js';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiFetch('/productos/categorias')
      .then(setCategorias)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoria) params.set('categoria', categoria);
    if (buscar.trim()) params.set('buscar', buscar.trim());

    // Espera 300 ms después de escribir para no pedir al back en cada letra
    const temporizador = setTimeout(async () => {
      try {
        setCargando(true);
        const datos = await apiFetch(`/productos?${params.toString()}`);
        setProductos(datos);
      } catch (err) {
        alertaError('No se pudieron cargar los productos', err.message);
      } finally {
        setCargando(false);
      }
    }, 300);

    return () => clearTimeout(temporizador);
  }, [categoria, buscar]);

  return (
    <section>
      <div className="portada">
        <h1>¿Qué se te antoja hoy?</h1>
        <p>Pedí tu comida favorita y te la llevamos a tu casa.</p>
        <input
          className="campo portada__buscador"
          type="search"
          placeholder="Buscar productos..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>

      <div className="filtros">
        <button
          className={`filtro ${categoria === '' ? 'filtro--activo' : ''}`}
          onClick={() => setCategoria('')}
        >
          Todos
        </button>
        {categorias.map((c) => (
          <button
            key={c.id_categoria}
            className={`filtro ${String(categoria) === String(c.id_categoria) ? 'filtro--activo' : ''}`}
            onClick={() => setCategoria(c.id_categoria)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="mensaje">Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p className="mensaje">No encontramos productos con ese filtro.</p>
      ) : (
        <div className="grilla">
          {productos.map((p) => (
            <ProductoCard key={p.id_producto} producto={p} />
          ))}
        </div>
      )}
    </section>
  );
}
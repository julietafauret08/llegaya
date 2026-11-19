import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductoCard from '../components/ProductoCard';
import { toast } from '../utils/alertas.js';
import '../styles/Catalogo.css'; // Importamos su CSS

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch('/api/productos'),
          fetch('/api/productos/categorias')
        ]);
        
        if (resProd.ok) setProductos(await resProd.json());
        if (resCat.ok) setCategorias(await resCat.json());
      } catch (err) {
        toast('Error al cargar el catálogo');
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados = productos.filter((prod) => {
    const coincideBusqueda = prod.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva ? prod.id_categoria === categoriaActiva : true;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="catalogo-page">
      <section className="catalogo-hero">
        <h1>¿Qué se te antoja hoy?</h1>
        <p>Pedí tu comida favorita y te la llevamos a tu casa.</p>
        
        <div className="buscador-container">
          <Search className="search-icon" size={24} />
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="buscador-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      <section className="categorias-filtros">
        <button 
          className={`filtro-btn ${categoriaActiva === null ? 'activo' : ''}`}
          onClick={() => setCategoriaActiva(null)}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button 
            key={cat.id_categoria}
            className={`filtro-btn ${categoriaActiva === cat.id_categoria ? 'activo' : ''}`}
            onClick={() => setCategoriaActiva(cat.id_categoria)}
          >
            {cat.nombre}
          </button>
        ))}
      </section>

      <section className="productos-grid">
        {cargando ? (
          <p>Cargando productos...</p>
        ) : productosFiltrados.length === 0 ? (
          <p>No encontramos productos con esa búsqueda.</p>
        ) : (
          productosFiltrados.map((prod) => (
            <ProductoCard key={prod.id_producto} producto={prod} />
          ))
        )}
      </section>
    </div>
  );
}
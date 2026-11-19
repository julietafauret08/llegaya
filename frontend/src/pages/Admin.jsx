import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatearPrecio } from '../utils/formato.js';
import { toast } from '../utils/alertas.js';
import { LayoutDashboard, ShoppingBag, Utensils, LogOut, TrendingUp, DollarSign, Package, Plus, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

const ESTADOS = ['pendiente', 'pagado', 'en_camino', 'entregado', 'cancelado'];

export default function Admin() {
  const { usuario, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [metricas, setMetricas] = useState({ recaudacionTotal: 0, pedidosTotales: 0, ventasHoy: 0 });
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]); // NUEVO: Para el selector
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState('metricas');

  // Estado para el formulario de Productos
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formProducto, setFormProducto] = useState({
    nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '', imagen: ''
  });

  const cargarDatos = async () => {
    try {
      const [resMetricas, resPedidos, resProductos, resCategorias] = await Promise.all([
        fetch('/api/pedidos/admin/metricas', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/pedidos', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/productos'),
        fetch('/api/productos/categorias') // Traemos las categorías
      ]);

      if (resMetricas.ok) setMetricas(await resMetricas.json());
      
      if (resPedidos.ok) {
        const data = await resPedidos.json();
        data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setPedidos(data);
      }

      if (resProductos.ok) setProductos(await resProductos.json());
      if (resCategorias.ok) setCategorias(await resCategorias.json());
    } catch (err) {
      toast('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) cargarDatos();
  }, [token]);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (!res.ok) throw new Error('Error al actualizar');
      toast(`Pedido #${id} actualizado`);
      setPedidos((prev) => prev.map((p) => (p.id_pedido === id ? { ...p, estado: nuevoEstado } : p)));
    } catch (err) {
      toast(err.message);
    }
  };

  // --- LÓGICA DE PRODUCTOS ---
  const abrirModalNuevo = () => {
    setProductoEditando(null);
    setFormProducto({ nombre: '', descripcion: '', precio: '', stock: '', id_categoria: categorias[0]?.id_categoria || '', imagen: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod) => {
    setProductoEditando(prod);
    setFormProducto({
      nombre: prod.nombre, descripcion: prod.descripcion || '', precio: prod.precio,
      stock: prod.stock, id_categoria: prod.id_categoria || '', imagen: prod.imagen || ''
    });
    setModalAbierto(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    const url = productoEditando ? `/api/productos/${productoEditando.id_producto}` : '/api/productos';
    const method = productoEditando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formProducto)
      });
      
      if (!res.ok) throw new Error('Error al guardar el producto');
      
      toast(productoEditando ? 'Producto actualizado' : 'Producto creado');
      setModalAbierto(false);
      cargarDatos(); // Recargar la lista
    } catch (err) {
      toast(err.message);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Seguro que querés ocultar este producto?')) return;
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      toast('Producto eliminado');
      setProductos(productos.filter(p => p.id_producto !== id));
    } catch (err) {
      toast(err.message);
    }
  };

  const handleSalir = () => { logout(); navigate('/login'); };

  if (cargando) return <div className="admin-loading"><div className="spinner"></div><p>Cargando panel...</p></div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand"><Utensils size={24} color="#e63946" /><span>LlegaYa Admin</span></div>
        <nav className="sidebar-nav">
          <button className={tabActiva === 'metricas' ? 'active' : ''} onClick={() => setTabActiva('metricas')}><LayoutDashboard size={20} /> Dashboard</button>
          <button className={tabActiva === 'productos' ? 'active' : ''} onClick={() => setTabActiva('productos')}><Package size={20} /> Productos</button>
          <button className={tabActiva === 'pedidos' ? 'active' : ''} onClick={() => setTabActiva('pedidos')}><ShoppingBag size={20} /> Pedidos</button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info"><span className="user-avatar">{usuario?.nombre?.charAt(0)}</span><span>{usuario?.nombre}</span></div>
          <button className="btn-logout" onClick={handleSalir}><LogOut size={18} /> Cerrar sesión</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{tabActiva === 'metricas' ? 'Resumen General' : tabActiva === 'productos' ? 'Gestión de Productos' : 'Historial de Pedidos'}</h1>
          <p>Bienvenido de vuelta, {usuario?.nombre}.</p>
        </header>

        {tabActiva === 'metricas' && (
          <div className="metrics-grid">
            <div className="metric-card"><div className="metric-icon bg-red"><DollarSign size={24} /></div><div className="metric-data"><span>Recaudación Total</span><h3>{formatearPrecio(metricas.recaudacionTotal)}</h3></div></div>
            <div className="metric-card"><div className="metric-icon bg-blue"><ShoppingBag size={24} /></div><div className="metric-data"><span>Pedidos Totales</span><h3>{metricas.pedidosTotales}</h3></div></div>
            <div className="metric-card"><div className="metric-icon bg-green"><TrendingUp size={24} /></div><div className="metric-data"><span>Ventas de Hoy</span><h3>{metricas.ventasHoy}</h3></div></div>
          </div>
        )}

        {tabActiva === 'productos' && (
          <div className="admin-panel table-panel">
            <div className="panel-header">
              <h2>Lista de Productos</h2>
              <button className="btn-primary" onClick={abrirModalNuevo}><Plus size={18} /> Agregar Producto</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id_producto}>
                    <td>
                      {prod.imagen ? (
                        <img src={`/img/${prod.imagen}`} alt={prod.nombre} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
                      )}
                    </td>
                    <td className="font-bold">{prod.nombre}</td>
                    <td>{prod.categoria || 'General'}</td>
                    <td>{formatearPrecio(prod.precio)}</td>
                    <td>{prod.stock}</td>
                    <td>
                      <button className="btn-action edit" onClick={() => abrirModalEditar(prod)}><Edit size={16} /></button>
                      <button className="btn-action delete" onClick={() => eliminarProducto(prod.id_producto)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tabActiva === 'pedidos' && (
          <div className="admin-panel table-panel">
            <table className="admin-table">
              <thead><tr><th>ID Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id_pedido}>
                    <td className="font-bold">#{p.id_pedido}</td><td>{p.nombre} {p.apellido}</td>
                    <td>{new Date(p.fecha).toLocaleDateString('es-AR')}</td><td className="font-bold">{formatearPrecio(p.total)}</td>
                    <td><span className={`status-badge ${p.estado}`}>{p.estado}</span></td>
                    <td>
                      <select value={p.estado} onChange={(e) => handleCambiarEstado(p.id_pedido, e.target.value)} className="admin-select">
                        {ESTADOS.map((est) => <option key={est} value={est}>{est}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL PARA CREAR/EDITAR PRODUCTO */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setModalAbierto(false)}><X size={20} /></button>
            </div>
            <form onSubmit={guardarProducto} className="modal-form">
              <label>Nombre del producto
                <input type="text" required value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} />
              </label>
              <label>Descripción
                <textarea rows="2" value={formProducto.descripcion} onChange={e => setFormProducto({...formProducto, descripcion: e.target.value})} />
              </label>
              <div className="modal-row">
                <label>Precio
                  <input type="number" required value={formProducto.precio} onChange={e => setFormProducto({...formProducto, precio: e.target.value})} />
                </label>
                <label>Stock
                  <input type="number" required value={formProducto.stock} onChange={e => setFormProducto({...formProducto, stock: e.target.value})} />
                </label>
              </div>
              <label>Categoría
                <select 
                  required 
                  value={formProducto.id_categoria} 
                  onChange={e => setFormProducto({...formProducto, id_categoria: e.target.value})}
                  className="modal-select"
                >
                  <option value="">Seleccioná una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                  ))}
                </select>
              </label>
              <label>Nombre del archivo de imagen (ej: pizza.jpg)
                <input type="text" value={formProducto.imagen} onChange={e => setFormProducto({...formProducto, imagen: e.target.value})} placeholder="Opcional" />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
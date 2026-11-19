import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingCart, LogOut, User } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const { cantidadTotal } = useCart();
  const navigate = useNavigate();

  const salir = () => {
    logout();
    navigate('/');
  };

  const esAdmin = usuario?.rol === 'admin';

  return (
    <header className="navbar">
      <div className="navbar__interior">
        <Link to={esAdmin ? "/admin" : "/"} className="navbar__logo">
          Llega<span>Ya</span>
        </Link>

        <nav className="navbar__links">
          {!esAdmin && <NavLink to="/" className="nav-link">Inicio</NavLink>}
          
          {/* Links exclusivos de Cliente */}
          {usuario && !esAdmin && (
            <>
              <NavLink to="/pedidos" className="nav-link">Mis pedidos</NavLink>
              <NavLink to="/mi-cuenta" className="nav-link">Mi Cuenta</NavLink>
            </>
          )}
          
          {/* Link exclusivo de Admin */}
          {esAdmin && <NavLink to="/admin" className="nav-link">Panel Admin</NavLink>}

          {/* Carrito solo para Clientes */}
          {!esAdmin && (
            <NavLink to="/carrito" className="nav-link nav-carrito">
              <ShoppingCart size={20} />
              Carrito
              {cantidadTotal > 0 && <span className="insignia">{cantidadTotal}</span>}
            </NavLink>
          )}

          {usuario ? (
            <div className="nav-user">
              <span className="nav-saludo"><User size={18} /> {usuario.nombre}</span>
              <button className="btn-salir" onClick={salir}>
                <LogOut size={18} /> Salir
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <NavLink to="/login" className="nav-link">Ingresar</NavLink>
              <Link to="/registro" className="btn-registro">Registrarme</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
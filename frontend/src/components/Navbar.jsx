import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const { cantidadTotal } = useCart();
  const navigate = useNavigate();

  const salir = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar__interior">
        <Link to="/" className="navbar__logo">
          Llega<span>Ya</span>
        </Link>

        <nav className="navbar__links">
          <NavLink to="/">Inicio</NavLink>
          {usuario && <NavLink to="/pedidos">Mis pedidos</NavLink>}
          {usuario?.rol === 'admin' && <NavLink to="/admin">Admin</NavLink>}

          <NavLink to="/carrito" className="navbar__carrito">
            🛒 Carrito
            {cantidadTotal > 0 && <span className="insignia">{cantidadTotal}</span>}
          </NavLink>

          {usuario ? (
            <>
              <span className="navbar__saludo">Hola, {usuario.nombre}</span>
              <button className="boton boton--borde" onClick={salir}>
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Ingresar</NavLink>
              <Link to="/registro" className="boton">
                Registrarme
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
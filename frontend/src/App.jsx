import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Carrito from './pages/Carrito.jsx';
import ResultadoPago from './pages/ResultadoPago.jsx';
import MisPedidos from './pages/MisPedidos.jsx';
import Admin from './pages/Admin.jsx';
import RutaSoloCliente from './components/RutaProtegida.jsx'; // NUEVO
import './styles/global.css';
import RecuperarPassword from './pages/RecuperarPassword.jsx';
import RestablecerPassword from './pages/RestablecerPassword.jsx';
import MiCuenta from './pages/MiCuenta.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <Routes>
          {/* Rutas Protegidas (El admin no puede entrar acá) */}
          <Route path="/" element={<RutaSoloCliente><Catalogo /></RutaSoloCliente>} />
          <Route path="/carrito" element={<RutaSoloCliente><Carrito /></RutaSoloCliente>} />
          <Route path="/pedidos" element={<RutaSoloCliente><MisPedidos /></RutaSoloCliente>} />
          
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/pago/resultado" element={<ResultadoPago />} />
          
          {/* Ruta del Admin */}
          <Route path="/admin" element={<Admin />} />
          
          {/* Ruta de Error */}
          <Route path="*" element={<p>Página no encontrada o en construcción.</p>} />

          <Route path="/recuperar-password" element={<RecuperarPassword />} />
<Route path="/restablecer-password/:token" element={<RestablecerPassword />} />
<Route path="/mi-cuenta" element={<RutaSoloCliente><MiCuenta /></RutaSoloCliente>} />
        </Routes>
      </main>
    </>
  );
}
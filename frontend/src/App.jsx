import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Carrito from './pages/Carrito.jsx';
import ResultadoPago from './pages/ResultadoPago.jsx';
import MisPedidos from './pages/MisPedidos.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pago/resultado" element={<ResultadoPago />} />
          <Route path="/pedidos" element={<MisPedidos />} />
          <Route path="*" element={<p>Página no encontrada o en construcción.</p>} />
        </Routes>
      </main>
    </>
  );
}
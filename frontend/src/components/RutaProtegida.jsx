import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RutaSoloCliente({ children }) {
  const { usuario } = useAuth();

  // Si es admin, lo mandamos directo al panel para que no vea el catálogo
  if (usuario?.rol === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
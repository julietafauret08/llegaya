import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { alertaError, toast } from '../utils/alertas.js';
import { Mail, Lock, LogIn } from 'lucide-react';
import '../styles/Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      alertaError('Faltan datos', 'Ingresá tu email y tu contraseña.');
      return;
    }
    try {
      setEnviando(true);
      const usuario = await login(email.trim(), password);
      toast(`¡Hola, ${usuario.nombre}!`);
      
      if (usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate(location.state?.desde || '/');
      }
    } catch (err) {
      alertaError('No pudimos iniciar sesión', err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Lado Izquierdo: Branding */}
      <div className="auth-brand">
        <div className="auth-brand-logo">Llega<span>Ya</span></div>
        <h2>¡Qué bueno verte de nuevo!</h2>
        <p>Ingresá para descubrir los mejores platos y recibirlos en la puerta de tu casa.</p>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="auth-form-wrapper">
        <div className="auth-form">
          <h2>Ingresar</h2>
          <p className="auth-subtitle">Por favor, ingresá tus datos.</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <Mail className="auth-input-icon" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuemail@ejemplo.com"
              />
            </div>

            <div className="auth-input-group">
              <Lock className="auth-input-icon" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
            </div>

            <button className="auth-btn-submit" disabled={enviando}>
              {enviando ? 'Ingresando...' : <><LogIn size={20} /> Ingresar</>}
            </button>
          </form>

          <div className="auth-links">
            <span>¿No tenés cuenta? <Link to="/registro">Registrate</Link></span>
            <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
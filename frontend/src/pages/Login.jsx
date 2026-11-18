import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { alertaError, toast } from '../utils/alertas.js';

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
      navigate(location.state?.desde || '/');
    } catch (err) {
      alertaError('No pudimos iniciar sesión', err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="tarjeta-formulario">
      <h2>Ingresar</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            className="campo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuemail@ejemplo.com"
          />
        </label>

        <label>
          Contraseña
          <input
            className="campo"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
          />
        </label>

        <button className="boton boton--ancho" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="pie-formulario">
        ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
      </p>
    </section>
  );
}
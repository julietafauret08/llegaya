import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { alertaAviso, alertaError, alertaExito } from '../utils/alertas.js';
import { User, Mail, Lock, Phone, MapPin, UserPlus } from 'lucide-react';
import '../styles/Auth.css';

const inicial = {
  nombre: '', apellido: '', email: '', telefono: '', direccion: '', password: '', confirmar: ''
};

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(inicial);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!datos.nombre.trim() || !datos.apellido.trim() || !datos.email.trim() || !datos.password) {
      return alertaAviso('Faltan datos', 'Completá nombre, apellido, email y contraseña.');
    }
    if (datos.nombre.trim().length < 2 || datos.apellido.trim().length < 2) {
      return alertaAviso('Nombre inválido', 'El nombre y apellido deben tener al menos 2 letras.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datos.email)) {
      return alertaAviso('Email inválido', 'Ingresá un correo electrónico válido.');
    }
    if (datos.telefono && !/^\d+$/.test(datos.telefono)) {
      return alertaAviso('Teléfono inválido', 'El teléfono solo debe contener números.');
    }
    if (datos.password.length < 6) {
      return alertaAviso('Contraseña corta', 'Debe tener al menos 6 caracteres.');
    }
    if (datos.password !== datos.confirmar) {
      return alertaAviso('Las contraseñas no coinciden', 'Revisá que sean iguales.');
    }

    try {
      setEnviando(true);
      const { confirmar, ...paraEnviar } = datos;
      await registro(paraEnviar);
      await alertaExito('¡Cuenta creada!', 'Te enviamos un correo de bienvenida. Ahora podés ingresar.');
      navigate('/login');
    } catch (err) {
      alertaError('No pudimos registrarte', err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-brand" style={{ background: 'linear-gradient(135deg, #e63946 0%, #ff7e5f 100%)' }}>
        <div className="auth-brand-logo">Llega<span style={{ color: '#111' }}>Ya</span></div>
        <h2>Creá tu cuenta</h2>
        <p>Unite a nosotros y empezá a disfrutar de la mejor comida, rápido y fácil.</p>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-form">
          <h2>Registrarme</h2>
          <p className="auth-subtitle">Completá tus datos para crear tu perfil.</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-row">
              <div className="auth-input-group">
                <User className="auth-input-icon" size={20} />
                <input type="text" name="nombre" value={datos.nombre} onChange={cambiar} placeholder="Nombre" />
              </div>
              <div className="auth-input-group">
                <User className="auth-input-icon" size={20} />
                <input type="text" name="apellido" value={datos.apellido} onChange={cambiar} placeholder="Apellido" />
              </div>
            </div>

            <div className="auth-input-group">
              <Mail className="auth-input-icon" size={20} />
              <input type="email" name="email" value={datos.email} onChange={cambiar} placeholder="Correo electrónico" />
            </div>

            <div className="auth-form-row">
              <div className="auth-input-group">
                <Phone className="auth-input-icon" size={20} />
                <input type="text" name="telefono" value={datos.telefono} onChange={cambiar} placeholder="Teléfono (opc)" />
              </div>
              <div className="auth-input-group">
                <MapPin className="auth-input-icon" size={20} />
                <input type="text" name="direccion" value={datos.direccion} onChange={cambiar} placeholder="Dirección (opc)" />
              </div>
            </div>

            <div className="auth-form-row">
              <div className="auth-input-group">
                <Lock className="auth-input-icon" size={20} />
                <input type="password" name="password" value={datos.password} onChange={cambiar} placeholder="Contraseña" />
              </div>
              <div className="auth-input-group">
                <Lock className="auth-input-icon" size={20} />
                <input type="password" name="confirmar" value={datos.confirmar} onChange={cambiar} placeholder="Repetir contraseña" />
              </div>
            </div>

            <button className="auth-btn-submit" disabled={enviando}>
              {enviando ? 'Creando cuenta...' : <><UserPlus size={20} /> Crear Cuenta</>}
            </button>
          </form>

          <div className="auth-links">
            <span>¿Ya tenés cuenta? <Link to="/login">Ingresá</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
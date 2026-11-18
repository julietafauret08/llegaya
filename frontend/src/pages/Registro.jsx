import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { alertaAviso, alertaError, alertaExito } from '../utils/alertas.js';

const inicial = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  password: '',
  confirmar: ''
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
      alertaAviso('Faltan datos', 'Completá nombre, apellido, email y contraseña.');
      return;
    }
    if (datos.password.length < 6) {
      alertaAviso('Contraseña corta', 'Debe tener al menos 6 caracteres.');
      return;
    }
    if (datos.password !== datos.confirmar) {
      alertaAviso('Las contraseñas no coinciden', 'Revisá que sean iguales.');
      return;
    }

    try {
      setEnviando(true);
      const { confirmar, ...paraEnviar } = datos;
      await registro(paraEnviar);
      await alertaExito('¡Cuenta creada!', 'Ahora podés ingresar.');
      navigate('/login');
    } catch (err) {
      alertaError('No pudimos registrarte', err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="tarjeta-formulario">
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="fila">
          <label>
            Nombre
            <input className="campo" name="nombre" value={datos.nombre} onChange={cambiar} />
          </label>
          <label>
            Apellido
            <input className="campo" name="apellido" value={datos.apellido} onChange={cambiar} />
          </label>
        </div>

        <label>
          Email
          <input className="campo" type="email" name="email" value={datos.email} onChange={cambiar} />
        </label>

        <div className="fila">
          <label>
            Teléfono (opcional)
            <input className="campo" name="telefono" value={datos.telefono} onChange={cambiar} />
          </label>
          <label>
            Dirección (opcional)
            <input className="campo" name="direccion" value={datos.direccion} onChange={cambiar} />
          </label>
        </div>

        <div className="fila">
          <label>
            Contraseña
            <input
              className="campo"
              type="password"
              name="password"
              value={datos.password}
              onChange={cambiar}
            />
          </label>
          <label>
            Repetir contraseña
            <input
              className="campo"
              type="password"
              name="confirmar"
              value={datos.confirmar}
              onChange={cambiar}
            />
          </label>
        </div>

        <button className="boton boton--ancho" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <p className="pie-formulario">
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </section>
  );
}
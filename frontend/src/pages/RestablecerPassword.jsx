import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../utils/alertas.js';

export default function RestablecerPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmar) return toast('Las contraseñas no coinciden');
    if (password.length < 6) return toast('La contraseña debe tener al menos 6 caracteres');

    try {
      const res = await fetch('/api/auth/restablecer-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast('Contraseña actualizada. Ya podés iniciar sesión.');
      navigate('/login');
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <section className="tarjeta-formulario">
      <h2>Nueva Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nueva Contraseña
          <input className="campo" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <label>
          Confirmar Contraseña
          <input className="campo" type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required />
        </label>
        <button className="boton boton--ancho" type="submit">Guardar Contraseña</button>
      </form>
    </section>
  );
}
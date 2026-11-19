import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../utils/alertas.js';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setEnviado(true);
      toast('Revisá tu correo electrónico');
    } catch (err) {
      toast(err.message);
    }
  };

  if (enviado) {
    return (
      <section className="tarjeta-formulario" style={{ textAlign: 'center' }}>
        <h2>¡Correo enviado!</h2>
        <p>Revisá tu bandeja de entrada (y la carpeta de spam) para continuar con el cambio.</p>
        <Link to="/login" className="boton">Volver al login</Link>
      </section>
    );
  }

  return (
    <section className="tarjeta-formulario">
      <h2>Recuperar Contraseña</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Ingresá tu email y te enviaremos un enlace.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input className="campo" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <button className="boton boton--ancho" type="submit">Enviar enlace</button>
      </form>
      <p className="pie-formulario"><Link to="/login">Volver al login</Link></p>
    </section>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../utils/alertas.js';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import '../styles/Auth.css';

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

  return (
    <div className="auth-container">
      {/* Lado Izquierdo: Branding */}
      <div className="auth-brand" style={{ background: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)' }}>
        <div className="auth-brand-logo" style={{ color: 'white' }}>Llega<span style={{ color: '#e63946' }}>Ya</span></div>
        <h2>Recuperá tu acceso</h2>
        <p>No te preocupes, te vamos a ayudar a volver a entrar a tu cuenta en un segundo.</p>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="auth-form-wrapper">
        <div className="auth-form">
          {enviado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#d1fae5', color: '#059669', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Send size={30} />
              </div>
              <h2>¡Correo enviado!</h2>
              <p className="auth-subtitle">Revisá tu bandeja de entrada (y la carpeta de spam) para continuar con el cambio.</p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#e63946', fontWeight: 'bold', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h2>Recuperar Contraseña</h2>
              <p className="auth-subtitle">Ingresá tu email y te enviaremos un enlace para restablecerla.</p>

              <form onSubmit={handleSubmit}>
                <div className="auth-input-group">
                  <Mail className="auth-input-icon" size={20} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="tuemail@ejemplo.com" 
                    required 
                  />
                </div>

                <button className="auth-btn-submit" type="submit">
                  <Send size={20} /> Enviar enlace
                </button>
              </form>

              <div className="auth-links">
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowLeft size={16} /> Volver al login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
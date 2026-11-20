import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../utils/alertas.js';
import { User, Phone, MapPin, Mail, Save, ShieldCheck } from 'lucide-react';

export default function MiCuenta() {
  const { usuario, token } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/auth/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.id_usuario) {
          setFormData({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            telefono: data.telefono || '',
            direccion: data.direccion || ''
          });
        }
        setCargando(false);
      })
      .catch(() => {
        toast('Error al cargar datos');
        setCargando(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast('Perfil actualizado con éxito');
    } catch (err) {
      toast(err.message);
    }
  };

  if (cargando) return <p style={{ textAlign: 'center', marginTop: '3rem', color: '#6b7280' }}>Cargando perfil...</p>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem' }}>
      
      {/* Tarjeta del Formulario */}
      <div style={{ 
        width: '100%', 
        maxWidth: '650px', 
        background: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        overflow: 'hidden' 
      }}>
        
        {/* Encabezado de la Tarjeta (Toque de color) */}
        <div style={{ 
          background: 'linear-gradient(135deg, #e63946 0%, #ff7e5f 100%)', 
          padding: '2rem', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', backdropFilter: 'blur(5px)' }}>
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Mi Perfil</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>{usuario?.email}</p>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div style={{ padding: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Mantené tus datos actualizados para agilizar tus compras. Esta dirección se usará por defecto en tu carrito.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                  placeholder="Nombre"
                  required 
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#e63946'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="text" 
                  value={formData.apellido} 
                  onChange={e => setFormData({...formData, apellido: e.target.value})} 
                  placeholder="Apellido"
                  required 
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#e63946'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="email" 
                value={usuario?.email || ''} 
                disabled
                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', backgroundColor: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }}
                title="El email no se puede modificar"
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="tel" 
                value={formData.telefono} 
                onChange={e => setFormData({...formData, telefono: e.target.value})} 
                placeholder="Teléfono de contacto (Ej: 11 2345-6789)"
                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#e63946'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <MapPin size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="text" 
                value={formData.direccion} 
                onChange={e => setFormData({...formData, direccion: e.target.value})} 
                placeholder="Dirección de entrega por defecto"
                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#e63946'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                background: '#e63946', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', 
                fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', transition: 'background 0.2s' 
              }}
              onMouseOver={(e) => e.target.style.background = '#c1121f'}
              onMouseOut={(e) => e.target.style.background = '#e63946'}
            >
              <Save size={20} /> Guardar Cambios
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', color: '#059669', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} /> Tus datos están protegidos de forma segura.
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../utils/alertas.js';
import { User, Phone, MapPin } from 'lucide-react';

export default function MiCuenta() {
  const { usuario, token } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });
  const [cargando, setCargando] = useState(true);

  // 1. Traer los datos del usuario al cargar la página
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

  // 2. Guardar los cambios
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

  if (cargando) return <p>Cargando...</p>;

  return (
    <section className="tarjeta-formulario" style={{ maxWidth: '600px' }}>
      <h2>Mi Cuenta</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Hola, {usuario?.nombre}. Actualizá tus datos de entrega.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="fila">
          <label>
            Nombre
            <input 
              className="campo" 
              type="text" 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
              required 
            />
          </label>
          <label>
            Apellido
            <input 
              className="campo" 
              type="text" 
              value={formData.apellido} 
              onChange={e => setFormData({...formData, apellido: e.target.value})} 
              required 
            />
          </label>
        </div>

        <label>
          Teléfono de contacto
          <input 
            className="campo" 
            type="tel" 
            value={formData.telefono} 
            onChange={e => setFormData({...formData, telefono: e.target.value})} 
            placeholder="Ej: 11 2345-6789"
          />
        </label>

        <label>
          Dirección de entrega por defecto
          <input 
            className="campo" 
            type="text" 
            value={formData.direccion} 
            onChange={e => setFormData({...formData, direccion: e.target.value})} 
            placeholder="Calle, número, piso..."
          />
        </label>

        <button className="boton boton--ancho" type="submit" style={{ marginTop: '1rem' }}>
          Guardar Cambios
        </button>
      </form>
    </section>
  );
}
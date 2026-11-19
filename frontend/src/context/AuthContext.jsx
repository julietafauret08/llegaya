import { createContext, useContext, useState } from 'react';
import { apiFetch } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario'));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = async (email, password) => {
    const datos = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    setToken(datos.token);
    setUsuario(datos.usuario);
    return datos.usuario;
  };

  const registro = (datosFormulario) =>
    apiFetch('/auth/registro', { method: 'POST', body: datosFormulario });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    
    // 👇 ESTA ES LA LÍNEA QUE HACE QUE SE VACÍE EL CARRITO
    window.dispatchEvent(new Event('logout')); 
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
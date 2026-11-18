const API_URL = import.meta.env.VITE_API_URL;

// Todas las llamadas al back pasan por acá: agrega el token y maneja los errores
export const apiFetch = async (ruta, opciones = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(opciones.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers,
    body: opciones.body ? JSON.stringify(opciones.body) : undefined
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    throw new Error(datos?.error || 'Ocurrió un error, intentá de nuevo');
  }
  return datos;
};
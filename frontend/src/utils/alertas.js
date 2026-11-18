import Swal from 'sweetalert2';

const base = { confirmButtonColor: '#ff6b35', cancelButtonColor: '#6b7280' };

export const alertaExito = (titulo, texto = '') =>
  Swal.fire({ ...base, icon: 'success', title: titulo, text: texto });

export const alertaError = (titulo, texto = '') =>
  Swal.fire({ ...base, icon: 'error', title: titulo, text: texto });

export const alertaAviso = (titulo, texto = '') =>
  Swal.fire({ ...base, icon: 'warning', title: titulo, text: texto });

export const confirmar = async (titulo, texto = '') => {
  const r = await Swal.fire({
    ...base,
    icon: 'question',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  });
  return r.isConfirmed;
};

// Aviso chiquito arriba a la derecha
export const toast = (titulo, icono = 'success') =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icono,
    title: titulo,
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true
  });
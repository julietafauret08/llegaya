import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch {
      return [];
    }
  });

  // El carrito se guarda en el navegador, así no se pierde al recargar
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregar = (producto) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id_producto === producto.id_producto);
      if (existe) {
        return prev.map((i) =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: Math.min(i.cantidad + 1, producto.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          imagen: producto.imagen,
          stock: producto.stock,
          cantidad: 1
        }
      ];
    });
  };

  const cambiarCantidad = (id_producto, cantidad) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id_producto === id_producto
          ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) }
          : i
      )
    );
  };

  const quitar = (id_producto) =>
    setItems((prev) => prev.filter((i) => i.id_producto !== id_producto));

  const vaciar = () => setItems([]);

  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, agregar, cambiarCantidad, quitar, vaciar, total, cantidadTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
/**
 * Hook que da acceso al contexto del carrito.
 */

import { useContext } from 'react';
import { CarritoContext } from '../store/CarritoContext';

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) {
    throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  }
  return ctx;
}

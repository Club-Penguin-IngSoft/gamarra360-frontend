/**
 * Hook para cargar el detalle de un producto por id.
 */

import { useEffect, useState } from 'react';
import { obtenerProducto } from '../services/catalogoService';
import type { IProducto } from '../types/IProducto';

export function useProducto(id: string | undefined) {
  const [producto, setProducto] = useState<IProducto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }
    let cancelado = false;
    setCargando(true);
    setError(null);
    obtenerProducto(id)
      .then((p) => {
        if (!cancelado) setProducto(p);
      })
      .catch((e: Error) => {
        if (!cancelado) setError(e.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  return { producto, cargando, error };
}

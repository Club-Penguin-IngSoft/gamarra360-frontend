/**
 * Hook para cargar el detalle de una tienda por id.
 */

import { useEffect, useState } from 'react';
import { obtenerTienda } from '../services/tiendaService';
import type { ITienda } from '../types/ITienda';

export function useTienda(id: string | undefined) {
  const [tienda, setTienda] = useState<ITienda | null>(null);
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
    obtenerTienda(id)
      .then((t) => {
        if (!cancelado) setTienda(t);
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

  return { tienda, cargando, error };
}

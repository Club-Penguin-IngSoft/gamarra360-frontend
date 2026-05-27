/**
 * Hook que encapsula la lógica de carga del catálogo. Mantiene los estados
 * `productos`, `cargando` y `error`. La capa de UI solo consume — sigue la
 * regla CLAUDE.md §4: "La lógica de llamadas a la API reside en hooks, no en
 * los componentes".
 */

import { useEffect, useState } from 'react';
import { listarProductos } from '../services/catalogoService';
import type { IProducto } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';

export function useCatalogo(filtros?: Partial<IFiltrosCatalogo>) {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serializa los filtros para evitar re-fetches en cada render
  const claveFiltros = JSON.stringify(filtros ?? {});

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    listarProductos(filtros)
      .then((data) => {
        if (cancelado) return;
        setProductos(data.items);
        setTotalItems(data.totalItems ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPage(data.page ?? 1);
        setSize(data.size ?? 0);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveFiltros]);

  return { productos, totalItems, totalPages, page, size, cargando, error };
}

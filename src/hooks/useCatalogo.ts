/**
 * Hook que encapsula la lógica de carga del catálogo con paginación.
 *
 * Estrategia:
 *  - Sin filtros  → llama al backend con page/size → server-side pagination
 *  - Con filtros  → llama con size=500, filtra client-side, pagina en memoria
 *
 * Retorna siempre los productos de la página actual (ya recortados),
 * junto con totalPaginas y totalElementos para que la UI pueda renderizar
 * los controles de paginación correctamente.
 */

import { useEffect, useState } from 'react';
import { listarProductos, listarProductosPaginados } from '../services/catalogoService';
import type { IProducto } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';

function tieneFiltrosActivos(filtros?: Partial<IFiltrosCatalogo>): boolean {
  if (!filtros) return false;
  return (
    (filtros.categorias?.length ?? 0) > 0 ||
    filtros.tipoServicio != null ||
    filtros.precioMin != null ||
    filtros.precioMax != null
  );
}

export function useCatalogo(
  filtros?: Partial<IFiltrosCatalogo>,
  /** Página actual — 1-indexed (la UI usa 1-based, el backend 0-based) */
  page: number = 1,
  size: number = 12,
) {
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const claveFiltros = JSON.stringify(filtros ?? {});
  const conFiltros = tieneFiltrosActivos(filtros);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    if (conFiltros) {
      // ── Con filtros: trae lote grande, filtra y pagina en memoria ──────
      listarProductos(filtros)
        .then((todos) => {
          if (cancelado) return;
          const total = todos.length;
          const totalPags = Math.max(1, Math.ceil(total / size));
          const safePage = Math.min(page, totalPags);
          const slice = todos.slice((safePage - 1) * size, safePage * size);
          setProductos(slice);
          setTotalPaginas(totalPags);
          setTotalElementos(total);
        })
        .catch((e: Error) => { if (!cancelado) setError(e.message); })
        .finally(() => { if (!cancelado) setCargando(false); });
    } else {
      // ── Sin filtros: server-side pagination ─────────────────────────────
      listarProductosPaginados(page - 1, size)   // convierte a 0-indexed
        .then(({ contenido, totalPaginas: tp, totalElementos: te }) => {
          if (cancelado) return;
          setProductos(contenido);
          setTotalPaginas(tp === 0 ? 1 : tp);
          setTotalElementos(te);
        })
        .catch((e: Error) => { if (!cancelado) setError(e.message); })
        .finally(() => { if (!cancelado) setCargando(false); });
    }

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveFiltros, page, size, conFiltros]);

  return { productos, totalPaginas, totalElementos, cargando, error };
}

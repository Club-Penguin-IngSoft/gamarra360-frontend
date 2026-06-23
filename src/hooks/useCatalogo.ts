/**
 * Hook que encapsula la lógica de carga del catálogo con paginación.
 *
 * Estrategia:
 *  - categorias, tiposProducto, color, tallas, precioMin/Max → server-side (params al backend)
 *  - tipoServicio, material → client-side (derivados en el adaptador, el backend no los filtra)
 *
 * Cuando hay filtros client-side activos, se pide un lote grande al backend
 * (pre-filtrado por server-side) y se pagina en memoria.
 * Sin filtros client-side, se usa la paginación del backend directamente.
 */
import { useEffect, useState } from 'react';
import { listarProductosPaginados } from '../services/catalogoService';
import type { IProducto } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';

function tieneFiltrosClienteSide(filtros?: Partial<IFiltrosCatalogo>): boolean {
  if (!filtros) return false;
  return (
    (filtros.tipoServicio?.length ?? 0) > 0 ||
    (filtros.materiales?.length ?? 0) > 0 ||
    filtros.ofreceEnvio === true
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
  const conFiltrosCliente = tieneFiltrosClienteSide(filtros);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    if (conFiltrosCliente) {
      // tipoServicio / material requieren filtrado en el cliente.
      // El backend ya pre-filtra el resto (categorias, tiposProducto, etc.)
      // así que el lote traído es más pequeño que el total.
      listarProductosPaginados(0, 500, filtros)
        .then(({ contenido }) => {
          if (cancelado) return;

          let filtrados = contenido;
          if (filtros?.tipoServicio && filtros.tipoServicio.length > 0) {
            filtrados = filtrados.filter((p) => {
              const coincide = filtros.tipoServicio!.includes(p.tipoServicio);
              const esHibrida =
                filtros.tipoServicio!.includes('COMPRA_DIRECTA') && p.precioFinal != null;
              return coincide || esHibrida;
            });
          }
          if (filtros?.materiales && filtros.materiales.length > 0) {
            const mats = filtros.materiales;
            filtrados = filtrados.filter((p) =>
              mats.some(
                (m) =>
                  p.materialPrincipal === m ||
                  p.materiales?.includes(m) ||
                  p.especificaciones?.some((e) => e.etiqueta === 'Material' && e.valor === m),
              ),
            );
          }
          if (filtros?.ofreceEnvio === true) {
            filtrados = filtrados.filter((p) => p.tiendaOfreceEnvio === true);
          }

          const total = filtrados.length;
          const totalPags = Math.max(1, Math.ceil(total / size));
          const safePage = Math.min(page, totalPags);
          const slice = filtrados.slice((safePage - 1) * size, safePage * size);

          setProductos(slice);
          setTotalPaginas(totalPags);
          setTotalElementos(total);
        })
        .catch((e: Error) => { if (!cancelado) setError(e.message); })
        .finally(() => { if (!cancelado) setCargando(false); });
    } else {
      // Todos los filtros activos son server-side → paginación real del backend
      listarProductosPaginados(page - 1, size, filtros)
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
  }, [claveFiltros, page, size, conFiltrosCliente]);

  return { productos, totalPaginas, totalElementos, cargando, error };
}

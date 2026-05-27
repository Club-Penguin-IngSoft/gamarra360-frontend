/**
 * Capa de acceso al backend para el módulo `catalogo`.
 *
 * Conecta con los endpoints REST del backend Spring Boot:
 *  - GET /api/v1/productos          → listar con filtros + búsqueda por relevancia
 *  - GET /api/v1/productos/{id}     → detalle completo del producto
 *  - GET /api/v1/productos/tienda/{idTienda} → catálogo de una tienda
 *
 * Las funciones devuelven `IProducto` ya en formato consumible por la UI.
 * El backend hace el ranqueo por relevancia (CU-08), filtrado por activo y
 * exclusión de comerciantes no verificados.
 */

import type {
  IProducto,
  EtiquetaProducto,
} from '../types/IProducto';
import { ETIQUETA_POR_TIPO_SERVICIO } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';
import apiClient from './apiClient';

/* ============================== API pública =========================== */

/**
 * Convierte el estado de filtros del frontend en query params para el backend.
 *
 * Axios serializa arrays por defecto como `?categorias=A&categorias=B`, lo cual
 * coincide con cómo Spring MVC bindea List<String> a un FiltrosCatalogoDto.
 *
 * Los valores `null` y arrays vacíos se omiten para mantener la URL limpia.
 */
function filtrosToParams(filtros?: Partial<IFiltrosCatalogo>): Record<string, unknown> {
  if (!filtros) return {};
  const params: Record<string, unknown> = {};

  if (filtros.q && filtros.q.trim()) params.q = filtros.q.trim();
  if (filtros.entrega) params.entrega = filtros.entrega;
  if (filtros.tipoServicio) params.tipoServicio = filtros.tipoServicio;
  if (filtros.categorias && filtros.categorias.length > 0)
    params.categorias = filtros.categorias;
  if (filtros.tiposProducto && filtros.tiposProducto.length > 0)
    params.tiposProducto = filtros.tiposProducto;
  if (filtros.color) params.color = filtros.color;
  if (filtros.material) params.material = filtros.material;
  if (filtros.tallas && filtros.tallas.length > 0) params.tallas = filtros.tallas;
  if (filtros.precioMin != null) params.precioMin = filtros.precioMin;
  if (filtros.precioMax != null) params.precioMax = filtros.precioMax;
  if (filtros.sort) params.sort = filtros.sort;
  if (filtros.page != null) params.page = filtros.page;
  if (filtros.size != null) params.size = filtros.size;
  if (filtros.random != null) params.random = filtros.random;
  if (filtros.seed != null) params.seed = filtros.seed;

  return params;
}

/**
 * Lista productos del catálogo público aplicando filtros.
 *
 * El backend ya:
 *  - Filtra `productos.activo = TRUE`
 *  - Excluye comerciantes no verificados (CU-07, RF-20/21)
 *  - Ordena por relevancia cuando hay `q` (CU-08, RF-22/23)
 */
export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export async function listarProductos(
  filtros?: Partial<IFiltrosCatalogo>,
): Promise<PagedResponse<IProducto>> {
  const { data } = await apiClient.get<PagedResponse<IProducto>>('/productos', {
    params: filtrosToParams(filtros),
    // Importante: para que Axios envíe categorias=A&categorias=B (no categorias=A,B)
    paramsSerializer: { indexes: null },
  });
  return data;
}

/**
 * Devuelve el detalle completo de un producto por id.
 * Lanza `RecursoNoEncontradoException` (404) si no existe o está inactivo —
 * el `apiClient` interceptor convierte el error de Axios en el formato uniforme.
 */
export async function obtenerProducto(id: string): Promise<IProducto> {
  const { data } = await apiClient.get<IProducto>(`/productos/${id}`);
  return data;
}

/**
 * Lista los productos de una tienda específica (por su `id_tienda`).
 *
 * Usado en:
 *  - DetalleProductoPage > "Más de esta tienda"
 *  - DetalleTiendaPage > sección Catálogo
 *
 * @param idTienda  id de la tienda (productos.id_tienda)
 * @param excluirId opcional — id de producto a excluir (ej. el actual en
 *                  la página de detalle, para no mostrarlo en "relacionados")
 */
export async function listarProductosDeTienda(
  idTienda: string,
  excluirId?: string,
): Promise<IProducto[]> {
  const { data } = await apiClient.get<IProducto[]>(
    `/productos/tienda/${idTienda}`,
  );
  return excluirId ? data.filter((p) => p.id !== excluirId) : data;
}

/* --------------------------- Helpers de UI ----------------------------- */

/**
 * Convierte el enum TipoServicio del backend a la etiqueta visible en la UI.
 * NOTA: el backend nunca devolverá "COTIZACION" en `tipoServicio` (es flujo
 * aparte). Solo "COMPRA_DIRECTA" o "PERSONALIZABLE".
 */
export function etiquetaDeProducto(producto: IProducto): EtiquetaProducto {
  return ETIQUETA_POR_TIPO_SERVICIO[producto.tipoServicio];
}

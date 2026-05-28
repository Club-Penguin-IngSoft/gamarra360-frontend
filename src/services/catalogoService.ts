/**
 * Capa de acceso al backend para el módulo `catalogo`.
 *
 * El backend SIEMPRE devuelve PaginaResponse<ProductoResponse>, nunca un array plano.
 * Estructura: { contenido: [...], paginaActual, totalPaginas, totalElementos }
 */

import type { IProducto, IVarianteProducto, EtiquetaProducto, Categoria, TipoServicio } from '../types/IProducto';
import { ETIQUETA_POR_TIPO_SERVICIO } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';
import apiClient from './apiClient';

/* ── Tipos del backend ─────────────────────────────────────────────────── */

interface IProductoBackend {
  idProducto: number;
  nombre: string;
  descripcion?: string;
  precioBase?: number;
  esPersonalizable: boolean;
  activo: boolean;
  idTienda?: number;
  nombreTienda?: string;
  categorias: { idCategoria: number; nombre: string }[];
  imagenes: { idImagen: number; url: string; esPrincipal: boolean }[];
  variantes: {
    idVariante: number;
    sku?: string;
    stock?: number;
    precioAjustado?: number;
    disponible?: boolean;
    idTalla?: number;
    idColor?: number;
  }[];
}

/** El backend SIEMPRE devuelve esta estructura — validado en Postman */
interface IPageBackend {
  contenido: IProductoBackend[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
}

/* ── Mapeo categoría ───────────────────────────────────────────────────── */

function mapearCategoria(nombre: string): Categoria {
  const n = nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const tabla: Record<string, Categoria> = {
    HOMBRE:         'HOMBRE',
    MUJER:          'MUJER',
    NINOS:          'NINOS',
    NINO:           'NINOS',
    NINAS:          'NINOS',
    NINA:           'NINOS',
    INFANTIL:       'NINOS',
    UNISEX_ADULTOS: 'UNISEX_ADULTOS',
    UNISEX_ADULTO:  'UNISEX_ADULTOS',
    UNISEX:         'UNISEX_ADULTOS',
    UNISEX_NINOS:   'UNISEX_NINOS',
    UNISEX_NINO:    'UNISEX_NINOS',
  };

  return tabla[n] ?? 'HOMBRE';
}

/* ── Derivar TipoServicio ──────────────────────────────────────────────── */

function derivarTipoServicio(p: IProductoBackend): TipoServicio {
  if (p.esPersonalizable) return 'PERSONALIZABLE';
  if (p.precioBase == null || p.precioBase === 0) return 'COTIZACION';
  return 'COMPRA_DIRECTA';
}

/* ── Adaptador backend → IProducto ────────────────────────────────────── */

function adaptarProducto(p: IProductoBackend): IProducto {
  const tipoServicio = derivarTipoServicio(p);

  const urlsImagenes = [...p.imagenes]
    .sort((a, b) => (b.esPrincipal ? 1 : 0) - (a.esPrincipal ? 1 : 0))
    .map((i) => i.url)
    .filter(Boolean);

  const variantes: IVarianteProducto[] = p.variantes.map((v) => ({
    id: String(v.idVariante),
    stock: v.stock ?? 0,
  }));

  return {
    id: String(p.idProducto),
    titulo: p.nombre,
    descripcion: p.descripcion,
    idComerciante: String(p.idTienda ?? ''),
    nombreTienda: p.nombreTienda ?? '',
    imagenes: urlsImagenes,
    categoria: p.categorias.length > 0
      ? mapearCategoria(p.categorias[0].nombre)
      : 'HOMBRE',
    tipoServicio,
    precioBase: p.precioBase ?? undefined,
    precioFinal: p.precioBase ?? undefined,
    variantes: variantes.length > 0 ? variantes : undefined,
  };
}

/* ── API pública ───────────────────────────────────────────────────────── */

/**
 * Función central: llama a GET /productos?page=X&size=Y
 * El backend siempre devuelve PaginaResponse, nunca array plano.
 *
 * @param page    Página 0-indexed
 * @param size    Items por página (usar 500 para traer todo en modo filtros)
 */
export async function listarProductosPaginados(
  page: number = 0,
  size: number = 12,
  _filtros?: Partial<IFiltrosCatalogo>,
): Promise<{ contenido: IProducto[]; totalPaginas: number; totalElementos: number }> {
  const { data } = await apiClient.get<IPageBackend>('/productos', {
    params: { page, size },
  });

  return {
    contenido: data.contenido.map(adaptarProducto),
    totalPaginas: data.totalPaginas,
    totalElementos: data.totalElementos,
  };
}

/**
 * Alias para compatibilidad — trae hasta 500 productos para filtrado client-side.
 */
export async function listarProductos(
  filtros?: Partial<IFiltrosCatalogo>,
): Promise<IProducto[]> {
  const { contenido } = await listarProductosPaginados(0, 500, filtros);
  return contenido;
}

/** Devuelve el detalle de un producto por id. */
export async function obtenerProducto(id: string): Promise<IProducto> {
  const { data } = await apiClient.get<IProductoBackend>(`/productos/${id}`);
  return adaptarProducto(data);
}

/** Devuelve los productos de una tienda específica. */
export async function listarProductosDeTienda(
  idComerciante: string,
  excluirId?: string,
): Promise<IProducto[]> {
  const { data } = await apiClient.get<any>(`/productos/tienda/${idComerciante}`);
  const lista = Array.isArray(data)
    ? (data as IProductoBackend[]).map(adaptarProducto)
    : (data as IPageBackend).contenido.map(adaptarProducto);

  return excluirId ? lista.filter((p) => p.id !== excluirId) : lista;
}

/** Convierte TipoServicio a etiqueta visible en la UI. */
export function etiquetaDeProducto(producto: IProducto): EtiquetaProducto {
  return ETIQUETA_POR_TIPO_SERVICIO[producto.tipoServicio];
}
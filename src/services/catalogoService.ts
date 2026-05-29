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
  idCategoria?: number;
  nombreCategoria?: string;
  idTipoProducto?: number;
  nombreTipoProducto?: string;
  imagenes: { idImagen: number; url: string; esPrincipal: boolean }[] | null;
  variantes: {
    idVariante: number;
    sku?: string;
    stock?: number;
    precioAjustado?: number;
    disponible?: boolean;
    idTalla?: number;
    idColor?: number;
  }[] | null;
}

export interface ICategoriaOpcion {
  idCategoria: number;
  nombre: string;
}

export interface ITipoProductoOpcion {
  idTipoProducto: number;
  nombre: string;
  idCategoria: number;
}

export interface IProductoPayload {
  nombre: string;
  descripcion: string;
  precioBase: number;
  esPersonalizable: boolean;
  idCategoria: number;
  idTipoProducto: number;
  imagenes: { url: string; esPrincipal: boolean }[];
}

export interface IVariantePayload {
  sku: string;
  stock: number;
  minimoStock: number;
  precioAjustado: number;
  disponible: boolean;
  producto: { idProducto: number };
  color: { idColor: number };
  talla: { idTalla: number };
}

/** Busca una talla por nombre; si no existe la crea. Devuelve el idTalla. */
export async function resolverTalla(nombre: string): Promise<number> {
  const { data: tallas } = await apiClient.get<{ idTalla: number; talla: string }[]>('/tallas');
  const existe = tallas.find((t) => t.talla.toUpperCase() === nombre.toUpperCase());
  if (existe) return existe.idTalla;
  const { data } = await apiClient.post<{ idTalla: number }>('/tallas', { talla: nombre, activo: true });
  return data.idTalla;
}

/** Busca un color por nombre; si no existe lo crea. Devuelve el idColor. */
export async function resolverColor(nombre: string, hex: string): Promise<number> {
  const { data: colores } = await apiClient.get<{ idColor: number; nombre: string }[]>('/colores');
  const existe = colores.find((c) => c.nombre.toUpperCase() === nombre.toUpperCase());
  if (existe) return existe.idColor;
  const { data } = await apiClient.post<{ idColor: number }>('/colores', { nombre, codHex: hex, activo: true });
  return data.idColor;
}

/** Crea una variante en el backend. */
export async function crearVariante(payload: IVariantePayload): Promise<void> {
  await apiClient.post('/variantes-producto', payload);
}

/** Actualiza una variante existente en el backend. */
export async function actualizarVariante(idVariante: number, payload: Partial<IVariantePayload>): Promise<void> {
  await apiClient.put(`/variantes-producto/${idVariante}`, payload);
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

  const urlsImagenes = [...(p.imagenes ?? [])]
    .sort((a, b) => (b.esPrincipal ? 1 : 0) - (a.esPrincipal ? 1 : 0))
    .map((i) => i.url)
    .filter(Boolean);

  const variantes: IVarianteProducto[] = (p.variantes ?? []).map((v) => ({
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
    categoria: p.nombreCategoria ? mapearCategoria(p.nombreCategoria) : 'HOMBRE',
    tipoServicio,
    precioBase: p.precioBase ?? undefined,
    precioFinal: p.precioBase ?? undefined,
    variantes: variantes.length > 0 ? variantes : undefined,
  };
}

/* ── Helpers internos ──────────────────────────────────────────────────── */

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

/** Devuelve las categorías disponibles para los selects del formulario. */
export async function listarCategorias(): Promise<ICategoriaOpcion[]> {
  const { data } = await apiClient.get<{ idCategoria: number; nombreCategoria: string }[]>('/categorias');
  return data.map((c) => ({ idCategoria: c.idCategoria, nombre: c.nombreCategoria }));
}

/** Devuelve los tipos de producto de una categoría para el select dependiente. */
export async function listarTiposPorCategoria(idCategoria: number): Promise<ITipoProductoOpcion[]> {
  const { data } = await apiClient.get<ITipoProductoOpcion[]>('/tipos-producto', {
    params: { categoriaId: idCategoria },
  });
  return data;
}

/** Crea un producto en la tienda del comerciante autenticado (POST /productos). */
export async function crearProducto(payload: IProductoPayload): Promise<IProducto> {
  const { data } = await apiClient.post<IProductoBackend>('/productos', payload);
  return adaptarProducto(data);
}

/** Actualiza un producto existente (PUT /productos/{id}). */
export async function actualizarProducto(id: string, payload: IProductoPayload): Promise<IProducto> {
  const { data } = await apiClient.put<IProductoBackend>(`/productos/${id}`, payload);
  return adaptarProducto(data);
}

/** Eliminación lógica de un producto (DELETE /productos/{id}). */
export async function eliminarProducto(id: string): Promise<void> {
  await apiClient.delete(`/productos/${id}`);
}
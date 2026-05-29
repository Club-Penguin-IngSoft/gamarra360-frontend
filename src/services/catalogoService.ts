/**
 * Capa de acceso al backend para el módulo `catalogo`.
 *
 * Conectado al backend Spring Boot en /api/v1/productos.
 * El endpoint acepta ?page=N&size=M y devuelve PaginaResponse<ProductoResponse>.
 *
 * Estrategia de filtrado:
 *  - Sin filtros  → paginación server-side (eficiente con miles de productos)
 *  - Con filtros  → lote grande (size=500) + filtrado client-side (backend work pendiente)
 */

import type { IProducto, IVarianteProducto, EtiquetaProducto, Categoria, TipoServicio } from '../types/IProducto';
import { ETIQUETA_POR_TIPO_SERVICIO } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';
import apiClient from './apiClient';

/* ── Tipo que devuelve el backend ──────────────────────────────────────── */

interface IProductoBackend {
  idProducto: number;
  nombre: string;
  descripcion?: string;
  precioBase?: number;
  precioFinal?: number;
  esPersonalizable: boolean;
  activo: boolean;
  idTienda?: number;
  nombreTienda?: string;
  categorias: { idCategoria: number; nombre: string }[];
  tipoProducto?: { idTipoProducto: number; nombre: string } | null;
  especificaciones?: { nombre: string; descripcion: string }[];
  imagenes: { idImagen: number; url: string; esPrincipal: boolean }[];
  variantes: {
    idVariante: number;
    sku?: string;
    stock?: number;
    precioAjustado?: number;
    disponible?: boolean;
    talla?: string;
    color?: string;
    colorHex?: string;
  }[];
}

interface IPaginaRespuestaBackend {
  contenido: IProductoBackend[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
}

/** Resultado paginado expuesto al resto del frontend */
export interface IPaginaProductos {
  contenido: IProducto[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
}

/* ── Mapeo de nombre de categoría DB → enum frontend ──────────────────── */

function mapearCategoria(nombre: string): Categoria {
  const n = nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const tabla: Record<string, Categoria> = {
    HOMBRE:          'HOMBRE',
    MUJER:           'MUJER',
    NINOS:           'NINOS',
    NINO:            'NINOS',
    NINAS:           'NINOS',
    NINA:            'NINOS',
    INFANTIL:        'NINOS',
    UNISEX_ADULTOS:  'UNISEX_ADULTOS',
    UNISEX_ADULTO:   'UNISEX_ADULTOS',
    UNISEX:          'UNISEX_ADULTOS',
    UNISEX_NINOS:    'UNISEX_NINOS',
    UNISEX_NINO:     'UNISEX_NINOS',
  };

  return tabla[n] ?? 'HOMBRE';
}

/* ── Derivar TipoServicio desde campos del backend ────────────────────── */

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
    talla: v.talla ?? undefined,
    color: v.color ?? undefined,
    colorHex: v.colorHex ?? undefined,
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
    tipoProducto: p.tipoProducto?.nombre ?? undefined,
    especificaciones: p.especificaciones?.map((e) => ({
      etiqueta: e.nombre,
      valor: e.descripcion,
    })),
    precioBase: p.precioBase ?? undefined,
    precioFinal: p.precioFinal ?? p.precioBase ?? undefined,
    variantes: variantes.length > 0 ? variantes : undefined,
  };
}

/* ── Helpers internos ──────────────────────────────────────────────────── */

function aplicarFiltrosClienteSide(
  productos: IProducto[],
  filtros: Partial<IFiltrosCatalogo>,
): IProducto[] {
  let resultado = productos;
  if (filtros.categorias && filtros.categorias.length > 0) {
    resultado = resultado.filter((p) => filtros.categorias!.includes(p.categoria));
  }
  if (filtros.tiposProducto && filtros.tiposProducto.length > 0) {
    resultado = resultado.filter(
      (p) => p.tipoProducto != null && filtros.tiposProducto!.includes(p.tipoProducto),
    );
  }
  if (filtros.tipoServicio) {
    resultado = resultado.filter((p) => p.tipoServicio === filtros.tipoServicio);
  }
  // Filtra por material: busca en especificaciones la que tiene nombre='Material'
  if (filtros.material != null) {
    resultado = resultado.filter((p) =>
      p.especificaciones?.some(
        (e) => e.etiqueta === 'Material' && e.valor === filtros.material,
      ),
    );
  }
  // Filtra por color: el producto debe tener al menos una variante con ese color
  if (filtros.color != null) {
    resultado = resultado.filter(
      (p) => p.variantes?.some((v) => v.color === filtros.color),
    );
  }
  // Filtra por tallas: el producto debe tener al menos una variante con alguna de las tallas
  if (filtros.tallas && filtros.tallas.length > 0) {
    resultado = resultado.filter(
      (p) => p.variantes?.some((v) => v.talla != null && filtros.tallas!.includes(v.talla)),
    );
  }
  if (filtros.precioMin != null) {
    resultado = resultado.filter(
      (p) => (p.precioFinal ?? Infinity) >= filtros.precioMin!,
    );
  }
  if (filtros.precioMax != null) {
    resultado = resultado.filter(
      (p) => (p.precioFinal ?? 0) <= filtros.precioMax!,
    );
  }
  return resultado;
}

/* ── API pública ───────────────────────────────────────────────────────── */

/**
 * Trae una página de productos del backend (server-side pagination).
 * Usar en CatalogoPage sin filtros para máxima eficiencia.
 */
export async function listarProductosPaginados(
  page: number = 0,
  size: number = 12,
): Promise<IPaginaProductos> {
  const { data } = await apiClient.get<IPaginaRespuestaBackend>('/productos', {
    params: { page, size },
  });
  return {
    contenido:      data.contenido.map(adaptarProducto),
    paginaActual:   data.paginaActual,
    totalPaginas:   data.totalPaginas,
    totalElementos: data.totalElementos,
  };
}

/**
 * Trae un lote grande y aplica filtros client-side.
 * Usar cuando hay filtros activos (categoría, tipo, precio).
 * Tamaño máximo configurable — por defecto 500.
 */
export async function listarProductos(
  filtros?: Partial<IFiltrosCatalogo>,
  maxSize: number = 500,
): Promise<IProducto[]> {
  const { data } = await apiClient.get<IPaginaRespuestaBackend>('/productos', {
    params: { page: 0, size: maxSize },
  });
  const todos = data.contenido.map(adaptarProducto);
  return filtros ? aplicarFiltrosClienteSide(todos, filtros) : todos;
}

/**
 * Devuelve el detalle de un producto por id. Lanza error si no existe.
 */
export async function obtenerProducto(id: string): Promise<IProducto> {
  const { data } = await apiClient.get<IProductoBackend>(`/productos/${id}`);
  return adaptarProducto(data);
}

/**
 * Devuelve los productos de una tienda específica (excluyendo opcionalmente uno).
 */
export async function listarProductosDeTienda(
  idComerciante: string,
  excluirId?: string,
): Promise<IProducto[]> {
  const { data } = await apiClient.get<IProductoBackend[]>(
    `/productos/tienda/${idComerciante}`,
  );
  let resultado = data.map(adaptarProducto);
  if (excluirId) {
    resultado = resultado.filter((p) => p.id !== excluirId);
  }
  return resultado;
}

/**
 * Convierte el enum TipoServicio del backend a la etiqueta visible en la UI.
 */
export function etiquetaDeProducto(producto: IProducto): EtiquetaProducto {
  return ETIQUETA_POR_TIPO_SERVICIO[producto.tipoServicio];
}

/* ── Opciones de filtros dinámicas ─────────────────────────────────────── */

export interface IOpcionesFiltro {
  colores: string[];
  materiales: string[];
  tallas: string[];
  tiposProducto: string[];
}

/**
 * Devuelve los valores disponibles para cada filtro del catálogo,
 * derivados directamente de la BD (no hardcodeados).
 * Llamada a GET /api/v1/productos/opciones-filtro
 */
export async function obtenerOpcionesFiltro(): Promise<IOpcionesFiltro> {
  const { data } = await apiClient.get<IOpcionesFiltro>('/productos/opciones-filtro');
  return data;
}

/**
 * Trae los N productos más recientes por cada categoría activa.
 * Diseñado para la sección "Catálogo" del inicio.
 * Llamada a GET /api/v1/productos/destacados?porCategoria=8
 *
 * Devuelve una lista plana de IProducto (todas las categorías mezcladas).
 * El frontend agrupa/filtra por p.categoria según el tab activo.
 */
export async function listarProductosDestacados(
  porCategoria = 8,
): Promise<IProducto[]> {
  const { data } = await apiClient.get<Record<string, IProductoBackend[]>>(
    '/productos/destacados',
    { params: { porCategoria } },
  );
  // Aplanar el mapa { "Hombre": [...], "Mujer": [...] } en una lista única
  return Object.values(data).flat().map(adaptarProducto);
}

/**
 * Capa de acceso al backend para el módulo `catalogo`.
 *
 * Conectado al backend Spring Boot en /api/v1/productos.
 * El filtrado se aplica client-side porque el backend aún no acepta
 * query params de filtro en el endpoint GET /productos.
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

/* ── Mapeo de nombre de categoría DB → enum frontend ──────────────────── */

function mapearCategoria(nombre: string): Categoria {
  // Normaliza: mayúsculas, sin tildes, espacios → guiones bajos
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

  // Imágenes: primero las principales, luego el resto
  const urlsImagenes = [...p.imagenes]
    .sort((a, b) => (b.esPrincipal ? 1 : 0) - (a.esPrincipal ? 1 : 0))
    .map((i) => i.url)
    .filter(Boolean);

  const variantes: IVarianteProducto[] = p.variantes.map((v) => ({
    id: String(v.idVariante),
    stock: v.stock ?? 0,
    // talla y color requieren llamadas adicionales al backend (pendiente)
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
 * Lista productos del catálogo aplicando filtros opcionales (client-side).
 */
export async function listarProductos(
  filtros?: Partial<IFiltrosCatalogo>,
): Promise<IProducto[]> {
  const { data } = await apiClient.get<IProductoBackend[]>('/productos');
  let resultado = data.map(adaptarProducto);

  // Filtrado client-side (el backend aún no acepta query params de filtro)
  if (filtros?.categorias && filtros.categorias.length > 0) {
    resultado = resultado.filter((p) => filtros.categorias!.includes(p.categoria));
  }
  if (filtros?.tipoServicio) {
    resultado = resultado.filter((p) => p.tipoServicio === filtros.tipoServicio);
  }
  if (filtros?.precioMin != null) {
    resultado = resultado.filter(
      (p) => (p.precioFinal ?? Infinity) >= filtros.precioMin!,
    );
  }
  if (filtros?.precioMax != null) {
    resultado = resultado.filter(
      (p) => (p.precioFinal ?? 0) <= filtros.precioMax!,
    );
  }

  return resultado;
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

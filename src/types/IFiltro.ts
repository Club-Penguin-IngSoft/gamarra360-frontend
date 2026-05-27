/**
 * Estructura del estado de filtros del catálogo.
 * Se envía como query params al endpoint /api/v1/productos.
 */

import type { Categoria, TipoServicio } from './IProducto';
import type { GaleriaGamarra } from './ITienda';

export type TipoEntrega = 'DOMICILIO' | 'TIENDA';

export type OrdenCatalogo = 'RECENT' | 'PRICE_ASC' | 'PRICE_DESC' | 'RELEVANCIA';

export interface IFiltrosCatalogo {
  /**
   * Búsqueda por palabras clave (CU-08, RF-22/RF-23).
   * Se envía como `?q=texto` al backend, que ranquea por relevancia en
   * `productos.nombre`, `productos.descripcion`, `tiendas.nombre_comercial`
   * y `categorias.nombre_categoria`.
   */
  q: string | null;
  entrega: TipoEntrega | null;
  tipoServicio: TipoServicio | null;
  categorias: Categoria[];
  tiposProducto: string[];
  color: string | null;
  material: string | null;
  tallas: string[];
  precioMin: number | null;
  precioMax: number | null;
  sort: OrdenCatalogo | null;
  page: number | null;
  size: number | null;
  random: boolean | null;
  seed: number | null;
}

export const FILTROS_VACIOS: IFiltrosCatalogo = {
  q: null,
  entrega: null,
  tipoServicio: null,
  categorias: [],
  tiposProducto: [],
  color: null,
  material: null,
  tallas: [],
  precioMin: null,
  precioMax: null,
  sort: 'RECENT',
  page: 1,
  size: 12,
  random: false,
  seed: null,
};

/**
 * Filtros del directorio de tiendas.
 * Se envía al endpoint /api/v1/tiendas como query params.
 *
 * NO incluye color/material/talla/precio porque no aplica a tiendas (esos
 * son atributos de productos, no del comercio).
 */
export interface IFiltrosTiendas {
  categorias: Categoria[];
  tiposProducto: string[];
  tipoServicio: TipoServicio | null;
  galeria: GaleriaGamarra | null;
}

export const FILTROS_TIENDAS_VACIOS: IFiltrosTiendas = {
  categorias: [],
  tiposProducto: [],
  tipoServicio: null,
  galeria: null,
};

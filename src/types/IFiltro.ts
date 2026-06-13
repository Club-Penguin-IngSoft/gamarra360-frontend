/**
 * Estructura del estado de filtros del catálogo.
 * Se envía como query params al endpoint /api/v1/productos.
 */

import type { TipoServicio } from './IProducto';
import type { GaleriaGamarra } from './ITienda';

export type TipoEntregaFiltro = 'DOMICILIO' | 'TIENDA';

export interface IFiltrosCatalogo {
  entrega: TipoEntregaFiltro | null;
  tipoServicio: TipoServicio[];
  categorias: string[];
  tiposProducto: string[];
  color: string | null;
  material: string | null;
  tallas: string[];
  precioMin: number | null;
  precioMax: number | null;
}

export const FILTROS_VACIOS: IFiltrosCatalogo = {
  entrega: null,
  tipoServicio: [],
  categorias: [],
  tiposProducto: [],
  color: null,
  material: null,
  tallas: [],
  precioMin: null,
  precioMax: null,
};

/**
 * Filtros del directorio de tiendas.
 * Se envía al endpoint /api/v1/tiendas como query params.
 *
 * NO incluye color/material/talla/precio porque no aplica a tiendas (esos
 * son atributos de productos, no del comercio).
 */
export interface IFiltrosTiendas {
  categorias: string[];
  tiposProducto: string[];
  tipoServicio: TipoServicio[];
  galeria: GaleriaGamarra | null;
}

export const FILTROS_TIENDAS_VACIOS: IFiltrosTiendas = {
  categorias: [],
  tiposProducto: [],
  tipoServicio: [],
  galeria: null,
};

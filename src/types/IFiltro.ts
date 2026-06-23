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
  materiales: string[];
  tallas: string[];
  precioMin: number | null;
  precioMax: number | null;
  ofreceEnvio: boolean;
}

export const FILTROS_VACIOS: IFiltrosCatalogo = {
  entrega: null,
  tipoServicio: [],
  categorias: [],
  tiposProducto: [],
  color: null,
  materiales: [],
  tallas: [],
  precioMin: null,
  precioMax: null,
  ofreceEnvio: false,
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
  galerias: GaleriaGamarra[];
}

export const FILTROS_TIENDAS_VACIOS: IFiltrosTiendas = {
  categorias: [],
  tiposProducto: [],
  tipoServicio: [],
  galerias: [],
};

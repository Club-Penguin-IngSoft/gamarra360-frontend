/**
 * Modelos de dominio: Producto y tipos asociados.
 * Alineado con el módulo `catalogo` del backend (Spring Boot).
 */

export type TipoServicio = 'COMPRA_DIRECTA' | 'PERSONALIZABLE' | 'COTIZACION';

export type Categoria =
  | 'HOMBRE'
  | 'MUJER'
  | 'NINOS'
  | 'UNISEX_ADULTOS'
  | 'UNISEX_NINOS';

export interface IVarianteProducto {
  id: string;
  talla?: string;
  color?: string;
  /** Hex del color, para mostrarse como swatch */
  colorHex?: string;
  stock: number;
}

export interface IProducto {
  id: string;
  titulo: string;
  descripcion?: string;
  /** ID del comerciante dueño (multi-tenant) */
  idComerciante: string;
  nombreTienda: string;
  imagenes: string[];
  categoria: Categoria;
  tipoServicio: TipoServicio;
  /** Precio base sin descuento. Undefined cuando es COTIZACION */
  precioBase?: number;
  /** Precio final con descuentos aplicados. Undefined cuando es COTIZACION */
  precioFinal?: number;
  variantes?: IVarianteProducto[];
  /** Especificaciones técnicas (clave/valor) — ej. MATERIAL / Cuero Top Grain */
  especificaciones?: { etiqueta: string; valor: string }[];
}

/** Etiqueta visible del producto en cards y badges */
export type EtiquetaProducto = 'COMPRA DIRECTA' | 'PERSONALIZABLE' | 'COTIZACIÓN';

/** Mapeo del enum del backend al texto visible en UI */
export const ETIQUETA_POR_TIPO_SERVICIO: Record<TipoServicio, EtiquetaProducto> = {
  COMPRA_DIRECTA: 'COMPRA DIRECTA',
  PERSONALIZABLE: 'PERSONALIZABLE',
  COTIZACION: 'COTIZACIÓN',
};

/**
 * Color de fondo del tag por tipo de servicio (clases Tailwind).
 * Colores extraídos del Figma de Gamarra 360°:
 *  - COMPRA_DIRECTA: #C83771 (brand-500)
 *  - PERSONALIZABLE: #146C43 (verde corporativo)
 *  - COTIZACION:    #087990 (cyan corporativo)
 */
export const COLOR_BG_TAG_POR_TIPO_SERVICIO: Record<TipoServicio, string> = {
  COMPRA_DIRECTA: 'bg-brand-500',
  PERSONALIZABLE: 'bg-[#146C43]',
  COTIZACION: 'bg-[#087990]',
};

/**
 * Modelos de dominio: Producto y tipos asociados.
 * Alineado con el módulo `catalogo` del backend (Spring Boot).
 */

export type TipoServicio = 'COMPRA_DIRECTA' | 'PERSONALIZABLE' | 'COTIZACION';

/** Categoría de producto — valor dinámico desde la BD (no enum) */
export type Categoria = string;

export interface IVarianteProducto {
  id: string;
  stock: number;
  disponible?: boolean;
  talla?: string;
  color?: string;
  colorHex?: string;
  idColor?: number;
  idTalla?: number;
  /** Precio final con ofertas/descuentos para esta combinación talla+color */
  precioEfectivo?: number | null;
  /** Precio ajustado por regla de descuento (antes de ofertas) */
  precioAjustado?: number | null;
}

export interface IProducto {
  id: string;
  titulo: string;
  descripcion?: string;
  /** ID del comerciante dueño (multi-tenant) */
  idTienda: string;
  idComerciante: string;
  nombreTienda: string;
  imagenes: string[];
  categoria: Categoria;
  tipoServicio: TipoServicio;
  /** Tipo de producto (ej. "Polos", "Blusas", "Casacas") — usado por filtros */
  tipoProducto?: string;
  /** Precio base sin descuento. Undefined cuando es COTIZACION */
  precioBase?: number;
  /** Precio final con descuentos aplicados. Undefined cuando es COTIZACION */
  precioFinal?: number;
  variantes?: IVarianteProducto[];
  /** Especificaciones técnicas (clave/valor) — ej. MATERIAL / Cuero Top Grain */
  especificaciones?: { etiqueta: string; valor: string }[];
  /** Material principal del producto (campo plano del backend) */
  materialPrincipal?: string;
  /** Lista de materiales del producto (ej. ["Algodón", "Polyester"]) */
  materiales?: string[];
  /** Si la tienda que vende este producto ofrece envío a domicilio */
  tiendaOfreceEnvio?: boolean;
  /** Galería de Gamarra donde está físicamente la tienda (para filtro de galería) */
  galeria?: string;
  comercianteActivo?: boolean;
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

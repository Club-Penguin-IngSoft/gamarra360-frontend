/**
 * Modelo de Tienda (Comerciante / Vendedor en el backend).
 */

import type { Categoria, TipoServicio } from './IProducto';

/** Galería de Gamarra a la que pertenece la tienda (catálogo cerrado). */
export type GaleriaGamarra =
  | 'GAMARRA_CENTRO'
  | 'GALERIA_DAMIANI'
  | 'GALERIA_GUIZADO'
  | 'GALERIA_PLAZA'
  | 'GALERIA_DON_PEDRO';

/** Etiqueta visible de cada galería (para selects / chips). */
export const ETIQUETA_GALERIA: Record<GaleriaGamarra, string> = {
  GAMARRA_CENTRO: 'Gamarra Centro',
  GALERIA_DAMIANI: 'Galería Damiani',
  GALERIA_GUIZADO: 'Galería Guizado',
  GALERIA_PLAZA: 'Galería Plaza',
  GALERIA_DON_PEDRO: 'Galería Don Pedro',
};

export interface ITienda {
  id: string;
  nombre: string;
  descripcion?: string;
  /** Descripción larga / "Sobre nosotros" — usada en la página de detalle */
  descripcionLarga?: string;
  logo: string;
  /** Indica si el comerciante ya fue verificado por un admin (HU-9) */
  verificada?: boolean;
  /** Categorías de productos que vende la tienda — usado por los filtros */
  categorias?: Categoria[];
  /** Tipos de servicio que ofrece (compra directa, personalizable, cotización) */
  tiposServicio?: TipoServicio[];
  /** Tipos de producto (Polos, Blusas, etc.) que vende */
  tiposProducto?: string[];
  /** Galería de Gamarra a la que pertenece físicamente la tienda */
  galeria?: GaleriaGamarra;
  /** Dirección física dentro de la galería (ej. "3er Piso, Stand 302-A") */
  direccion?: string;
  /**
   * Servicio destacado bajo cotización — usado en la página de detalle cuando
   * la tienda tiene tiposServicio con 'COTIZACION'.
   */
  servicioCotizacion?: {
    titulo: string;
    descripcion: string;
    imagen: string;
  };
}

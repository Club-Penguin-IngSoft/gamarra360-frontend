/**
 * Modelo de Tienda (Comerciante / Vendedor en el backend).
 */

import type { Categoria, TipoServicio } from './IProducto';

/** Galería de Gamarra a la que pertenece la tienda (valores que envía el backend). */
export type GaleriaGamarra =
  | 'GAMA_MODA_PLAZA'
  | 'PLAZA_GAMARRA'
  | 'GALERIA_KRISTALES'
  | 'CENTRO_COMERCIAL_GAMARRA'
  | 'GALERIA_SANTA_LUCIA'
  | 'GALERIA_EL_DORADO'
  | 'GALERIA_DAMERO'
  | 'GALERIA_EL_REY'
  | 'GALERIA_GENERACION_GAMARRA'
  | 'GALERIA_GAMARRA_SAN_PEDRO'
  | 'GALERIA_YA'
  | 'LA_PORTADA_DE_GAMARRA'
  | 'GALERIA_GUIZADO'
  | 'GALERIA_AUGUSTO_ALLCCA';

/** Etiqueta visible de cada galería (para selects / chips). */
export const ETIQUETA_GALERIA: Record<GaleriaGamarra, string> = {
  GAMA_MODA_PLAZA:            'Gama Moda Plaza',
  PLAZA_GAMARRA:              'Plaza Gamarra',
  GALERIA_KRISTALES:          'Galería Kristales',
  CENTRO_COMERCIAL_GAMARRA:   'Centro Comercial Gamarra',
  GALERIA_SANTA_LUCIA:        'Galería Santa Lucía',
  GALERIA_EL_DORADO:          'Galería El Dorado',
  GALERIA_DAMERO:             'Galería Damero',
  GALERIA_EL_REY:             'Galería El Rey',
  GALERIA_GENERACION_GAMARRA: 'Generación Gamarra',
  GALERIA_GAMARRA_SAN_PEDRO:  'Gamarra San Pedro',
  GALERIA_YA:                 'Galería YA',
  LA_PORTADA_DE_GAMARRA:      'La Portada de Gamarra',
  GALERIA_GUIZADO:            'Galería Guizado',
  GALERIA_AUGUSTO_ALLCCA:     'Galería Augusto Allcca',
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
  /** Piso dentro de la galería (ej. "Piso 2") */
  piso?: string;
  /** Número de stand dentro del piso (ej. "Stand 45") */
  stand?: string;
  /** Si la tienda ofrece envío a domicilio */
  ofreceEnvio?: boolean;
  /** Dirección física dentro de la galería (ej. "3er Piso, Stand 302-A") */
  direccion?: string;
  /** Indica si el comerciante está activo */
  comercianteActivo?: boolean;
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

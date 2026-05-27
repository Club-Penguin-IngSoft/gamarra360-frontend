/**
 * Modelo del Carrito y sus items (módulo `carrito` del backend).
 */

import type { IProducto } from './IProducto';

export interface IItemCarrito {
  /** ID único del item dentro del carrito */
  id: string;
  producto: IProducto;
  /** ID de la variante seleccionada (talla/color) */
  idVariante?: string;
  cantidad: number;
  /** Snapshot del precio al momento de agregar al carrito */
  precioUnitario: number;
}

export interface ICarrito {
  items: IItemCarrito[];
  /** Suma de precios * cantidades, sin descuentos por volumen aún aplicados */
  subtotal: number;
}

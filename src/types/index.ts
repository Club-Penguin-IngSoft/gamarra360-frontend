/**
 * Barrel file — re-exporta todos los tipos del dominio.
 * Permite importar como: import type { IProducto, ITienda } from '@/types';
 */

export * from './IProducto';
export * from './ITienda';
export * from './IFiltro';
export * from './IUsuario';
export * from './ICarrito';
export * from './IPedido';
// IFiltro e IPedido exportan ambos `TipoEntrega` con valores distintos; este
// re-export explícito resuelve la ambigüedad del barrel (gana el de IPedido).
export type { TipoEntrega } from './IPedido';

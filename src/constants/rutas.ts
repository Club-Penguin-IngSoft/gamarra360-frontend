/**
 * Rutas del frontend (React Router). Centralizadas para evitar strings mágicos
 * regados en `<Link>` y `navigate()`.
 *
 * Convención: nombres en UPPER_SNAKE_CASE, valores en kebab-case.
 */

export const RUTAS = {
  INICIO: '/',
  CATALOGO: '/productos',
  /** Helper: construye la ruta de detalle dado un id */
  DETALLE_PRODUCTO: (id: string | number = ':id') => `/productos/${id}`,
  TIENDAS: '/tiendas',
  /** Helper: construye la ruta de detalle de una tienda dado un id */
  DETALLE_TIENDA: (id: string | number = ':id') => `/tiendas/${id}`,
  VENDER: '/vender',
  CUENTA: '/cuenta',
  CARRITO: '/carrito',
  CHECKOUT: '/checkout',
  COTIZACIONES: '/cotizaciones',
  LOGIN: '/login',
  REGISTRO: '/registro',
  /** Helper: construye la ruta del formulario de personalización */
  PERSONALIZAR: (id: string | number = ':id') => `/personalizar/${id}`,
  /** Mis personalizaciones (seguimiento del cliente — HU-29) */
  PERSONALIZACIONES: '/personalizaciones',
  /** Panel de Administración */
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const;

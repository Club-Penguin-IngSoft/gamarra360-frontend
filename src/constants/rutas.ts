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
  REGISTRO_COMERCIANTE: '/registro-comerciante',
  COMERCIANTE_DASHBOARD: '/comerciante/dashboard',
  COMERCIANTE_CATALOGO: '/comerciante/catalogo',
  COMERCIANTE_PEDIDOS: '/comerciante/pedidos',
  COMERCIANTE_NUEVO_PRODUCTO: '/comerciante/catalogo/nuevo',
  COMERCIANTE_EDITAR_PRODUCTO: (id: string | number = ':id') => `/comerciante/catalogo/${id}/editar`,
  COMERCIANTE_PERSONALIZACIONES: '/comerciante/personalizaciones',
  COMERCIANTE_COTIZACIONES: '/comerciante/cotizaciones',
  COMERCIANTE_NOTIFICACIONES: '/comerciante/notificaciones',
  /** Helper: construye la ruta del formulario de personalización */
  PERSONALIZAR: (id: string | number = ':id') => `/personalizar/${id}`,
  /** Mis personalizaciones (seguimiento del cliente — HU-29) */
  PERSONALIZACIONES: '/personalizaciones',
  /** Panel de Administración */
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_APROBACIONES: '/admin/aprobaciones',
  ADMIN_APROBACION_COMERCIANTES: '/admin/aprobacion-comerciantes',
  ADMIN_NOTIFICACIONES: '/admin/notificaciones',
} as const;

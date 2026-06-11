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
  CONFIGURACION: '/cuenta/configuracion',
  CARRITO: '/carrito',
  CHECKOUT: '/checkout',
  PAGO: '/pago',
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
  /** Detalle de una personalización específica */
  PERSONALIZACION_DETALLE: (id: string | number = ':id') => `/personalizaciones/${id}`,
  /** Historial de pedidos del cliente (HU-37) */
  MIS_PEDIDOS: '/mis-pedidos',
  /** Detalle de un pedido específico */
  DETALLE_PEDIDO: (id: string | number = ':id') => `/mis-pedidos/${id}`,
  /** Detalle de un pedido (una tienda) dentro de una orden, vista "Mi Cuenta" */
  PEDIDO_DETALLE: (ordenId: string | number = ':ordenId', pedidoId: string | number = ':pedidoId') =>
    `/mis-pedidos/${ordenId}/pedido/${pedidoId}`,
  /** Panel de Administración */
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USUARIOS: '/admin/usuarios',
  ADMIN_APROBACIONES: '/admin/aprobaciones',
  ADMIN_APROBACION_COMERCIANTES: '/admin/aprobacion-comerciantes',
  ADMIN_NOTIFICACIONES: '/admin/notificaciones',
} as const;

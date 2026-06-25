import type { EstadoPedido, TipoEntregaPedido } from './IPedido';

export type EstadoPersonalizacion = 'PENDIENTE' | 'RESPONDIDA' | 'ACEPTADA' | 'RECHAZADA';

export interface IPersonalizacionResumen {
  id: number;
  estado: EstadoPersonalizacion;
  fechaCreacion: string;
  vendedorId: number;
  nombreTienda: string | null;
  fotoTienda: string | null;
  detalleProductoId: number;
  nombreProducto: string | null;
  imagenUrl: string | null;
  talla: string | null;
  color: string | null;
  sku: string | null;
  cantidad: number;
  total: number;
  pedidoEstado: EstadoPedido | null;
}

export interface IPropuestaInfo {
  idRespuesta: number;
  precioPropuesto: number;
  comentario: string | null;
  condiciones: string | null;
  anotaciones: string | null;
  imagen: string | null;
  fecha: string | null;
}

export interface IPedidoInfo {
  pedidoId: number;
  estado: EstadoPedido;
  tipoEntrega: TipoEntregaPedido;
  direccionEntrega: string | null;
  fechaActualizacion: string | null;
}

export interface IPersonalizacionDetalle {
  id: number;
  estado: EstadoPersonalizacion;
  fechaCreacion: string;
  vendedorId: number;
  nombreTienda: string | null;
  fotoTienda: string | null;
  detalleProductoId: number;
  nombreProducto: string | null;
  imagenUrl: string | null;
  talla: string | null;
  color: string | null;
  sku: string | null;
  cantidad: number;
  urlLogo: string | null;
  tipoPersonalizacion: string | null;
  descripcion: string | null;
  precioBase: number | null;
  descuentos: number | null;
  costoPersonalizacion: number | null;
  total: number;
  propuesta: IPropuestaInfo | null;
  pedido: IPedidoInfo | null;
  precioDeseado: number | null;
}

export type IAceptarPersonalizacionResponse = IPersonalizacionDetalle;

/** Datos que viaja en `location.state.personalizacion` hacia el checkout. */
export interface IPersonalizacionCheckoutState {
  personalizacionId: number;
  vendedorId: number;
  nombreTienda: string | null;
  detalleProductoId: number;
  nombreProducto: string | null;
  imagenUrl: string | null;
  talla: string | null;
  color: string | null;
  sku: string | null;
  precioUnitario: number;
}

/** Fila del "Tablero de Personalización" del comerciante. */
export interface IPersonalizacionComercianteResumen {
  id: number;
  estado: EstadoPersonalizacion;
  fechaCreacion: string;
  clienteId: number;
  nombreCliente: string | null;
  emailCliente: string | null;
  pedidoEstado: EstadoPedido | null;
}

export interface IPropuestaComercianteInfo {
  precioPropuesto: number | null;
  comentario: string | null;
  condiciones: string | null;
  anotaciones: string | null;
  fecha: string | null;
}

/** Detalle de una personalización para la vista "Responder Solicitud" del comerciante. */
export interface IPersonalizacionComercianteDetalle {
  id: number;
  estado: EstadoPersonalizacion;
  fechaCreacion: string;
  clienteId: number;
  nombreCliente: string | null;
  emailCliente: string | null;
  totalPedidosCliente: number;
  nombreProducto: string | null;
  imagenUrl: string | null;
  talla: string | null;
  color: string | null;
  cantidad: number;
  urlLogo: string | null;
  tipoPersonalizacion: string | null;
  descripcion: string | null;
  propuesta: IPropuestaComercianteInfo | null;
  precioDeseado: number | null;
}

export interface IResponderPersonalizacionRequest {
  decision: 'ACEPTAR' | 'RECHAZAR';
  precioPropuesto?: number;
  anotaciones?: string;
  condiciones?: string;
  comentario?: string;
}

export interface IContraPropuestaPersonalizacionRequest {
  precioDeseado?: number;
  especificacion?: string;
  comentario?: string;
}

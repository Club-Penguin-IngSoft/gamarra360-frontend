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

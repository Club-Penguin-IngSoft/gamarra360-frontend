/**
 * Modelos del módulo `pedido` y `cotizacion` del backend.
 * Los enums replican exactamente los valores definidos en Java (UPPER_SNAKE_CASE).
 */

// Valores reales del enum EstadoPedido en el backend Java
export type EstadoPedido =
  | 'RECIBIDO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'LISTO_PARA_ENTREGA'
  | 'ENTREGADO'
  | 'CANCELADO';

export type TipoEntrega = 'DELIVERY' | 'RECOJO_TIENDA';
// MetodoPago se maneja solo en el frontend (simulación); el backend no lo persiste en Pedido
export type MetodoPago = 'TARJETA' | 'YAPE';

export type EstadoCotizacion =
  | 'SOLICITADA'
  | 'RESPONDIDA'
  | 'CON_OBSERVACION'
  | 'ACEPTADA'
  | 'CANCELADA'
  | 'EXPIRADA';

/** Respuesta de GET /api/v1/detalles-pedido/pedido/{id} */
export interface IDetallePedidoResponse {
  id: number;
  pedidoId: number;
  idVarianteProducto: number | null;
  idProducto: number | null;
  cantidad: number;
  precio: number;
  nombreProducto: string | null;
  imagenUrl: string | null;
  talla: string | null;
  color: string | null;
  sku: string | null;
}

/** Respuesta del backend al obtener un pedido (campos no @JsonIgnore de Pedido.java) */
export interface IPedido {
  id: number;
  clienteId: number;
  vendedorId: number;
  ordenPagoId?: number;
  estado: EstadoPedido;
  total: number;
  tipoEntrega: TipoEntrega;
  direccionEntrega?: string;
  fecha: string;
}

/** Respuesta de GET /api/v1/ordenes-pago/cliente/{id} */
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'FALLIDO';

export interface IOrdenPago {
  id: number;
  clienteId: number;
  total: number;
  estado: EstadoPago;
  fecha: string;
}

/** Respuesta de GET /api/v1/ordenes-pago/{id}/detalle */
export interface IPedidoConDetalles {
  id: number;
  vendedorId: number;
  nombreTienda: string | null;
  fotoTienda: string | null;
  estado: EstadoPedido;
  tipoEntrega: TipoEntrega;
  direccionEntrega: string | null;
  total: number;
  fecha: string;
  fechaActualizacion: string | null;
  detalles: IDetallePedidoResponse[];
}

export interface IDetalleOrden {
  id: number;
  clienteId: number;
  total: number;
  estado: EstadoPago;
  fecha: string;
  pedidos: IPedidoConDetalles[];
}

/** Payload para POST /api/v1/ordenes-pago */
export interface ICrearOrdenPagoRequest {
  clienteId: number;
  total: number;
}

/** Payload para POST /api/v1/pedidos (mapea a Pedido.java) */
export interface ICrearPedidoRequest {
  clienteId: number;
  vendedorId: number;
  ordenPagoId: number;
  tipoEntrega: TipoEntrega;
  direccionEntrega?: string;
  total: number;
}

/** Payload para POST /api/v1/detalles-pedido (mapea a DetallePedido.java) */
export interface ICrearDetallePedidoRequest {
  pedidoId: number;
  idVarianteProducto: number | null;
  cantidad: number;
  precio: number;
  personalizacionId?: number | null;
}

/** Item normalizado para el checkout, ya sea proveniente del carrito o de una personalización */
export interface ICheckoutItem {
  id: string;
  nombreProducto: string;
  imagenUrl?: string;
  cantidad: number;
  precioUnitario: number;
  precioBase: number;
  idVarianteProducto: number | null;
}

/** Grupo de items de checkout agrupados por tienda/vendedor */
export interface ICheckoutGrupo {
  nombreTienda: string;
  items: ICheckoutItem[];
}

export interface ICotizacion {
  id: string;
  idCliente: string;
  idComerciante: string;
  estado: EstadoCotizacion;
  fechaSolicitud: string;
  fechaLimite?: string;
  mensajeCliente: string;
  respuestaComerciante?: string;
  precioOfertado?: number;
}

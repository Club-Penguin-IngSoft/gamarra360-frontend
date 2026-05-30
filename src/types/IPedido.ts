/**
 * Modelos del módulo `pedido` y `cotizacion` del backend.
 * Los enums replican exactamente los valores definidos en Java (UPPER_SNAKE_CASE).
 */

export type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'EN_PROCESO'
  | 'LISTO_ENTREGA'
  | 'ENVIADO'
  | 'RECIBIDO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'RECHAZADO';

export type EstadoCotizacion =
  | 'SOLICITADA'
  | 'RESPONDIDA'
  | 'CON_OBSERVACION'
  | 'ACEPTADA'
  | 'CANCELADA'
  | 'EXPIRADA';

export interface IDetallePedido {
  id: string;
  idProducto: string;
  tituloProducto: string;
  idVariante?: string;
  cantidad: number;
  precioUnitario: number;
  imagenUrl?: string;
}

export type TipoEntregaPedido = 'ENVIO_DOMICILIO' | 'RECOJO_TIENDA';

export interface IPedido {
  id: string;
  numeroPedido?: string;
  idCliente: string;
  idComerciante: string;
  nombreComercio?: string;
  estado: EstadoPedido;
  detalles: IDetallePedido[];
  total: number;
  fechaCreacion: string;
  tipoEntrega?: TipoEntregaPedido;
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

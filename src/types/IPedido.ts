/**
 * Modelos del módulo `pedido` y `cotizacion` del backend.
 * Los enums replican exactamente los valores definidos en Java (UPPER_SNAKE_CASE).
 */

export type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PROCESO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO';

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
}

export interface IPedido {
  id: string;
  idCliente: string;
  idComerciante: string;
  estado: EstadoPedido;
  detalles: IDetallePedido[];
  total: number;
  fechaCreacion: string;
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

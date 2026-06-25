export type TipoDescuentoOferta = 'PORCENTAJE' | 'MONTO_FIJO';
export type EstadoOferta = 'ACTIVO' | 'PROGRAMADO' | 'FINALIZADO' | 'PAUSADO';

export interface IOferta {
  idOferta: number;
  titulo: string;
  tipoDescuento: TipoDescuentoOferta;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  estado: EstadoOferta;
  idsProductos: number[];
}

export interface IOfertaPayload {
  titulo: string;
  tipoDescuento: TipoDescuentoOferta;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  idsProductos: number[];
}

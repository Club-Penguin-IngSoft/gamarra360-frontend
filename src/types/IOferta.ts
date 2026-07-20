export type TipoDescuentoOferta = 'PORCENTAJE' | 'MONTO_FIJO';
export type EstadoOferta = 'ACTIVO' | 'PROGRAMADO' | 'FINALIZADO' | 'PAUSADO';

export interface IOferta {
  idOferta: number;
  titulo: string;
  tipoDescuento: TipoDescuentoOferta;
  valorDescuento: number;
  cantidadMinima: number;
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
  cantidadMinima: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  idsProductos: number[];
  /** true cuando el comerciante ya confirmó reemplazar la asignación de una oferta activa vigente sobre algún producto */
  forzarSobrescritura?: boolean;
}

/** Detalle de una oferta activa vigente que comparte productos con la que se intenta guardar (HTTP 409). */
export interface IConflictoOferta {
  idOferta: number;
  tituloOferta: string;
  productosEnConflicto: { idProducto: number; nombre: string }[];
}

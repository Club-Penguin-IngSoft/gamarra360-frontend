import apiClient from './apiClient';
import type {
  ICotizacionRequest,
  ICotizacionResumen,
  ICotizacionDetalle,
  IContraPropuestaRequest,
} from '../types/IPedido';

export interface IRespuestaCotizacionRequest {
  precioPropuesto: number;
  comentario?: string;
  condiciones?: string;
  anotaciones?: string;
  imagen?: string;
}

async function crearCotizacion(request: ICotizacionRequest): Promise<ICotizacionDetalle> {
  const { data } = await apiClient.post<ICotizacionDetalle>('/cotizaciones', request);
  return data;
}

async function listarMisCotizaciones(): Promise<ICotizacionResumen[]> {
  const { data } = await apiClient.get<ICotizacionResumen[]>('/cotizaciones/mis-cotizaciones');
  return data;
}

async function listarCotizacionesComerciante(): Promise<ICotizacionResumen[]> {
  const { data } = await apiClient.get<ICotizacionResumen[]>('/cotizaciones/comerciante');
  return data;
}

async function obtenerDetalle(id: number): Promise<ICotizacionDetalle> {
  const { data } = await apiClient.get<ICotizacionDetalle>(`/cotizaciones/${id}/detalle`);
  return data;
}

async function aceptar(id: number): Promise<ICotizacionDetalle> {
  const { data } = await apiClient.patch<ICotizacionDetalle>(`/cotizaciones/${id}/aceptar`);
  return data;
}

async function rechazar(id: number): Promise<void> {
  await apiClient.patch(`/cotizaciones/${id}/rechazar`);
}

async function responder(id: number, req: IRespuestaCotizacionRequest): Promise<ICotizacionDetalle> {
  const { data } = await apiClient.post<ICotizacionDetalle>(`/cotizaciones/${id}/responder`, req);
  return data;
}

async function contraProponerCotizacion(id: number, req: IContraPropuestaRequest): Promise<ICotizacionDetalle> {
  const { data } = await apiClient.post<ICotizacionDetalle>(`/cotizaciones/${id}/contra-proponer`, req);
  return data;
}

async function cancelarCotizacionComerciante(id: number): Promise<void> {
  await apiClient.patch(`/cotizaciones/comerciante/${id}/cancelar`);
}

export const cotizacionService = {
  crearCotizacion,
  listarMisCotizaciones,
  listarCotizacionesComerciante,
  obtenerDetalle,
  aceptar,
  rechazar,
  responder,
  contraProponerCotizacion,
  cancelarCotizacionComerciante,
};

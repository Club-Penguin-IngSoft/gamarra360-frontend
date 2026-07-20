/**
 * Servicio de acceso al backend para solicitudes de personalización.
 * Conectado a POST /api/v1/personalizaciones (requiere JWT de CLIENTE).
 */

import apiClient from './apiClient';
import type {
  IAceptarPersonalizacionResponse,
  IContraPropuestaPersonalizacionRequest,
  IPersonalizacionComercianteDetalle,
  IPersonalizacionComercianteResumen,
  IPersonalizacionDetalle,
  IPersonalizacionResumen,
  IResponderPersonalizacionRequest,
  IMensajePersonalizacion,
} from '../types/IPersonalizacion';

/* ── Mapeo de tipos frontend → enums del backend ──────────────────────── */

export type TipoPersonalizacionBackend =
  | 'ESTAMPADO_DTF'
  | 'BORDADO_INDUSTRIAL'
  | 'IMPRESION_TEXTIL';

/** Convierte el id interno del frontend al enum que espera el backend */
export const TIPO_TRABAJO_BACKEND: Record<string, TipoPersonalizacionBackend> = {
  estampado: 'ESTAMPADO_DTF',
  bordado:   'BORDADO_INDUSTRIAL',
  impresion: 'IMPRESION_TEXTIL',
};

/* ── DTOs ─────────────────────────────────────────────────────────────── */

export interface IPersonalizacionRequest {
  /** ID de la variante seleccionada (talla + color) */
  detalleProductoId: number;
  /** ID del comerciante dueño del producto */
  vendedorId: number;
  /** Tipo de trabajo en formato del backend */
  tipoPersonalizacion: TipoPersonalizacionBackend;
  /** URL de S3 con el diseño subido (null si el cliente eligió "Solo Texto") */
  urlLogo?: string;
  /** Descripción combinada: posición, medidas, instrucciones y/o texto */
  descripcion: string;
  /** Cantidad de unidades solicitadas */
  cantidad?: number;
}

export interface IPersonalizacionResponse {
  id: number;
  clienteId: number;
  vendedorId: number;
  detalleProductoId: number;
  tipoPersonalizacion: string;
  urlLogo?: string;
  descripcion?: string;
  estado: string;
  fechaCreacion: string;
}

/* ── API calls ────────────────────────────────────────────────────────── */

/**
 * Crea una solicitud de personalización en el backend.
 * El clienteId se extrae automáticamente del JWT — no se envía en el body.
 */
export async function crearSolicitudPersonalizacion(
  req: IPersonalizacionRequest,
): Promise<IPersonalizacionResponse> {
  const { data } = await apiClient.post<IPersonalizacionResponse>(
    '/personalizaciones',
    req,
  );
  return data;
}

/** Lista las personalizaciones del cliente autenticado para "Mis Personalizaciones". */
async function listarMisPersonalizaciones(): Promise<IPersonalizacionResumen[]> {
  const { data } = await apiClient.get<IPersonalizacionResumen[]>(
    '/personalizaciones/mis-personalizaciones',
  );
  return data;
}

/** Detalle completo de una personalización para la página "Ver detalle". */
async function obtenerDetallePersonalizacion(id: number): Promise<IPersonalizacionDetalle> {
  const { data } = await apiClient.get<IPersonalizacionDetalle>(
    `/personalizaciones/${id}/detalle`,
  );
  return data;
}

/** Acepta la propuesta del vendedor (RESPONDIDA → ACEPTADA). */
async function aceptarPersonalizacion(id: number): Promise<IAceptarPersonalizacionResponse> {
  const { data } = await apiClient.patch<IAceptarPersonalizacionResponse>(
    `/personalizaciones/${id}/aceptar`,
  );
  return data;
}

/** Rechaza la propuesta del vendedor (RESPONDIDA → RECHAZADA). */
async function rechazarPersonalizacion(id: number): Promise<void> {
  await apiClient.patch(`/personalizaciones/${id}/rechazar`);
}

/** Lista las personalizaciones recibidas por el comerciante autenticado. */
async function listarPersonalizacionesComerciante(): Promise<IPersonalizacionComercianteResumen[]> {
  const { data } = await apiClient.get<IPersonalizacionComercianteResumen[]>(
    '/personalizaciones/comerciante',
  );
  return data;
}

/** Detalle completo de una personalización para la vista "Responder Solicitud" del comerciante. */
async function obtenerDetallePersonalizacionComerciante(id: number): Promise<IPersonalizacionComercianteDetalle> {
  const { data } = await apiClient.get<IPersonalizacionComercianteDetalle>(
    `/personalizaciones/${id}/comerciante-detalle`,
  );
  return data;
}

/** El comerciante acepta (cotiza) o rechaza una solicitud en estado PENDIENTE. */
async function responderPersonalizacion(
  id: number,
  req: IResponderPersonalizacionRequest,
): Promise<IPersonalizacionComercianteDetalle> {
  const { data } = await apiClient.post<IPersonalizacionComercianteDetalle>(
    `/personalizaciones/${id}/responder`,
    req,
  );
  return data;
}

/** Cancela la solicitud desde el cliente (PENDIENTE o RESPONDIDA → RECHAZADA). */
async function cancelarPorCliente(id: number): Promise<void> {
  await apiClient.patch(`/personalizaciones/${id}/cancelar`);
}

/** Cancela la solicitud desde el comerciante (PENDIENTE o RESPONDIDA → RECHAZADA). */
async function cancelarPorVendedor(id: number, motivo: string): Promise<void> {
  await apiClient.patch(`/personalizaciones/comerciante/${id}/cancelar`, { motivo });
}

/** El cliente envía una contrapropuesta cuando está en estado RESPONDIDA: vuelve a PENDIENTE. */
async function contraProponerCliente(
  id: number,
  req: IContraPropuestaPersonalizacionRequest,
): Promise<IPersonalizacionDetalle> {
  const { data } = await apiClient.post<IPersonalizacionDetalle>(
    `/personalizaciones/${id}/contra-proponer`,
    req,
  );
  return data;
}

async function listarMensajes(id: number): Promise<IMensajePersonalizacion[]> {
  const { data } = await apiClient.get<IMensajePersonalizacion[]>(`/personalizaciones/${id}/mensajes`);
  return data;
}

async function enviarMensaje(id: number, mensaje: string): Promise<IMensajePersonalizacion> {
  const { data } = await apiClient.post<IMensajePersonalizacion>(`/personalizaciones/${id}/mensajes`, { mensaje });
  return data;
}

export const personalizacionService = {
  listarMisPersonalizaciones,
  obtenerDetallePersonalizacion,
  aceptarPersonalizacion,
  rechazarPersonalizacion,
  cancelarPorCliente,
  contraProponerCliente,
  listarPersonalizacionesComerciante,
  obtenerDetallePersonalizacionComerciante,
  cancelarPorVendedor,
  responderPersonalizacion,
  listarMensajes,
  enviarMensaje,
};

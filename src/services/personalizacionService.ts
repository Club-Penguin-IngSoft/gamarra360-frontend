/**
 * Servicio de acceso al backend para solicitudes de personalización.
 * Conectado a POST /api/v1/personalizaciones (requiere JWT de CLIENTE).
 */

import apiClient from './apiClient';

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

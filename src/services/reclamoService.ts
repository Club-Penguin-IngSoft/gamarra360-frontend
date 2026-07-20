import apiClient from './apiClient';
import type { IReclamo, TipoReclamo } from '../types/IReclamo';

export const reclamoService = {
  listarCliente: async () => (await apiClient.get<IReclamo[]>('/reclamos/mis-reclamos')).data,
  listarVendedor: async () => (await apiClient.get<IReclamo[]>('/reclamos/vendedor')).data,
  listarAdmin: async () => (await apiClient.get<IReclamo[]>('/reclamos/admin')).data,
  crear: async (payload: { pedidoId?: number; tipo: TipoReclamo; asunto: string; descripcion: string }) =>
    (await apiClient.post<IReclamo>('/reclamos', payload)).data,
  responderVendedor: async (id: number, respuesta: string) =>
    (await apiClient.patch<IReclamo>(`/reclamos/vendedor/${id}/responder`, { respuesta })).data,
  responderAdmin: async (id: number, respuesta: string) =>
    (await apiClient.patch<IReclamo>(`/reclamos/admin/${id}/responder`, { respuesta })).data,
};

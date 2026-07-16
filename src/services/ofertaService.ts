import apiClient from './apiClient';
import type { IOferta, IOfertaPayload } from '../types/IOferta';

export async function listarOfertas(): Promise<IOferta[]> {
  const { data } = await apiClient.get<IOferta[]>('/ofertas');
  return data;
}

export async function crearOferta(payload: IOfertaPayload): Promise<IOferta> {
  const { data } = await apiClient.post<IOferta>('/ofertas', payload);
  return data;
}

export async function actualizarOferta(id: number, payload: IOfertaPayload): Promise<IOferta> {
  const { data } = await apiClient.put<IOferta>(`/ofertas/${id}`, payload);
  return data;
}

export async function eliminarOferta(id: number): Promise<void> {
  await apiClient.delete(`/ofertas/${id}`);
}

export async function toggleEstadoOferta(id: number): Promise<IOferta> {
  const { data } = await apiClient.patch<IOferta>(`/ofertas/${id}/toggle`);
  return data;
}

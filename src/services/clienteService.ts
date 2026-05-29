/**
 * Servicio para el perfil del cliente autenticado.
 * Conectado a GET/PUT /api/v1/clientes/{id}
 */

import apiClient from './apiClient';

export interface IClientePerfil {
  usuarioId: number;
  nombre: string;
  apellido: string;
  direccion?: string;
}

/** Obtiene los datos del cliente por su usuarioId. */
export async function obtenerCliente(usuarioId: string): Promise<IClientePerfil> {
  const { data } = await apiClient.get<IClientePerfil>(`/clientes/${usuarioId}`);
  return data;
}

/** Actualiza la dirección guardada del cliente. */
export async function actualizarDireccionCliente(
  usuarioId: string,
  direccion: string,
): Promise<void> {
  await apiClient.put(`/clientes/${usuarioId}`, { direccion });
}

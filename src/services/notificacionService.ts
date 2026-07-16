// src/services/notificacionService.ts
import apiClient from "./apiClient";

export interface Notificacion {
  idNotificacion: number;
  usuarioId: number;
  actorId?: number;

  mensaje: string;
  tipo: string;

  referenciaId?: number;
  referenciaTipo?: string;

  estadoReferencia?: string;
  ruta?: string;

  fechaCreacion: string;
  fueleida: boolean;
}

export const getNotificaciones = async (
  usuarioId: number
): Promise<Notificacion[]> => {
  const { data } = await apiClient.get<Notificacion[]>(
    `/notificaciones/usuario/${usuarioId}`
  );
  return data;
};

export const marcarComoLeida = async (id: number) => {
  const { data } = await apiClient.put(
    `/notificaciones/leida/${id}`
  );
  return data;
};
export const getUsuarioById = async (id: number) => {
  const { data } = await apiClient.get(`/usuarios/${id}`);
  return data;
};
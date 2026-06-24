import apiClient from './apiClient';
import type {
  IPerfilCliente,
  IActualizarDatosPersonales,
  IActualizarDireccion,
  IActualizarNotificaciones,
} from '../types/ICliente';

/** GET /api/v1/clientes/perfil */
export async function obtenerPerfilCliente(): Promise<IPerfilCliente> {
  const { data } = await apiClient.get<IPerfilCliente>('/clientes/perfil');
  return data;
}

/** PUT /api/v1/clientes/perfil/datos-personales */
export async function actualizarDatosPersonales(
  payload: IActualizarDatosPersonales,
): Promise<IPerfilCliente> {
  const { data } = await apiClient.put<IPerfilCliente>(
    '/clientes/perfil/datos-personales',
    payload,
  );
  return data;
}

/** PUT /api/v1/clientes/perfil/direccion */
export async function actualizarDireccion(
  payload: IActualizarDireccion,
): Promise<IPerfilCliente> {
  const { data } = await apiClient.put<IPerfilCliente>(
    '/clientes/perfil/direccion',
    payload,
  );
  return data;
}

/** PUT /api/v1/clientes/perfil/notificaciones */
export async function actualizarNotificaciones(
  payload: IActualizarNotificaciones,
): Promise<IPerfilCliente> {
  const { data } = await apiClient.put<IPerfilCliente>(
    '/clientes/perfil/notificaciones',
    payload,
  );
  return data;
}

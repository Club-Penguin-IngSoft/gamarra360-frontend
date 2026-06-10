// services/usuarioService.ts
import axios from 'axios';
import type { IUsuario } from '../types/IUsuario';

/**
 * Actualiza los datos del usuario cliente actual.
 * Endpoint: PUT /api/v1/clientes/me/perfil
 * No requiere id en el body, el backend obtiene el usuario desde el token.
 */
export async function actualizarUsuarioCliente(datos: {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
}): Promise<IUsuario> {
  const { data } = await axios.put('/api/v1/clientes/me/perfil', datos);
  return data; // Devuelve el usuario actualizado
}

/**
 * Actualiza la dirección del cliente.
 * Endpoint: PATCH /api/v1/clientes/me/direccion
 */
export async function actualizarDireccionCliente(datos: {
  direccion: string;
}): Promise<IUsuario> {
  const { data } = await axios.patch('/api/v1/clientes/me/direccion', datos);
  return data;
}

/**
 * Cambiar contraseña del cliente.
 * Endpoint: PATCH /api/v1/clientes/me/password
 */
export async function cambiarPasswordCliente(datos: {
  passwordActual: string;
  passwordNueva: string;
}): Promise<void> {
  await axios.patch('/api/v1/clientes/me/password', datos);
}

/**
 * Desactiva la cuenta del cliente.
 * Endpoint: DELETE /api/v1/clientes/me/cuenta
 */
export async function desactivarCuentaCliente(): Promise<void> {
  await axios.delete('/api/v1/clientes/me/cuenta');
}

export type RolUsuario = 'CLIENTE' | 'COMERCIANTE' | 'ADMIN';

export interface IUsuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: RolUsuario;
  telefono?: string;
  direccion?: string;
  idComerciante?: string;
}

export interface ISesion {
  token: string;
  usuario: IUsuario;
}

export interface IActualizarUsuarioRequest {
  nombre: string;
  apellido: string;
  telefono?: string;
}
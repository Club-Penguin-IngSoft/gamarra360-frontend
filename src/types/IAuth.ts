export type RolUsuario = 'CLIENTE' | 'COMERCIANTE' | 'ADMIN';

export interface ILoginRequest {
  email: string;
  contrasena: string;
}

export interface ILoginResponse {
  token: string;
  rol: RolUsuario;
  nombreCompleto: string;
  email: string;
  tenantId?: number;
}

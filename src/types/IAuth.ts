export type RolUsuario = 'CLIENTE' | 'COMERCIANTE' | 'ADMIN';

export interface ILoginRequest {
  email: string;
  contrasenha: string;
}

export interface ILoginResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  email: string;
  nombres: string;
  rol: RolUsuario | 'VENDEDOR';
  needsRegistration: boolean;
  tenantId?: number;
}
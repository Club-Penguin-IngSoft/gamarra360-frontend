/**
 * Modelo de Usuario y enums asociados (módulo `usuario` y `autenticacion`).
 */

export type RolUsuario = 'CLIENTE' | 'COMERCIANTE' | 'ADMIN';

export interface IUsuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: RolUsuario;
  /** Solo presente cuando el rol es COMERCIANTE — identifica el tenant */
  idComerciante?: string;
}

/** Payload almacenado en localStorage tras login exitoso */
export interface ISesion {
  token: string;
  usuario: IUsuario;
}

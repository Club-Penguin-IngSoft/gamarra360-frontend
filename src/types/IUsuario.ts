/**
 * Modelo de Usuario y enums asociados (módulo `usuario` y `autenticacion`).
 */

export type RolUsuario = 'CLIENTE' | 'COMERCIANTE' | 'ADMIN';

export interface IUsuario {
  id: string;
  /** Nombre usado por las pantallas antiguas */
  nombre: string;
  /** Primer apellido usado por las pantallas antiguas */
  apellido: string;
  /** Campos reales del backend para perfil de cliente */
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombreCompleto?: string;
  correo: string;
  telefono?: string;
  direccionEntrega?: string | null;
  rol: RolUsuario;
  /** Solo presente cuando el rol es COMERCIANTE — identifica el tenant */
  idComerciante?: string;
}

/** Payload almacenado en localStorage tras login exitoso */
export interface ISesion {
  token: string;
  usuario: IUsuario;
}

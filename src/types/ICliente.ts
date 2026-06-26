/**
 * Tipos del módulo `cliente` — alineados con el backend Spring Boot.
 */

/** Respuesta de GET /api/v1/clientes/perfil */
export interface IPerfilCliente {
  email: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  tipoDocumento: string;
  dni: string;
  telefono: string;
  direccionEntrega?: string;
  referencia?: string;
  idDistrito?: number;
  nombreDistrito?: string;
  ciudadDistrito?: string;
  alertasCorreo: boolean;
  notificacionesPush: boolean;
}

/** Payload para PUT /api/v1/clientes/perfil/notificaciones */
export interface IActualizarNotificaciones {
  alertasCorreo: boolean;
  notificacionesPush: boolean;
}

/** Payload para PUT /api/v1/clientes/perfil/datos-personales */
export interface IActualizarDatosPersonales {
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
}

/** Payload para PUT /api/v1/clientes/perfil/direccion */
export interface IActualizarDireccion {
  direccionEntrega: string;
  referencia?: string;
  idDistrito: number;
}

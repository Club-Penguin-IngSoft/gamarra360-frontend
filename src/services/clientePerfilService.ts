import apiClient from './apiClient';

export interface IClientePreferenciasNotificacion {
  alertasCorreo: boolean;
  notificacionesPush: boolean;
}

export interface IClientePerfilResponse {
  usuarioId: number;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string | null;
  nombreCompleto: string;
  email: string;
  telefono?: string | null;
  dni?: string | null;
  tipoDocumento?: string | null;
  rol: string;
  direccionEntrega?: string | null;
  preferenciasNotificacion?: IClientePreferenciasNotificacion;
}

export interface IActualizarClientePerfilRequest {
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono?: string;
}

export interface IActualizarClienteDireccionRequest {
  direccionEntrega: string;
}

const clientePerfilService = {
  obtenerPerfil: async (): Promise<IClientePerfilResponse> => {
    const { data } = await apiClient.get<IClientePerfilResponse>('/clientes/me/perfil');
    return data;
  },

  actualizarPerfil: async (
    payload: IActualizarClientePerfilRequest,
  ): Promise<IClientePerfilResponse> => {
    const { data } = await apiClient.put<IClientePerfilResponse>('/clientes/me/perfil', payload);
    return data;
  },

  actualizarDireccion: async (
    payload: IActualizarClienteDireccionRequest,
  ): Promise<IClientePerfilResponse> => {
    const { data } = await apiClient.patch<IClientePerfilResponse>('/clientes/me/direccion', payload);
    return data;
  },
};

export default clientePerfilService;

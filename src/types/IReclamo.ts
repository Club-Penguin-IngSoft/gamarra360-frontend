export type TipoReclamo = 'RECLAMO_PEDIDO' | 'LIBRO_PLATAFORMA';
export interface IReclamo {
  id: number;
  clienteId: number;
  nombreCliente: string | null;
  vendedorId: number | null;
  pedidoId: number | null;
  tipo: TipoReclamo;
  asunto: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'RESPONDIDO';
  respuesta: string | null;
  fechaCreacion: string;
  fechaRespuesta: string | null;
}

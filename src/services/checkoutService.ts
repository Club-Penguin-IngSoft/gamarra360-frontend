import apiClient from './apiClient';
 
export interface ItemCheckout {
  idVarianteProducto: number;
  cantidad: number;
  precio: number;
}
 
export interface PedidoRequest {
  vendedorId: number;
  tipoEntrega: 'DELIVERY' | 'RECOJO_TIENDA';
  direccionEntrega?: string;
  total: number;
  items: ItemCheckout[];
}
 
export interface PedidoResponse {
  pedidoId: number;
  ordenPagoId: number;
  estado: string;
  estadoPago: string;
  total: number;
}
 
/**
 * Envía el pedido al backend. El token JWT se adjunta automáticamente
 * por el interceptor de apiClient.
 */
export async function crearPedido(payload: PedidoRequest): Promise<PedidoResponse> {
  const { data } = await apiClient.post<PedidoResponse>('/checkout', payload);
  return data;
}

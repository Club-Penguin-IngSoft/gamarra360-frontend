import apiClient from './apiClient';
import type { IPedido } from '../types/IPedido';
import { MOCK_USUARIO_ID, MOCK_PEDIDOS } from '../mocks/clienteMock';

export async function listarPedidosCliente(clienteId: string): Promise<IPedido[]> {
  if (clienteId === MOCK_USUARIO_ID) return [...MOCK_PEDIDOS];
  const { data } = await apiClient.get<IPedido[]>(`/pedidos/cliente/${clienteId}`);
  return data;
}

export async function cancelarPedido(pedidoId: string): Promise<void> {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === pedidoId);
  if (pedido) {
    pedido.estado = 'CANCELADO';
    return;
  }
  await apiClient.put(`/pedidos/${pedidoId}/cancelar`);
}

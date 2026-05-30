/**
 * Servicio de checkout transaccional.
 *
 * Llama a POST /api/v1/checkout — endpoint de la rama kiwis3-notocar (backend).
 *
 * Diferencia con pedidoService.ts:
 *  - Este endpoint es TRANSACCIONAL: si falla cualquier paso, hace rollback.
 *  - El clienteId se extrae del JWT en el backend (NO se envía en el body).
 *  - Crea OrdenPago + Pedido + DetallePedido en una sola llamada.
 *
 * ⚠️  Un llamado = un vendedor.  Para carritos multi-tienda, llamar
 *     una vez por cada grupo de items del mismo vendedor.
 */

import apiClient from './apiClient';

export interface IItemCheckout {
  idVarianteProducto: number;
  cantidad: number;
  precio: number;
}

/**
 * Payload que el backend espera en POST /api/v1/checkout.
 * clienteId NO se incluye — el backend lo extrae del JWT.
 */
export interface IPedidoCheckoutRequest {
  /** usuario_id del comerciante dueño de la tienda */
  vendedorId: number;
  tipoEntrega: 'DELIVERY' | 'RECOJO_TIENDA';
  /** Requerido solo cuando tipoEntrega === 'DELIVERY' */
  direccionEntrega?: string | null;
  total: number;
  items: IItemCheckout[];
}

export interface IPedidoCheckoutResponse {
  pedidoId: number;
  ordenPagoId: number;
  /** Estado del Pedido: 'PENDIENTE_CONFIRMACION' */
  estado: string;
  /** Estado del pago: 'PAGADO' */
  estadoPago: string;
  total: number;
}

/**
 * Envía UN pedido al backend en una sola llamada transaccional.
 * Para múltiples tiendas, llamar una vez por tienda con el sub-total
 * y los items correspondientes.
 *
 * @throws AxiosError — el interceptor en apiClient redirige al login en 401.
 */
export async function crearPedido(
  payload: IPedidoCheckoutRequest,
): Promise<IPedidoCheckoutResponse> {
  const { data } = await apiClient.post<IPedidoCheckoutResponse>(
    '/checkout',
    payload,
  );
  return data;
}

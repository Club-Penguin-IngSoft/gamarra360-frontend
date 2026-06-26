import apiClient from './apiClient';
import type {
  ICrearOrdenPagoRequest,
  ICrearPedidoRequest,
  ICrearDetallePedidoRequest,
  IOrdenPago,
  IDetalleOrden,
  IPedidoComercianteResumen,
  IPedidoComercianteDetalle,
  IDistritoEnvio,
} from '../types/IPedido';

const BASE_ORDENES = '/ordenes-pago';
const BASE_PEDIDOS = '/pedidos';
const BASE_DETALLES = '/detalles-pedido';

export interface IItemParaDetalle {
  idVarianteProducto: number | null;
  cantidad: number;
  precio: number;
  personalizacionId?: number | null;
  cotizacionId?: number | null;
}

export interface IGrupoTienda {
  vendedorId: number;
  tipoEntrega: 'DELIVERY' | 'RECOJO_TIENDA';
  direccionEntrega?: string;
  idDistrito?: number | null;
  total: number;
  items: IItemParaDetalle[];
}

/**
 * Flujo completo de compra:
 * 1. POST /ordenes-pago              → crea la orden padre (una por checkout)
 * 2. POST /pedidos × N tiendas       → un pedido por cada tienda, vinculado a la orden
 * 3. POST /detalles-pedido × M items → los productos de cada pedido
 *
 * Devuelve el ID de la orden_pago creada.
 */
async function crearOrdenCompleta(
  clienteId: number,
  totalGeneral: number,
  grupos: IGrupoTienda[],
): Promise<number> {
  // Paso 1 — crear la orden padre
  const ordenPayload: ICrearOrdenPagoRequest = { clienteId, total: totalGeneral };
  const { data: orden } = await apiClient.post<IOrdenPago>(BASE_ORDENES, ordenPayload);

  // Paso 2 y 3 — crear pedidos + detalles por tienda en paralelo
  await Promise.all(
    grupos.map(async (grupo) => {
      const pedidoPayload: ICrearPedidoRequest = {
        clienteId,
        vendedorId: grupo.vendedorId,
        ordenPagoId: orden.id,
        tipoEntrega: grupo.tipoEntrega,
        direccionEntrega: grupo.direccionEntrega,
        total: grupo.total,
      };
      const { data: pedido } = await apiClient.post<{ id: number }>(BASE_PEDIDOS, pedidoPayload);

      const detalles: ICrearDetallePedidoRequest[] = grupo.items.map((item) => ({
        pedidoId: pedido.id,
        idVarianteProducto: item.idVarianteProducto,
        cantidad: item.cantidad,
        precio: item.precio,
        personalizacionId: item.personalizacionId ?? null,
      }));

      await Promise.all(detalles.map((d) => apiClient.post(BASE_DETALLES, d)));
    }),
  );

  return orden.id;
}

/** Lista las órdenes de pago del cliente, ordenadas de más reciente a más antigua. */
async function obtenerMisOrdenes(clienteId: number): Promise<IOrdenPago[]> {
  const { data } = await apiClient.get<IOrdenPago[]>(`${BASE_ORDENES}/cliente/${clienteId}`);
  return data;
}

/** Detalle completo de una orden: todos sus pedidos con sus productos. */
async function obtenerDetalleOrden(ordenId: number): Promise<IDetalleOrden> {
  const { data } = await apiClient.get<IDetalleOrden>(`${BASE_ORDENES}/${ordenId}/detalle`);
  return data;
}

/** Cancela un pedido propio (verifica titularidad en el backend). */
async function cancelarPedido(pedidoId: number): Promise<void> {
  await apiClient.patch(`${BASE_PEDIDOS}/${pedidoId}/cancelar`);
}

/** Lista los pedidos recibidos por el comerciante autenticado. */
async function listarPedidosComerciante(): Promise<IPedidoComercianteResumen[]> {
  const { data } = await apiClient.get<IPedidoComercianteResumen[]>(`${BASE_PEDIDOS}/comerciante`);
  return data;
}

/** Detalle completo de un pedido propio del comerciante (items, envío, cliente, historial). */
async function obtenerDetallePedidoComerciante(id: number): Promise<IPedidoComercianteDetalle> {
  const { data } = await apiClient.get<IPedidoComercianteDetalle>(`${BASE_PEDIDOS}/${id}/comerciante-detalle`);
  return data;
}

/** Lista todos los distritos disponibles para envío. */
async function listarDistritos(): Promise<IDistritoEnvio[]> {
  const { data } = await apiClient.get<IDistritoEnvio[]>('/distritos');
  return data;
}

export const pedidoService = {
  crearOrdenCompleta,
  obtenerMisOrdenes,
  obtenerDetalleOrden,
  cancelarPedido,
  listarPedidosComerciante,
  obtenerDetallePedidoComerciante,
  listarDistritos,
};

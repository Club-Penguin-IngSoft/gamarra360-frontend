/**
 * Servicio de checkout / pedidos.
 *
 * Orquesta la creación de una compra completa contra el backend. El backend
 * expone CRUD por entidad (no hay endpoint transaccional de checkout), por lo
 * que la secuencia se arma aquí:
 *
 *   1. OrdenPago       → agrupa toda la compra del cliente
 *   2. Pedido (xtienda)→ uno por cada comerciante (entrega independiente)
 *   3. DetallePedido   → líneas de cada pedido
 *   4. Pago            → registro del pago realizado (pasarela simulada)
 *
 * Limitación conocida: al no existir transacción de servidor, si una llamada
 * intermedia falla pueden quedar registros parciales. Se recomienda, a futuro,
 * un endpoint `/checkout` transaccional en el backend.
 */

import apiClient from './apiClient';
import type { IItemCarrito } from '../types/ICarrito';

export type TipoEntrega = 'DELIVERY' | 'RECOJO_TIENDA';
export type MetodoPago = 'TARJETA' | 'YAPE';

export interface IProcesarCompraParams {
  /** usuario_id del cliente autenticado */
  clienteId: number;
  items: IItemCarrito[];
  /** Opción de entrega elegida por tienda (clave = nombreTienda) */
  tipoEntregaPorTienda: Record<string, TipoEntrega>;
  /** Dirección de envío — solo se aplica a los paquetes con DELIVERY */
  direccionEntrega: string | null;
  metodoPago: MetodoPago;
  /** Costo de envío por cada paquete DELIVERY (S/.) */
  costoEnvioPorPaquete: number;
}

export interface IResultadoCompra {
  ordenPagoId: number;
  total: number;
  pedidosCreados: number;
}

interface IOrdenPagoResponse {
  id: number;
  clienteId: number;
  total: number;
  estado: string;
  fecha: string;
}

interface IPedidoResponse {
  id: number;
}

/** Precio unitario vigente del item (snapshot del carrito, con fallback al producto). */
function precioUnitario(item: IItemCarrito): number {
  return item.precioUnitario ?? item.producto?.precioFinal ?? item.producto?.precioBase ?? 0;
}

/** Agrupa los items del carrito por nombre de tienda. */
function agruparPorTienda(items: IItemCarrito[]): Record<string, IItemCarrito[]> {
  return items.reduce<Record<string, IItemCarrito[]>>((acc, item) => {
    const tienda = item.producto?.nombreTienda ?? 'Tienda';
    if (!acc[tienda]) acc[tienda] = [];
    acc[tienda].push(item);
    return acc;
  }, {});
}

/** Convierte un id string del frontend a número, o null si está vacío/ausente. */
function aNumeroONull(valor?: string): number | null {
  return valor != null && valor !== '' ? Number(valor) : null;
}

/**
 * Procesa la compra completa: crea la orden de pago, un pedido por tienda con
 * sus detalles, y registra el pago. Devuelve el id de la orden creada.
 */
export async function procesarCompra(
  params: IProcesarCompraParams,
): Promise<IResultadoCompra> {
  const {
    clienteId,
    items,
    tipoEntregaPorTienda,
    direccionEntrega,
    metodoPago,
    costoEnvioPorPaquete,
  } = params;

  const porTienda = agruparPorTienda(items);

  const tipoDe = (tienda: string): TipoEntrega =>
    tipoEntregaPorTienda[tienda] ?? 'DELIVERY';
  const subtotalDe = (itemsTienda: IItemCarrito[]): number =>
    itemsTienda.reduce((acc, it) => acc + precioUnitario(it) * it.cantidad, 0);

  // Total global = suma de subtotales + envío de cada paquete DELIVERY
  const total = Object.entries(porTienda).reduce((acc, [tienda, itemsTienda]) => {
    const envio = tipoDe(tienda) === 'DELIVERY' ? costoEnvioPorPaquete : 0;
    return acc + subtotalDe(itemsTienda) + envio;
  }, 0);

  // 1) Orden de pago — el estado PENDIENTE lo asigna @PrePersist automáticamente
  let orden: IOrdenPagoResponse;
  try {
    const res = await apiClient.post<IOrdenPagoResponse>('/ordenes-pago', {
      clienteId,
      total,
    });
    orden = res.data;
  } catch (e) {
    throw Object.assign(e as object, { _paso: 'orden-pago' });
  }

  // 2) + 3) Un pedido por tienda con sus detalles
  let pedidosCreados = 0;
  for (const [tienda, itemsTienda] of Object.entries(porTienda)) {
    const tipo = tipoDe(tienda);
    const totalPedido =
      subtotalDe(itemsTienda) + (tipo === 'DELIVERY' ? costoEnvioPorPaquete : 0);

    // Todas las líneas de una tienda comparten el mismo vendedor
    const idVendedor = itemsTienda[0]?.producto?.idVendedor;

    let pedido: IPedidoResponse;
    try {
      const res = await apiClient.post<IPedidoResponse>('/pedidos', {
        clienteId,
        vendedorId: aNumeroONull(idVendedor),
        ordenPagoId: orden.id,
        total: totalPedido,
        tipoEntrega: tipo,
        direccionEntrega: tipo === 'DELIVERY' ? direccionEntrega : null,
      });
      pedido = res.data;
    } catch (e) {
      throw Object.assign(e as object, { _paso: `pedido-${tienda}` });
    }

    for (const it of itemsTienda) {
      try {
        await apiClient.post('/detalles-pedido', {
          pedidoId: pedido.id,
          idVarianteProducto: aNumeroONull(it.idVariante),
          cantidad: it.cantidad,
          precio: precioUnitario(it),
        });
      } catch (e) {
        throw Object.assign(e as object, { _paso: `detalle-${it.producto?.titulo ?? 'item'}` });
      }
    }
    pedidosCreados += 1;
  }

  // 4) Registrar el pago (aprobado en esta pasarela simulada)
  try {
    await apiClient.post('/pagos', {
      ordenPagoId: orden.id,
      monto: total,
      metodo: metodoPago,
      estado: 'PAGADO',
    });
  } catch (e) {
    throw Object.assign(e as object, { _paso: 'pago' });
  }

  // 5) Confirmar la orden de pago (best-effort: el Pago ya es la fuente de verdad)
  try {
    await apiClient.put(`/ordenes-pago/${orden.id}`, { ...orden, estado: 'PAGADO' });
  } catch {
    /* no-op: el pago quedó registrado igualmente */
  }

  return { ordenPagoId: orden.id, total, pedidosCreados };
}

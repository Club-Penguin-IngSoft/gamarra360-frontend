/**
 * Servicio para leer el historial de compras del cliente autenticado.
 *
 * Flujo de llamadas al backend (CRUD puro, sin endpoint transaccional):
 *   1. GET /ordenes-pago        → filtra las del clienteId en el frontend
 *   2. GET /pedidos?ordenPagoId → pedidos de cada orden (por tienda)
 *   3. GET /detalles-pedido?pedidoId → líneas de cada pedido
 *   4. GET /variantes-producto/{id} + GET /productos/{id}
 *      → nombre e imagen del primer producto del pedido (best-effort)
 */

import apiClient from './apiClient';
import { obtenerProducto } from './catalogoService';

/* ── Tipos del backend ─────────────────────────────────────────────────── */

interface IOrdenPagoBackend {
  id: number;
  clienteId: number;
  total: number;
  estado: string;        // 'PENDIENTE' | 'PAGADO'
  fecha: string;         // ISO 8601
}

interface IPedidoBackend {
  id: number;
  clienteId?: number;
  vendedorId?: number;
  ordenPagoId?: number;
  total: number;
  tipoEntrega?: string;  // 'DELIVERY' | 'RECOJO_TIENDA'
  direccionEntrega?: string | null;
  estado: string;        // 'PENDIENTE_CONFIRMACION' | 'CONFIRMADO' | etc.
  fecha?: string;
}

interface IDetalleBackend {
  id?: number;
  pedidoId?: number;
  idVarianteProducto?: number;
  cantidad: number;
  precio: number;
  // Algunos backends incluyen info del producto via JPA eager loading:
  variante?: {
    idVariante?: number;
    talla?: string;
    color?: string;
    producto?: {
      idProducto: number;
      nombre: string;
      nombreTienda?: string;
      imagenes?: { url: string; esPrincipal: boolean }[];
    };
  };
  // Alternativa plana que algunos backends exponen:
  nombreProducto?: string;
  imagenUrl?: string;
  nombreTienda?: string;
}

interface IVarianteBackend {
  idVariante?: number;
  producto?: { idProducto: number; nombre: string };
}

/* ── Tipo de vista ─────────────────────────────────────────────────────── */

export interface IPedidoDisplay {
  pedidoId: number;
  ordenPagoId: number;
  ordenEstado: string;    // estado del pago global
  pedidoEstado: string;   // estado del pedido (entrega)
  fecha: string;          // ISO string
  total: number;
  tipoEntrega: string;
  nombreProducto?: string;
  imagenProducto?: string;
  nombreTienda?: string;
  cantidadItems: number;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Extrae lista de una respuesta que puede ser array plano o PaginaResponse */
function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj['contenido'])) return obj['contenido'] as T[];
  }
  return [];
}

/** Intenta obtener info del primer producto de un pedido */
async function resolverProductoPedido(
  detalles: IDetalleBackend[],
): Promise<{ nombre?: string; imagen?: string; tienda?: string }> {
  if (detalles.length === 0) return {};

  const det = detalles[0];

  // Caso 1: backend devuelve info anidada
  if (det.variante?.producto) {
    const p = det.variante.producto;
    const imagen =
      p.imagenes?.find((i) => i.esPrincipal)?.url ?? p.imagenes?.[0]?.url;
    return { nombre: p.nombre, imagen, tienda: p.nombreTienda };
  }
  // Caso 2: campos planos en el detalle
  if (det.nombreProducto) {
    return { nombre: det.nombreProducto, imagen: det.imagenUrl, tienda: det.nombreTienda };
  }
  // Caso 3: solo tenemos idVarianteProducto → 2 llamadas adicionales
  if (det.idVarianteProducto) {
    try {
      const { data: varData } =
        await apiClient.get<IVarianteBackend>(`/variantes-producto/${det.idVarianteProducto}`);
      if (varData?.producto?.idProducto) {
        const prod = await obtenerProducto(String(varData.producto.idProducto));
        return {
          nombre: prod.titulo,
          imagen: prod.imagenes[0],
          tienda: prod.nombreTienda,
        };
      }
    } catch {
      /* best-effort */
    }
  }
  return {};
}

/* ── API pública ───────────────────────────────────────────────────────── */

/**
 * Devuelve la lista de pedidos del cliente ordenada del más reciente al más antiguo.
 * Para cada pedido se intenta resolver el nombre e imagen del primer producto.
 */
export async function listarComprasCliente(
  clienteId: number,
): Promise<IPedidoDisplay[]> {
  // 1. Obtener órdenes de pago del cliente
  let ordenes: IOrdenPagoBackend[] = [];
  try {
    const { data } = await apiClient.get<unknown>('/ordenes-pago');
    const todas = toList<IOrdenPagoBackend>(data);
    ordenes = todas.filter((o) => o.clienteId === clienteId);
  } catch {
    return [];
  }

  if (ordenes.length === 0) return [];

  // Orden cronológico descendente
  ordenes.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );

  const resultado: IPedidoDisplay[] = [];

  // 2. Por cada orden, buscar sus pedidos
  for (const orden of ordenes) {
    let pedidos: IPedidoBackend[] = [];
    try {
      const { data } = await apiClient.get<unknown>('/pedidos', {
        params: { ordenPagoId: orden.id },
      });
      pedidos = toList<IPedidoBackend>(data).filter(
        (p) => p.ordenPagoId == null || p.ordenPagoId === orden.id,
      );
    } catch {
      /* no pedidos encontrados para esta orden */
    }

    if (pedidos.length === 0) {
      // Mostrar la orden aunque no haya pedido anidado
      resultado.push({
        pedidoId: orden.id,
        ordenPagoId: orden.id,
        ordenEstado: orden.estado,
        pedidoEstado: orden.estado,
        fecha: orden.fecha,
        total: orden.total,
        tipoEntrega: 'DELIVERY',
        cantidadItems: 0,
      });
      continue;
    }

    // 3. Por cada pedido, resolver sus detalles
    for (const pedido of pedidos) {
      let detalles: IDetalleBackend[] = [];
      try {
        const { data } = await apiClient.get<unknown>('/detalles-pedido', {
          params: { pedidoId: pedido.id },
        });
        detalles = toList<IDetalleBackend>(data);
      } catch {
        /* no detalles */
      }

      const prodInfo = await resolverProductoPedido(detalles);

      resultado.push({
        pedidoId: pedido.id,
        ordenPagoId: orden.id,
        ordenEstado: orden.estado,
        pedidoEstado: pedido.estado,
        fecha: pedido.fecha ?? orden.fecha,
        total: pedido.total,
        tipoEntrega: pedido.tipoEntrega ?? 'DELIVERY',
        nombreProducto: prodInfo.nombre,
        imagenProducto: prodInfo.imagen,
        nombreTienda: prodInfo.tienda,
        cantidadItems: detalles.length,
      });
    }
  }

  return resultado;
}

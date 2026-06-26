/**
 * Helpers de UI para "Mis Pedidos": formato de fecha/código de pedido,
 * info visual de cada EstadoPedido y agrupación de CTAs/tabs según el
 * Figma de Gamarra 360° (componentes "Order status", "Order CTAs", "Tabs v2").
 */

import type { EstadoPedido } from '../types/IPedido';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function formatearFecha(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]}, ${fecha.getFullYear()}`;
}

export function generarCodigoPedido(fechaIso: string, id: number): string {
  const fecha = new Date(fechaIso);
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `N° PED-${yyyy}${mm}${dd}-${String(id).padStart(6, '0')}`;
}

/** Etiqueta y color de cada estado, según el componente "Order status" de Figma. */
export const ESTADO_PEDIDO_INFO: Record<EstadoPedido, { label: string; className: string }> = {
  RECIBIDO: { label: 'Recibido', className: 'bg-ink-200 text-ink-700' },
  EN_PREPARACION: { label: 'En preparación', className: 'bg-info-claro text-info' },
  EN_CAMINO: { label: 'En camino', className: 'bg-exito-claro text-exito' },
  LISTO_PARA_ENTREGA: { label: 'Listo para entrega', className: 'bg-info text-white' },
  ENTREGADO: { label: 'Entregado', className: 'bg-exito text-white' },
  CANCELADO: { label: 'Cancelado', className: 'bg-error-claro text-error' },
};

/** Orden lineal de la máquina de estados del pedido (sin contar CANCELADO). */
export const ORDEN_ESTADOS: EstadoPedido[] = [
  'RECIBIDO', 'EN_PREPARACION', 'EN_CAMINO', 'LISTO_PARA_ENTREGA', 'ENTREGADO',
];

export interface PasoSeguimiento {
  estado: EstadoPedido;
  titulo: string;
  descripcion: string;
}

/**
 * Pasos del seguimiento del pedido, con textos diferenciados según el tipo de
 * entrega (envío a domicilio vs. recojo en tienda). Mismos estados de la BD,
 * solo cambia el mensaje mostrado al cliente.
 */
export function pasosSeguimiento(tipoEntrega: string | null | undefined): PasoSeguimiento[] {
  const esRecojo = tipoEntrega === 'RECOJO_TIENDA';
  return [
    {
      estado: 'RECIBIDO',
      titulo: 'Pedido recibido',
      descripcion: 'El comerciante recibió y confirmó tu pedido.',
    },
    {
      estado: 'EN_PREPARACION',
      titulo: 'En preparación',
      descripcion: 'Tu pedido se está preparando.',
    },
    esRecojo
      ? {
          estado: 'EN_CAMINO',
          titulo: 'Alistando para recojo',
          descripcion: 'Tu pedido se está empacando para que lo recojas.',
        }
      : {
          estado: 'EN_CAMINO',
          titulo: 'En camino',
          descripcion: 'Tu pedido va en camino a tu dirección.',
        },
    esRecojo
      ? {
          estado: 'LISTO_PARA_ENTREGA',
          titulo: 'Listo para recojo',
          descripcion: 'Tu pedido está listo. Acércate a la tienda en Gamarra a recogerlo.',
        }
      : {
          estado: 'LISTO_PARA_ENTREGA',
          titulo: 'Listo para entrega',
          descripcion: 'El repartidor está por llegar a tu dirección.',
        },
    {
      estado: 'ENTREGADO',
      titulo: esRecojo ? 'Recogido' : 'Entregado',
      descripcion: esRecojo
        ? 'Recogiste tu pedido. ¡Gracias por tu compra!'
        : 'Tu pedido fue entregado. ¡Gracias por tu compra!',
    },
  ];
}

/** Grupos de CTA del componente "Order CTAs, Type=Pedido" de Figma. */
export type CtaGroupPedido = 'PENDIENTE_CONFIRMACION' | 'EN_PROGRESO' | 'FINALIZADO';

export const CTA_GROUP_POR_ESTADO: Record<EstadoPedido, CtaGroupPedido> = {
  RECIBIDO: 'PENDIENTE_CONFIRMACION',
  EN_PREPARACION: 'EN_PROGRESO',
  EN_CAMINO: 'EN_PROGRESO',
  LISTO_PARA_ENTREGA: 'EN_PROGRESO',
  ENTREGADO: 'FINALIZADO',
  CANCELADO: 'FINALIZADO',
};

/** Tabs de "Mis Pedidos" (componente "Tabs v2" de Figma, N° Tabs=3). */
export type TabPedidos = 'TODAS' | 'EN_PROGRESO' | 'FINALIZADOS';

const ESTADOS_FINALIZADOS: EstadoPedido[] = ['ENTREGADO', 'CANCELADO'];

export function pedidoCoincideConTab(estado: EstadoPedido, tab: TabPedidos): boolean {
  if (tab === 'TODAS') return true;
  const finalizado = ESTADOS_FINALIZADOS.includes(estado);
  return tab === 'FINALIZADOS' ? finalizado : !finalizado;
}

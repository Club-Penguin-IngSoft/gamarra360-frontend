import type { EstadoPedido } from '../types/IPedido';
import type { EstadoPersonalizacion } from '../types/IPersonalizacion';

export { formatearFecha } from './pedidoUi';

/** Etiquetas legibles para el enum `TipoTrabajo` del backend. */
export const TIPO_TRABAJO_LABEL: Record<string, string> = {
  ESTAMPADO_DTF: 'Estampado DTF',
  BORDADO_INDUSTRIAL: 'Bordado industrial',
  IMPRESION_TEXTIL: 'Impresión textil',
};

export function generarCodigoPersonalizacion(fechaIso: string, id: number): string {
  const fecha = new Date(fechaIso);
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `PER-${yyyy}${mm}${dd}-${String(id).padStart(6, '0')}`;
}

interface BadgeInfo {
  label: string;
  className: string;
}

export const ESTADO_PERSONALIZACION_INFO: Record<'PENDIENTE' | 'RESPONDIDA' | 'RECHAZADA', BadgeInfo> = {
  PENDIENTE: { label: 'Solicitado', className: 'bg-ink-200 text-ink-700' },
  RESPONDIDA: { label: 'Pendiente de pago', className: 'bg-info-claro text-info' },
  RECHAZADA: { label: 'Rechazado', className: 'bg-error-claro text-error' },
};

/**
 * Resuelve el badge visible según el estado de la personalización y, si la
 * personalización fue aceptada, el estado del `Pedido` vinculado.
 */
export function getBadgeInfo(estado: EstadoPersonalizacion, pedidoEstado?: EstadoPedido | null): BadgeInfo {
  if (estado === 'ACEPTADA') {
    if (pedidoEstado === 'ENTREGADO') return { label: 'Entregado', className: 'bg-exito text-white' };
    if (pedidoEstado === 'CANCELADO') return { label: 'Cancelado', className: 'bg-ink-200 text-ink-700' };
    return { label: 'Pagado', className: 'bg-blue-100 text-blue-700' };
  }
  return ESTADO_PERSONALIZACION_INFO[estado];
}

export type TabPersonalizaciones = 'TODAS' | 'EN_PROGRESO' | 'FINALIZADOS';

/** ¿La personalización pertenece a la pestaña `tab` (Todas/En Progreso/Finalizados)? */
export function personalizacionCoincideConTab(
  estado: EstadoPersonalizacion,
  pedidoEstado: EstadoPedido | null | undefined,
  tab: TabPersonalizaciones,
): boolean {
  if (tab === 'TODAS') return true;

  let finalizado: boolean;
  if (estado === 'RECHAZADA') {
    finalizado = true;
  } else if (estado === 'ACEPTADA') {
    finalizado = pedidoEstado === 'ENTREGADO' || pedidoEstado === 'CANCELADO';
  } else {
    finalizado = false;
  }

  return tab === 'FINALIZADOS' ? finalizado : !finalizado;
}

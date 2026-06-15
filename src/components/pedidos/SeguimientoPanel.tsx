import MaterialIcon from '../MaterialIcon';
import type { EstadoPedido, IPedidoConDetalles } from '../../types/IPedido';

interface SeguimientoPanelProps {
  pedido: IPedidoConDetalles;
  abierto: boolean;
  onClose: () => void;
}

interface PasoTimeline {
  etiqueta: string;
  estado: 'completado' | 'actual' | 'pendiente';
  fecha: string | null;
  icono: 'check' | 'close' | null;
}

const ETIQUETA_POR_ESTADO: Partial<Record<EstadoPedido, string>> = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'En preparación',
  LISTO_PARA_ENTREGA: 'Listo para entrega',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
};

function obtenerPasos(tipoEntrega: IPedidoConDetalles['tipoEntrega']): string[] {
  return tipoEntrega === 'DELIVERY'
    ? ['Recibido', 'En preparación', 'Listo para entrega', 'En camino', 'Entregado']
    : ['Recibido', 'En preparación', 'Listo para entrega', 'Entregado'];
}

function obtenerIndicePasoActual(estado: EstadoPedido, pasos: string[]): number {
  if (estado === 'ENTREGADO') return pasos.length - 1;
  const etiqueta = ETIQUETA_POR_ESTADO[estado];
  const idx = etiqueta ? pasos.indexOf(etiqueta) : -1;
  return idx === -1 ? Math.max(pasos.length - 2, 0) : idx;
}

function formatearFechaCorta(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  const dia = fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  const hora = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  return `${dia}, ${hora}`;
}

function construirPasos(pedido: IPedidoConDetalles): PasoTimeline[] {
  if (pedido.estado === 'CANCELADO') {
    return [
      { etiqueta: 'Recibido', estado: 'completado', fecha: pedido.fecha, icono: 'check' },
      { etiqueta: 'Cancelado', estado: 'completado', fecha: pedido.fechaActualizacion, icono: 'close' },
    ];
  }

  const etiquetas = obtenerPasos(pedido.tipoEntrega);
  const indiceActual = obtenerIndicePasoActual(pedido.estado, etiquetas);

  return etiquetas.map((etiqueta, idx) => {
    if (idx < indiceActual) {
      return { etiqueta, estado: 'completado', fecha: idx === 0 ? pedido.fecha : null, icono: 'check' };
    }
    if (idx === indiceActual) {
      return { etiqueta, estado: 'actual', fecha: pedido.fechaActualizacion ?? pedido.fecha, icono: null };
    }
    return { etiqueta, estado: 'pendiente', fecha: null, icono: null };
  });
}

export default function SeguimientoPanel({ pedido, abierto, onClose }: SeguimientoPanelProps) {
  if (!abierto) return null;

  const pasos = construirPasos(pedido);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col bg-white shadow-[-24px_0_48px_-12px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between gap-4 border-b border-ink-100 p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50">
              <MaterialIcon name="local_shipping" style={{ fontSize: '20px' }} className="text-brand-600" />
            </div>
            <h2 className="text-h6 font-semibold text-ink-900">Seguimiento</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-surface-muted"
          >
            <MaterialIcon name="close" style={{ fontSize: '20px' }} />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          {pasos.map((paso, idx) => {
            const esUltimo = idx === pasos.length - 1;
            const siguientePendiente = !esUltimo && pasos[idx + 1].estado === 'pendiente';
            const colorMarcador = paso.estado === 'pendiente' ? 'bg-ink-100' : 'bg-brand-700';

            return (
              <div key={paso.etiqueta} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {paso.estado === 'actual' ? (
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-4 ring-brand-50">
                      <span className="absolute inset-0 rounded-full border-[3px] border-brand-700" />
                      <span className="h-2 w-2 rounded-full bg-brand-700" />
                    </span>
                  ) : (
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorMarcador}`}>
                      {paso.icono && <MaterialIcon name={paso.icono} style={{ fontSize: '16px' }} className="text-white" />}
                    </span>
                  )}
                  {!esUltimo && (
                    <span
                      className={`mt-1 w-0.5 flex-1 ${siguientePendiente ? 'bg-ink-100' : 'bg-brand-700'}`}
                      style={{ minHeight: '32px' }}
                    />
                  )}
                </div>

                <div className={`flex flex-col gap-0.5 ${esUltimo ? 'pb-0' : 'pb-6'}`}>
                  <span className={`text-title3 font-medium ${paso.estado === 'pendiente' ? 'text-ink-400' : 'text-ink-900'}`}>
                    {paso.etiqueta}
                  </span>
                  {paso.fecha && <span className="text-label-md text-ink-500">{formatearFechaCorta(paso.fecha)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

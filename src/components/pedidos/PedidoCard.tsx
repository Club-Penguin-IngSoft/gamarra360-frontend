import { Link } from 'react-router-dom';
import { ShoppingBag, Store, Truck } from 'lucide-react';
import { RUTAS } from '../../constants/rutas';
import { formatearPrecio } from '../../utils/formatearPrecio';
import { CTA_GROUP_POR_ESTADO, ESTADO_PEDIDO_INFO } from '../../utils/pedidoUi';
import type { IPedidoConDetalles } from '../../types/IPedido';

const BTN_BASE =
  'block shrink-0 rounded-lg px-8 py-[18px] text-center text-label-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const BTN_PRIMARY = `${BTN_BASE} bg-brand-500 text-white hover:bg-brand-600`;
const BTN_ERROR_LIGHT = `${BTN_BASE} bg-error-claro text-error hover:bg-red-100`;

interface PedidoCardProps {
  pedido: IPedidoConDetalles;
  ordenId: number;
  onCancelar: (pedidoId: number) => void;
  cancelando?: boolean;
}

export default function PedidoCard({ pedido, ordenId, onCancelar, cancelando }: PedidoCardProps) {
  const estadoInfo = ESTADO_PEDIDO_INFO[pedido.estado] ?? { label: pedido.estado, className: 'bg-ink-200 text-ink-700' };
  const ctaGroup = CTA_GROUP_POR_ESTADO[pedido.estado] ?? 'EN_PROGRESO';

  return (
    <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-ink-100 bg-surface-muted">
              {pedido.fotoTienda ? (
                <img src={pedido.fotoTienda} alt={pedido.nombreTienda ?? ''} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-ink-400">
                  {(pedido.nombreTienda ?? 'T').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-title3 font-semibold text-ink-900">
              {pedido.nombreTienda ?? `Vendedor #${pedido.vendedorId}`}
            </span>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-label-md font-medium ${estadoInfo.className}`}>
            {estadoInfo.label}
          </span>
        </div>

        {pedido.detalles.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {pedido.detalles.slice(0, 3).map((detalle) => (
              <div
                key={detalle.id}
                className="h-[100px] w-[79px] shrink-0 overflow-hidden rounded-md border border-ink-300 bg-surface-muted"
              >
                {detalle.imagenUrl ? (
                  <img src={detalle.imagenUrl} alt={detalle.nombreProducto ?? ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-300">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
            {pedido.detalles.length > 3 && (
              <div className="flex h-[100px] w-[79px] shrink-0 items-center justify-center rounded-md border border-ink-300 bg-surface-muted text-label-md font-medium text-ink-500">
                +{pedido.detalles.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col gap-2">
            <p className="text-title4 font-semibold text-cyan-700">TOTAL TIENDA</p>
            <p className="text-title3 font-medium text-ink-700">{formatearPrecio(pedido.total)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-title4 font-semibold text-cyan-700">TIPO DE ENTREGA</p>
            <div className="flex items-center gap-1 text-body-xl text-ink-700">
              {pedido.tipoEntrega === 'DELIVERY' ? (
                <>
                  <Truck className="h-4 w-4 text-ink-500" /> Envío a domicilio
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 text-ink-500" /> Recojo en tienda
                </>
              )}
            </div>
          </div>
        </div>

        {pedido.tipoEntrega === 'DELIVERY' && pedido.direccionEntrega && (
          <p className="text-body-md text-ink-500">
            Entrega en: <span className="text-ink-700">{pedido.direccionEntrega}</span>
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-3 lg:w-[200px]">
        <Link to={RUTAS.PEDIDO_DETALLE(ordenId, pedido.id)} className={BTN_PRIMARY}>
          Ver detalle
        </Link>
        {ctaGroup === 'PENDIENTE_CONFIRMACION' && (
          <button type="button" onClick={() => onCancelar(pedido.id)} disabled={cancelando} className={BTN_ERROR_LIGHT}>
            {cancelando ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        )}
      </div>
    </div>
  );
}

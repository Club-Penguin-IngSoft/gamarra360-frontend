import { Link } from 'react-router-dom';
import { ArrowRight, Circle, ShoppingBag, Store, Truck } from 'lucide-react';
import { RUTAS } from '../../constants/rutas';
import { formatearPrecio } from '../../utils/formatearPrecio';
import { ESTADO_PEDIDO_INFO, formatearFecha, generarCodigoPedido } from '../../utils/pedidoUi';
import type { IDetalleOrden } from '../../types/IPedido';

interface PedidosRecientesCardProps {
  orden: IDetalleOrden | null;
  cargando: boolean;
}

export default function PedidosRecientesCard({ orden, cargando }: PedidosRecientesCardProps) {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-title1 font-bold text-ink-700">Mis Pedidos Recientes</h3>
        <Link
          to={RUTAS.MIS_PEDIDOS}
          className="flex items-center gap-1 text-label-md font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          Ver todos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {cargando && (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
        </div>
      )}

      {!cargando && !orden && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-surface-muted py-10 text-center">
          <ShoppingBag className="h-10 w-10 text-ink-300" />
          <p className="text-body-md text-ink-500">Aún no tienes pedidos.</p>
        </div>
      )}

      {!cargando && orden && (
        <div className="overflow-hidden rounded-xl border border-ink-100">
          <div className="flex items-center justify-between border-b border-ink-300 px-6 py-6">
            <span className="text-title3 font-medium text-ink-900">{formatearFecha(orden.fecha)}</span>
            <span className="text-title3 font-semibold text-brand-600">{formatearPrecio(orden.total)}</span>
          </div>

          {orden.pedidos.map((pedido, idx) => {
            const estadoInfo = ESTADO_PEDIDO_INFO[pedido.estado];
            return (
              <div
                key={pedido.id}
                className={`flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center ${
                  idx < orden.pedidos.length - 1 ? 'border-b border-ink-300' : ''
                }`}
              >
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded bg-gray-200 px-3 py-2.5 text-label-md font-medium text-ink-700">
                      {generarCodigoPedido(orden.fecha, pedido.id)}
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-label-md font-medium ${estadoInfo.className}`}>
                      <Circle className="h-2.5 w-2.5 fill-current" />
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
                            <img
                              src={detalle.imagenUrl}
                              alt={detalle.nombreProducto ?? ''}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink-300">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-12">
                    <div className="flex flex-col gap-2">
                      <p className="text-title4 font-semibold text-cyan-700">TIENDA</p>
                      <p className="text-title3 font-medium text-ink-700">
                        {pedido.nombreTienda ?? `Vendedor #${pedido.vendedorId}`}
                      </p>
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
                </div>

                <Link
                  to={RUTAS.DETALLE_PEDIDO(orden.id)}
                  className="block shrink-0 rounded-lg bg-brand-500 px-8 py-[18px] text-center text-label-xl font-medium text-white transition-colors hover:bg-brand-600 lg:w-[200px]"
                >
                  Ver detalle
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

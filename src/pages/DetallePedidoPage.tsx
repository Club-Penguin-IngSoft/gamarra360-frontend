import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Store as StoreIcon, ShoppingBag } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { pedidoService } from '../services/pedidoService';
import { personalizacionService } from '../services/personalizacionService';
import { formatearPrecio } from '../utils/formatearPrecio';
import { ESTADO_PEDIDO_INFO } from '../utils/pedidoUi';
import { RUTAS } from '../constants/rutas';
import type { IDetalleOrden, EstadoPago } from '../types/IPedido';
import apiClient from '../services/apiClient';

const ETIQUETA_ESTADO_ORDEN: Record<EstadoPago, string> = {
  PENDIENTE: 'Pendiente de pago',
  PAGADO: 'Pagado',
  FALLIDO: 'Fallido',
};

function formatearFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DetallePedidoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<IDetalleOrden | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAX_INTENTOS = 10;
const INTERVALO_MS = 2000;

useEffect(() => {
  if (!id) return;

  const params = new URLSearchParams(window.location.search);
  const redirectStatus = params.get('redirect_status');

    const cargarDetalle = async () => {
      try {
        if (redirectStatus === 'succeeded') {
          await apiClient.patch(`/ordenes-pago/${id}/marcar-pagado`);

          const pendingPersonalizacionId = sessionStorage.getItem('pendingPersonalizacionId');
          if (pendingPersonalizacionId) {
            sessionStorage.removeItem('pendingPersonalizacionId');
            try {
              await personalizacionService.aceptarPersonalizacion(Number(pendingPersonalizacionId));
            } catch (err) {
              console.error('[DetallePedidoPage] Error al confirmar personalización:', err);
            }
          }
        }
        const data = await pedidoService.obtenerDetalleOrden(Number(id));
        setOrden(data);
      } catch {
        setError('No se pudo cargar el detalle del pedido.');
      } finally {
        setCargando(false);
      }
    };

  const esperarPagoConfirmado = async () => {
    for (let intento = 0; intento < MAX_INTENTOS; intento++) {
      try {
        const data = await pedidoService.obtenerDetalleOrden(Number(id));

        if (data.estado === 'PAGADO') {
          const pendingPersonalizacionId = sessionStorage.getItem('pendingPersonalizacionId');
          if (pendingPersonalizacionId) {
            sessionStorage.removeItem('pendingPersonalizacionId');
            try {
              await personalizacionService.aceptarPersonalizacion(Number(pendingPersonalizacionId));
            } catch (err) {
              console.error('[DetallePedidoPage] Error al confirmar personalización:', err);
            }
          }
          setOrden(data);
          setCargando(false);
          return;
        }

        if (data.estado === 'FALLIDO') {
          setError('Tu pago fue reembolsado porque el stock ya no estaba disponible. El monto será devuelto en 5-10 días hábiles.');
          setCargando(false);
          return;
        }

      } catch {
        // sigue intentando
      }
      await new Promise(res => setTimeout(res, INTERVALO_MS));
    }
    // Si agotó los intentos sin PAGADO ni FALLIDO
    await cargarDetalle();
  };

  if (redirectStatus === 'succeeded') {
    esperarPagoConfirmado();
  } else {
    cargarDetalle();
  }
}, [id]);

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <TopBar active="Inicio" />

      <main className="flex-1 px-4 py-10 md:px-12">
        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() => navigate(RUTAS.MIS_PEDIDOS)}
            className="mb-6 flex items-center gap-2 text-[14px] font-medium text-brand-500 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Mis Pedidos
          </button>

          <h1 className="mb-6 text-[28px] font-bold text-ink-900">Detalle de la Compra</h1>

          {cargando && (
            <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
              <p className="text-[14px]">
                {new URLSearchParams(window.location.search).get('redirect_status') === 'succeeded'
                  ? 'Confirmando tu pago...'
                  : 'Cargando detalle...'}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 flex flex-col gap-3">
              <p className="text-[14px] font-semibold text-red-700">Problema con tu pedido</p>
              <p className="text-[13px] text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => navigate(RUTAS.INICIO)}
                className="self-start rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-700 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {!cargando && !error && orden && (
            <div className="flex flex-col gap-5">

              {/* Encabezado de la orden */}
              <div className="rounded-xl border border-ink-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-ink-400" />
                      <span className="text-[15px] font-bold text-ink-900">Orden #{orden.id}</span>
                    </div>
                    <span className="text-[12px] text-ink-400">{formatearFecha(orden.fecha)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[12px] font-semibold ${
                      orden.estado === 'PAGADO' ? 'text-green-600' :
                      orden.estado === 'FALLIDO' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {ETIQUETA_ESTADO_ORDEN[orden.estado]}
                    </span>
                    <span className="text-[20px] font-bold text-brand-600">{formatearPrecio(orden.total)}</span>
                  </div>
                </div>
              </div>

              {/* Pedido por tienda */}
              {orden.pedidos.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center rounded-xl border border-ink-100 bg-white">
                  <ShoppingBag className="h-10 w-10 text-ink-200" />
                  <p className="text-[14px] text-ink-500">No hay productos en esta orden.</p>
                </div>
              ) : (
                orden.pedidos.map((pedido, idx) => (
                  <div key={pedido.id} className="rounded-xl border border-ink-100 bg-white shadow-sm overflow-hidden">

                    {/* Cabecera del subpedido */}
                    <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3 bg-ink-50/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                          {pedido.fotoTienda ? (
                            <img src={pedido.fotoTienda} alt={pedido.nombreTienda ?? ''} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-ink-400">
                              {(pedido.nombreTienda ?? 'T').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
                            Tienda {idx + 1} de {orden.pedidos.length}
                          </span>
                          <span className="text-[15px] font-bold text-ink-900">
                            {pedido.nombreTienda ?? `Vendedor #${pedido.vendedorId}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ESTADO_PEDIDO_INFO[pedido.estado].className}`}>
                          {ESTADO_PEDIDO_INFO[pedido.estado].label}
                        </span>
                        <div className="flex items-center gap-1 text-[12px] text-ink-500">
                          {pedido.tipoEntrega === 'DELIVERY'
                            ? <><Truck className="h-3.5 w-3.5" /> Delivery</>
                            : <><StoreIcon className="h-3.5 w-3.5" /> Recojo en tienda</>}
                        </div>
                      </div>
                    </div>

                    {/* Dirección si aplica */}
                    {pedido.tipoEntrega === 'DELIVERY' && pedido.direccionEntrega && (
                      <div className="border-b border-ink-100 px-5 py-2.5">
                        <p className="text-[12px] text-ink-500">
                          Entrega en: <span className="text-ink-700">{pedido.direccionEntrega}</span>
                        </p>
                      </div>
                    )}

                    {/* Productos */}
                    <div className="divide-y divide-ink-100">
                      {pedido.detalles.map((d) => (
                        <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                          {/* Imagen del producto */}
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                            {d.imagenUrl ? (
                              <img src={d.imagenUrl} alt={d.nombreProducto ?? ''} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-ink-300">
                                <ShoppingBag className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[14px] font-medium text-ink-900 line-clamp-1">
                                {d.nombreProducto ?? (d.idVarianteProducto != null ? `Variante #${d.idVarianteProducto}` : 'Producto')}
                              </span>
                              <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-400">
                                {d.talla && <span>Talla: {d.talla}</span>}
                                {d.color && <span>Color: {d.color}</span>}
                                {d.sku && <span className="font-mono">SKU: {d.sku}</span>}
                                <span>Cant. {d.cantidad}</span>
                              </div>
                              {d.cotizacionId != null && (
                                <button
                                  type="button"
                                  onClick={() => navigate(RUTAS.DETALLE_COTIZACION(d.cotizacionId!))}
                                  className="mt-1 self-start rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-200"
                                >
                                  Ver cotización #{d.cotizacionId}
                                </button>
                              )}
                              {d.personalizacionId != null && (
                                <button
                                  type="button"
                                  onClick={() => navigate(RUTAS.PERSONALIZACION_DETALLE(d.personalizacionId!))}
                                  className="mt-1 self-start rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700 hover:bg-purple-200"
                                >
                                  Ver personalización #{d.personalizacionId}
                                </button>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[14px] font-bold text-ink-900">
                                {formatearPrecio((d.precio ?? 0) * (d.cantidad ?? 1))}
                              </p>
                              <p className="text-[12px] text-ink-400">{formatearPrecio(d.precio ?? 0)} c/u</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Subtotal tienda */}
                    <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/30 px-5 py-3">
                      <span className="text-[13px] text-ink-500">Subtotal tienda</span>
                      <span className="text-[14px] font-semibold text-ink-900">{formatearPrecio(pedido.total)}</span>
                    </div>
                  </div>
                ))
              )}

              {/* Total general */}
              <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-white px-5 py-4 shadow-sm">
                <span className="text-[16px] font-bold text-ink-900">Total de la compra</span>
                <span className="text-[22px] font-bold text-brand-600">{formatearPrecio(orden.total)}</span>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

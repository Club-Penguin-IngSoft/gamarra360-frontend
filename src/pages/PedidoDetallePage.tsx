import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Truck, Store as StoreIcon } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import MaterialIcon from '../components/MaterialIcon';
import SeguimientoPanel from '../components/pedidos/SeguimientoPanel';
import { pedidoService } from '../services/pedidoService';
import { obtenerProducto } from '../services/catalogoService';
import { useCarrito } from '../hooks/useCarrito';
import { formatearPrecio } from '../utils/formatearPrecio';
import { ESTADO_PEDIDO_INFO, CTA_GROUP_POR_ESTADO, formatearFecha, generarCodigoPedido } from '../utils/pedidoUi';
import { RUTAS } from '../constants/rutas';
import type { IDetalleOrden } from '../types/IPedido';

const BTN_BASE =
  'flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-label-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const BTN_ERROR_LIGHT = `${BTN_BASE} bg-error-claro text-error hover:bg-red-100`;
const BTN_PRIMARY_LIGHT = `${BTN_BASE} bg-brand-50 text-brand-600 hover:bg-brand-100`;
const BTN_SECONDARY = `${BTN_BASE} border border-brand-500 bg-white text-brand-600 hover:bg-brand-50`;

export default function PedidoDetallePage() {
  const { ordenId, pedidoId } = useParams<{ ordenId: string; pedidoId: string }>();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();

  const [orden, setOrden] = useState<IDetalleOrden | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [repitiendo, setRepitiendo] = useState(false);
  const [seguimientoAbierto, setSeguimientoAbierto] = useState(false);

  useEffect(() => {
    if (!ordenId) return;
    const cargar = async () => {
      try {
        const data = await pedidoService.obtenerDetalleOrden(Number(ordenId));
        setOrden(data);
      } catch {
        setError('No se pudo cargar el detalle del pedido.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [ordenId]);

  const pedido = orden?.pedidos.find((p) => p.id === Number(pedidoId)) ?? null;

  async function handleCancelar() {
    if (!pedido) return;
    if (!window.confirm('¿Seguro que deseas cancelar este pedido?')) return;
    setCancelando(true);
    try {
      await pedidoService.cancelarPedido(pedido.id);
      setOrden((prev) =>
        prev
          ? {
              ...prev,
              pedidos: prev.pedidos.map((p) =>
                p.id === pedido.id
                  ? { ...p, estado: 'CANCELADO' as const, fechaActualizacion: new Date().toISOString() }
                  : p,
              ),
            }
          : prev,
      );
    } catch {
      window.alert('No se pudo cancelar el pedido. Inténtalo más tarde.');
    } finally {
      setCancelando(false);
    }
  }

  async function handleRepetir() {
    if (!pedido) return;
    setRepitiendo(true);
    try {
      let agregados = 0;
      for (const detalle of pedido.detalles) {
        if (!detalle.idProducto) continue;
        const producto = await obtenerProducto(String(detalle.idProducto));
        agregarAlCarrito(
          producto,
          detalle.cantidad,
          detalle.idVarianteProducto != null ? String(detalle.idVarianteProducto) : undefined,
        );
        agregados += 1;
      }
      if (agregados === 0) {
        window.alert('Los productos de este pedido ya no están disponibles.');
        return;
      }
      navigate(RUTAS.CARRITO);
    } catch {
      window.alert('No se pudo repetir el pedido. Inténtalo más tarde.');
    } finally {
      setRepitiendo(false);
    }
  }

  const estadoInfo = pedido
    ? ESTADO_PEDIDO_INFO[pedido.estado] ?? { label: pedido.estado, className: 'bg-ink-200 text-ink-700' }
    : null;
  const ctaGroup = pedido ? CTA_GROUP_POR_ESTADO[pedido.estado] ?? 'EN_PROGRESO' : null;
  const subtotalProductos = pedido
    ? pedido.detalles.reduce((acc, d) => acc + (d.precio ?? 0) * (d.cantidad ?? 1), 0)
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Inicio" />

      <main className="flex-1 px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-8">
          <h1 className="text-h3 font-bold text-ink-900">Mi Cuenta</h1>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <CuentaSidebar />

            <div className="flex flex-1 flex-col gap-6 lg:max-w-[1000px]">
              <button
                type="button"
                onClick={() => navigate(RUTAS.MIS_PEDIDOS)}
                className="flex items-center gap-2 self-start text-label-lg font-medium text-ink-700 transition-colors hover:text-ink-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Mis Pedidos
              </button>

              {cargando && (
                <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
                  <p className="text-body-md">Cargando detalle...</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-body-md text-error">
                  {error}
                </div>
              )}

              {!cargando && !error && !pedido && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-100 bg-white py-16 text-center">
                  <ShoppingBag className="h-10 w-10 text-ink-200" />
                  <p className="text-body-md text-ink-500">No se encontró este pedido.</p>
                </div>
              )}

              {!cargando && !error && pedido && orden && estadoInfo && (
                <>
                  {/* Encabezado */}
                  <div className="flex flex-col gap-4 rounded-xl border border-ink-100 bg-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-title1 font-semibold text-ink-900">
                        {generarCodigoPedido(orden.fecha, orden.id)}
                      </h2>
                      <span className={`rounded-full px-3 py-1.5 text-label-md font-medium ${estadoInfo.className}`}>
                        {estadoInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-body-xl text-ink-500">
                      <span>Realizado el {formatearFecha(pedido.fecha)}</span>

                      <span className="h-1 w-1 rounded-full bg-ink-300" />

                      <span className="flex items-center gap-1.5">
                        {pedido.tipoEntrega === 'DELIVERY' ? (
                          <>
                            <Truck className="h-4 w-4 text-ink-500" /> Envío a domicilio
                          </>
                        ) : (
                          <>
                            <StoreIcon className="h-4 w-4 text-ink-500" /> Recojo en tienda
                          </>
                        )}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-ink-300" />

                      <span className="flex items-center gap-1.5">
                        <MaterialIcon name="storefront" style={{ fontSize: '18px' }} className="text-ink-500" />
                        {pedido.nombreTienda ?? `Vendedor #${pedido.vendedorId}`}
                      </span>
                    </div>
                  </div>

                  {/* Dirección de entrega */}
                  {pedido.tipoEntrega === 'DELIVERY' && pedido.direccionEntrega && (
                    <div className="flex flex-col gap-2 rounded-xl border border-ink-100 bg-white p-6">
                      <div className="flex items-center gap-2 text-title3 font-semibold text-ink-900">
                        <MaterialIcon name="location_on" style={{ fontSize: '20px' }} className="text-brand-600" />
                        Dirección de entrega
                      </div>
                      <p className="text-body-xl text-ink-700">{pedido.direccionEntrega}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Productos */}
                    <div className="flex flex-col gap-4 rounded-xl border border-ink-100 bg-white p-6 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-title1 font-semibold text-ink-900">Productos</h3>
                        <span className="text-label-md text-ink-500">
                          {pedido.detalles.length} artículo{pedido.detalles.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="flex flex-col divide-y divide-ink-100">
                        {pedido.detalles.map((d) => (
                          <div key={d.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                            <div className="h-[140px] w-[200px] shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                              {d.imagenUrl ? (
                                <img src={d.imagenUrl} alt={d.nombreProducto ?? ''} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-ink-300">
                                  <ShoppingBag className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                              <div className="flex min-w-0 flex-col gap-1">
                                <span className="line-clamp-2 text-title3 font-medium text-ink-900">
                                  {d.nombreProducto ?? `Variante #${d.idVarianteProducto}`}
                                </span>
                                <div className="flex flex-wrap items-center gap-2 text-label-md text-ink-500">
                                  {d.talla && <span>Talla: {d.talla}</span>}
                                  {d.color && <span>Color: {d.color}</span>}
                                  {d.sku && <span className="font-mono">SKU: {d.sku}</span>}
                                </div>
                                <span className="text-label-md text-ink-500">Cantidad: {d.cantidad}</span>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-title3 font-semibold text-ink-900">
                                  {formatearPrecio((d.precio ?? 0) * (d.cantidad ?? 1))}
                                </p>
                                <p className="text-label-md text-ink-500">{formatearPrecio(d.precio ?? 0)} c/u</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumen + acciones */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-white p-6">
                        <h3 className="text-title1 font-semibold text-ink-900">Resumen de compra</h3>
                        <div className="flex items-center justify-between text-body-xl text-ink-700">
                          <span>Productos ({pedido.detalles.length})</span>
                          <span>{formatearPrecio(subtotalProductos)}</span>
                        </div>
                        <div className="flex items-center justify-between text-body-xl text-ink-700">
                          <span>Envío</span>
                          <span className="font-medium text-exito">Gratis</span>
                        </div>
                        <div className="my-1 border-t border-ink-100" />
                        <div className="flex items-center justify-between">
                          <span className="text-title2 font-semibold text-ink-900">Total</span>
                          <span className="text-h6 font-bold text-brand-600">{formatearPrecio(pedido.total)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-white p-6">
                        <h3 className="text-title1 font-semibold text-ink-900">Gestionar pedido</h3>
                        {ctaGroup === 'PENDIENTE_CONFIRMACION' && (
                          <button type="button" onClick={handleCancelar} disabled={cancelando} className={BTN_ERROR_LIGHT}>
                            {cancelando ? 'Cancelando...' : 'Cancelar pedido'}
                          </button>
                        )}
                        {ctaGroup === 'FINALIZADO' && (
                          <button type="button" onClick={handleRepetir} disabled={repitiendo} className={BTN_PRIMARY_LIGHT}>
                            {repitiendo ? 'Agregando...' : 'Repetir pedido'}
                          </button>
                        )}
                        <button type="button" onClick={() => setSeguimientoAbierto(true)} className={BTN_SECONDARY}>
                          Ver seguimiento
                        </button>
                      </div>
                    </div>
                  </div>

                  <SeguimientoPanel
                    pedido={pedido}
                    abierto={seguimientoAbierto}
                    onClose={() => setSeguimientoAbierto(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

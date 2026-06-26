import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Truck, Store as StoreIcon, ShoppingBag, Package } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../hooks/useAuth';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS } from '../constants/rutas';
import type { ICheckoutGrupo, IDistritoEnvio } from '../types/IPedido';
import type { IPersonalizacionCheckoutState } from '../types/IPersonalizacion';
import { pedidoService } from '../services/pedidoService';
import { obtenerPerfilCliente } from '../services/clienteService';

type TipoEntrega = 'DELIVERY' | 'RECOJO_TIENDA';

interface EntregaTienda {
  tipoEntrega: TipoEntrega;
}

interface ICotizacionCheckoutState {
  cotizacionId: number;
  vendedorId: number;
  nombreTienda?: string;
  precioUnitario: number;
}

/* ── Helpers de fecha ─────────────────────────────────────────────────────── */

function fechaConOffset(diasOffset: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasOffset);
  const raw = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(fecha);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

const TEXTO_DELIVERY = `Llega el ${fechaConOffset(2)}, de 9 a 21 h.`;
const TEXTO_RECOJO   = `desde el ${fechaConOffset(1)} a las 7 pm`;

/* ── Componente ──────────────────────────────────────────────────────────── */
export default function CheckoutEntregaPage() {
  const { items } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    personalizacion?: IPersonalizacionCheckoutState;
    cotizacion?: ICotizacionCheckoutState;
  } | null;
  const personalizacion = locationState?.personalizacion;
  const cotizacion      = locationState?.cotizacion;

  /* Dirección */
  const [calle, setCalle]           = useState('');
  const [referencia, setReferencia] = useState('');
  const [idDistrito, setIdDistrito] = useState<number | null>(null);
  const [errorDireccion, setErrorDireccion] = useState('');

  /* Distritos */
  const [distritos, setDistritos]             = useState<IDistritoEnvio[]>([]);
  const [cargandoDistritos, setCargandoDistritos] = useState(true);

  useEffect(() => {
    pedidoService.listarDistritos()
      .then(setDistritos)
      .catch(() => {})
      .finally(() => setCargandoDistritos(false));
  }, []);

  /* Pre-poblar desde el perfil guardado si el usuario es cliente */
  useEffect(() => {
    if (!usuario || usuario.rol !== 'CLIENTE') return;
    obtenerPerfilCliente()
      .then(p => {
        if (p.idDistrito) setIdDistrito(p.idDistrito);
        if (p.direccionEntrega) setCalle(p.direccionEntrega);
        if (p.referencia) setReferencia(p.referencia);
      })
      .catch(() => {}); // silencioso — el usuario puede ingresar manualmente
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const distritosLima   = useMemo(() => distritos.filter(d => d.ciudad === 'Lima'),   [distritos]);
  const distritosCallao = useMemo(() => distritos.filter(d => d.ciudad === 'Callao'), [distritos]);

  const distritoSeleccionado = useMemo(
    () => distritos.find(d => d.id === idDistrito) ?? null,
    [distritos, idDistrito],
  );
  const costoDistrito = distritoSeleccionado?.costoEnvio ?? 0;

  /* Agrupar items por comerciante — prioridad: cotizacion > personalizacion > carrito */
  const porComerciante: Record<string, ICheckoutGrupo> = cotizacion
    ? {
        [String(cotizacion.vendedorId)]: {
          nombreTienda: cotizacion.nombreTienda ?? 'Tienda',
          items: [{
            id: `cotizacion-${cotizacion.cotizacionId}`,
            nombreProducto: 'Cotización acordada',
            imagenUrl: undefined,
            cantidad: 1,
            precioUnitario: cotizacion.precioUnitario,
            precioBase: cotizacion.precioUnitario,
            idVarianteProducto: null,
          }],
        },
      }
    : personalizacion
    ? {
        [String(personalizacion.vendedorId)]: {
          nombreTienda: personalizacion.nombreTienda ?? 'Tienda',
          items: [{
            id: `personalizacion-${personalizacion.personalizacionId}`,
            nombreProducto: personalizacion.nombreProducto ?? 'Producto personalizado',
            imagenUrl: personalizacion.imagenUrl ?? undefined,
            cantidad: 1,
            precioUnitario: personalizacion.precioUnitario,
            precioBase: personalizacion.precioUnitario,
            idVarianteProducto: personalizacion.detalleProductoId,
          }],
        },
      }
    : items.reduce<Record<string, ICheckoutGrupo>>((acc, item) => {
        const id = item.producto.idComerciante || 'default';
        if (!acc[id]) {
          acc[id] = { nombreTienda: item.producto.nombreTienda ?? 'Tienda', items: [] };
        }
        acc[id].items.push({
          id: item.id,
          nombreProducto: item.producto.titulo,
          imagenUrl: item.producto.imagenes?.[0],
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          precioBase: item.producto.precioBase ?? item.producto.precioFinal ?? 0,
          idVarianteProducto: item.idVariante
            ? Number(item.idVariante)
            : Number(item.producto.variantes?.[0]?.id) || null,
        });
        return acc;
      }, {});

  const tiendas = Object.entries(porComerciante);

  /* Estado de entrega independiente por tienda */
  const [entregasPorTienda, setEntregasPorTienda] = useState<Record<string, EntregaTienda>>(() =>
    Object.fromEntries(tiendas.map(([id]) => [id, { tipoEntrega: 'DELIVERY' as TipoEntrega }]))
  );

  const actualizarEntrega = (idComerciante: string, cambios: Partial<EntregaTienda>) => {
    setEntregasPorTienda(prev => ({
      ...prev,
      [idComerciante]: { ...prev[idComerciante], ...cambios },
    }));
  };

  /* Cálculos */
  const hayDelivery       = Object.values(entregasPorTienda).some(e => e.tipoEntrega === 'DELIVERY');
  const todasRecojoTienda = !hayDelivery;

  const todosLosItems = tiendas.flatMap(([, g]) => g.items);
  // Total real = precios efectivos (precioUnitario ya refleja precioEfectivo de variante)
  const totalItems = todosLosItems.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
  // Ahorros por ofertas (solo cuando precioBase > precioUnitario)
  const descuentos = todosLosItems.reduce((acc, i) => {
    return acc + Math.max(0, (i.precioBase - i.precioUnitario) * i.cantidad);
  }, 0);
  // "Subtotal" mostrado = precios base = efectivos + ahorros
  const subtotal = totalItems + descuentos;
  const costoEnvioTotal = Object.values(entregasPorTienda).reduce(
    (acc, e) => acc + (e.tipoEntrega === 'DELIVERY' ? costoDistrito : 0),
    0,
  );
  const total = totalItems + costoEnvioTotal;

  /* Carrito vacío */
  if (tiendas.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-surface-muted">
        <TopBar active="Inicio" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <ShoppingBag className="h-16 w-16 text-ink-300" />
          <h2 className="text-[24px] font-bold text-ink-900">Tu carrito está vacío</h2>
          <button
            type="button"
            onClick={() => navigate(RUTAS.CARRITO)}
            className="mt-4 rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600"
          >
            Volver al Carrito
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  /* Continuar al pago */
  const handleContinuar = () => {
    if (hayDelivery && (!calle.trim() || !idDistrito)) {
      setErrorDireccion('Ingresa la calle y selecciona el distrito para continuar.');
      return;
    }
    setErrorDireccion('');

    const nombreDistrito = distritoSeleccionado?.nombre ?? '';
    const ciudadDistrito = distritoSeleccionado?.ciudad ?? '';
    const direccionCompleta = hayDelivery
      ? `${calle.trim()}, ${nombreDistrito}, ${ciudadDistrito}${referencia ? ` (Ref: ${referencia})` : ''}`
      : 'Recojo en tienda';

    const entregasParaPago = Object.fromEntries(
      Object.entries(entregasPorTienda).map(([id, e]) => [
        id,
        {
          tipoEntrega: e.tipoEntrega,
          fechaEntrega: e.tipoEntrega === 'DELIVERY' ? TEXTO_DELIVERY : `Gamarra, ${TEXTO_RECOJO}`,
        },
      ])
    );

    navigate(RUTAS.PAGO, {
      state: {
        entregasPorTienda: entregasParaPago,
        direccionEntrega: direccionCompleta,
        idDistrito,
        costoEnvioEstimado: costoEnvioTotal,
        ...(cotizacion
          ? {
              cotizacionId: cotizacion.cotizacionId,
              cotizacionGrupo: {
                vendedorId: cotizacion.vendedorId,
                precioUnitario: cotizacion.precioUnitario,
              },
            }
          : {}),
        ...(personalizacion
          ? {
              personalizacionId: personalizacion.personalizacionId,
              personalizacionGrupo: {
                vendedorId: personalizacion.vendedorId,
                idVarianteProducto: personalizacion.detalleProductoId,
                precioUnitario: personalizacion.precioUnitario,
              },
            }
          : {}),
      },
    });
  };

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Inicio" />
      <main className="flex-1 px-4 py-8 md:px-12">

        {/* Stepper */}
        <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-0">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-[13px] font-bold text-white">1</div>
            <span className="text-[13px] font-semibold text-ink-900">Entrega</span>
          </div>
          <div className="mb-5 h-[2px] w-40 bg-ink-200 mx-3" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-200 bg-white text-[13px] font-bold text-ink-400">2</div>
            <span className="text-[13px] font-medium text-ink-400">Pago</span>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <section className="flex flex-col gap-4">
            <h1 className="text-[28px] font-bold text-ink-900">Entrega</h1>

            {/* Dirección de entrega */}
            <div className="rounded-xl border border-ink-100 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-brand-500" />
                <span className="text-[14px] font-semibold text-ink-900">Dirección de entrega</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Calle */}
                <input
                  type="text"
                  placeholder="Calle y número (ej. Av. Arequipa 3421)"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  disabled={todasRecojoTienda}
                  className="w-full rounded-lg border border-ink-200 px-4 py-3 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />

                {/* Distrito — select agrupado por ciudad */}
                <div className="relative">
                  <select
                    value={idDistrito ?? ''}
                    onChange={(e) => setIdDistrito(e.target.value ? Number(e.target.value) : null)}
                    disabled={todasRecojoTienda || cargandoDistritos}
                    className="w-full appearance-none rounded-lg border border-ink-200 bg-white px-4 py-3 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    style={{ color: idDistrito ? '#212529' : '#adb5bd' }}
                  >
                    <option value="">
                      {cargandoDistritos ? 'Cargando distritos…' : 'Selecciona tu distrito'}
                    </option>
                    {distritosLima.length > 0 && (
                      <optgroup label="Lima">
                        {distritosLima.map(d => (
                          <option key={d.id} value={d.id} style={{ color: '#212529' }}>
                            {d.nombre}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {distritosCallao.length > 0 && (
                      <optgroup label="Callao">
                        {distritosCallao.map(d => (
                          <option key={d.id} value={d.id} style={{ color: '#212529' }}>
                            {d.nombre}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {/* Referencia */}
                <input
                  type="text"
                  placeholder="Referencia (opcional, ej. frente al parque)"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  disabled={todasRecojoTienda}
                  className="w-full rounded-lg border border-ink-200 px-4 py-3 text-[14px] outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />

                {errorDireccion && (
                  <p className="text-[13px] text-red-500">{errorDireccion}</p>
                )}
              </div>
            </div>

            {/* Paquete por tienda */}
            {tiendas.map(([idComerciante, { nombreTienda, items: itemsTienda }], idx) => {
              const entrega = entregasPorTienda[idComerciante];
              if (!entrega) return null;

              return (
                <div key={idComerciante} className="rounded-xl border border-ink-100 bg-white shadow-sm overflow-hidden">
                  {/* Cabecera */}
                  <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
                        Paquete {idx + 1} de {tiendas.length}
                      </span>
                      <span className="text-[15px] font-bold text-ink-900">{nombreTienda}</span>
                    </div>
                    <Package className="h-5 w-5 text-ink-300" />
                  </div>

                  {/* Items */}
                  <div className="px-5 pt-4 pb-2 flex flex-col gap-3">
                    {itemsTienda.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                          {item.imagenUrl ? (
                            <img
                              src={item.imagenUrl}
                              alt={item.nombreProducto}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink-300">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-[14px] font-medium text-ink-900 line-clamp-1">{item.nombreProducto}</p>
                          <p className="text-[13px] text-ink-500">Cant. {item.cantidad}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Opciones de entrega */}
                  <div className="px-5 pb-5 pt-3 flex flex-col gap-2">

                    {/* Delivery */}
                    <div
                      className={`rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                        entrega.tipoEntrega === 'DELIVERY'
                          ? 'border-brand-400 bg-brand-50/40'
                          : 'border-ink-100 hover:border-ink-200'
                      }`}
                      onClick={() => actualizarEntrega(idComerciante, { tipoEntrega: 'DELIVERY' })}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Truck className={`mt-0.5 h-4 w-4 shrink-0 ${
                            entrega.tipoEntrega === 'DELIVERY' ? 'text-brand-500' : 'text-ink-400'
                          }`} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-semibold text-ink-900">Envío a domicilio</span>
                            {entrega.tipoEntrega === 'DELIVERY' ? (
                              <>
                                <span className="text-[13px] text-ink-500">{TEXTO_DELIVERY}</span>
                                <span className="mt-0.5 text-[13px] text-ink-500">
                                  {idDistrito
                                    ? costoDistrito > 0 ? formatearPrecio(costoDistrito) : 'Gratis'
                                    : 'Costo según distrito'}
                                </span>
                              </>
                            ) : (
                              <span className="text-[13px] text-ink-500">
                                {idDistrito
                                  ? costoDistrito > 0 ? formatearPrecio(costoDistrito) : 'Gratis'
                                  : 'Costo según distrito'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          entrega.tipoEntrega === 'DELIVERY' ? 'border-brand-500' : 'border-ink-300'
                        }`}>
                          {entrega.tipoEntrega === 'DELIVERY' && (
                            <div className="h-2 w-2 rounded-full bg-brand-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recojo en tienda */}
                    <div
                      className={`rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                        entrega.tipoEntrega === 'RECOJO_TIENDA'
                          ? 'border-brand-400 bg-brand-50/40'
                          : 'border-ink-100 hover:border-ink-200'
                      }`}
                      onClick={() => actualizarEntrega(idComerciante, { tipoEntrega: 'RECOJO_TIENDA' })}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <StoreIcon className={`mt-0.5 h-4 w-4 shrink-0 ${
                            entrega.tipoEntrega === 'RECOJO_TIENDA' ? 'text-brand-500' : 'text-ink-400'
                          }`} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-semibold text-ink-900">Retiro en tienda</span>
                            <span className="text-[13px] text-ink-500">
                              {nombreTienda} — Gamarra, {TEXTO_RECOJO}
                            </span>
                            <span className="mt-0.5 text-[13px] font-medium text-brand-500">(Gratis)</span>
                          </div>
                        </div>
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          entrega.tipoEntrega === 'RECOJO_TIENDA' ? 'border-brand-500' : 'border-ink-300'
                        }`}>
                          {entrega.tipoEntrega === 'RECOJO_TIENDA' && (
                            <div className="h-2 w-2 rounded-full bg-brand-500" />
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </section>

          {/* Aside: Resumen de Compra */}
          <aside className="flex h-fit flex-col gap-5 rounded-xl border border-ink-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-[18px] font-semibold text-ink-900">Resumen de Compra</h2>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-ink-600">Subtotal</span>
                <span className="text-ink-900">{formatearPrecio(subtotal)}</span>
              </div>
              {descuentos > 0 && (
                <div className="flex items-center justify-between text-[14px] text-brand-500">
                  <span>Descuentos</span>
                  <span>- {formatearPrecio(descuentos)}</span>
                </div>
              )}
              {tiendas.map(([idComerciante, { nombreTienda }]) => {
                const e = entregasPorTienda[idComerciante];
                if (!e) return null;
                const costoTienda = e.tipoEntrega === 'DELIVERY' ? costoDistrito : 0;
                return (
                  <div key={idComerciante} className="flex items-center justify-between text-[14px]">
                    <span className="text-ink-600 truncate max-w-[160px]">Envío · {nombreTienda}</span>
                    <span className={costoTienda === 0 ? 'font-medium text-brand-500' : 'text-ink-900'}>
                      {costoTienda === 0
                        ? (e.tipoEntrega === 'RECOJO_TIENDA' ? 'Gratis' : (idDistrito ? 'Gratis' : '—'))
                        : formatearPrecio(costoTienda)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="text-[16px] font-semibold text-ink-900">Total</span>
              <span className="text-[22px] font-bold text-brand-600">{formatearPrecio(total)}</span>
            </div>

            <button
              type="button"
              onClick={handleContinuar}
              className="h-12 w-full rounded-lg bg-[#c83a71] text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#a62b5a]"
            >
              Continuar al pago
            </button>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

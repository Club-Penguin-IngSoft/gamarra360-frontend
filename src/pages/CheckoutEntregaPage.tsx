/**
 * Página de Entrega del flujo de checkout.
 * Diseño basado en mockup: stepper + dirección + paquete con opciones de entrega inline.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, Store as StoreIcon, ShoppingBag, Package } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useCarrito } from '../hooks/useCarrito';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS, COSTO_ENVIO_DELIVERY } from '../constants';

const generarFechasEnvio = () => {
  const dias = [];
  const opcionesCortas: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: '2-digit' };
  const opcionesLargas: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

  for (let i = 1; i <= 5; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + i); // Incrementa un día en cada vuelta

    // Genera el formato tipo: "Vie 29/05"
    let label = new Intl.DateTimeFormat('es-PE', opcionesCortas).format(fecha);
    label = label.replace('.', ''); // Elimina puntos molestos del formato
    label = label.charAt(0).toUpperCase() + label.slice(1); // Pone la primera letra en mayúscula

    // Genera el formato tipo: "viernes 29 de mayo de 9 a 21 h."
    const textoLargo = `${new Intl.DateTimeFormat('es-PE', opcionesLargas).format(fecha)} de 9 a 21 h.`;

    dias.push({
      id: `dia-${i}`,
      label: label,
      textoLargo: textoLargo
    });
  }
  return dias;
};

// Guardamos los días dinámicos en la misma constante para no romper el resto del código
const FECHAS_ENVIO = generarFechasEnvio();

export default function CheckoutEntregaPage() {
  const { items } = useCarrito();
  const navigate = useNavigate();

  const [tipoEntrega, setTipoEntrega] = useState<'DELIVERY' | 'RECOJO_TIENDA'>('DELIVERY');
  const [mostrarFechas, setMostrarFechas] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(FECHAS_ENVIO[0]);

  // Dirección de entrega — estado local, se pasa a PagoPage al continuar
  const [calle, setCalle] = useState('');
  const [distrito, setDistrito] = useState('');
  const [provincia, setProvincia] = useState('Lima');
  const [editandoDireccion, setEditandoDireccion] = useState(true);

  const direccionCompleta = calle.trim() && distrito.trim();

  const guardarDireccion = () => {
    if (direccionCompleta) setEditandoDireccion(false);
  };

  if (!items || items.length === 0) {
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

  const subtotalSinDescuento = items.reduce((acc, i) => {
    const base = i.producto?.precioBase ?? i.producto?.precioFinal ?? 0;
    return acc + base * i.cantidad;
  }, 0);
  const descuentos = items.reduce((acc, i) => {
    const base = i.producto?.precioBase ?? 0;
    const final = i.producto?.precioFinal ?? 0;
    const ahorro = base > final ? base - final : 0;
    return acc + ahorro * i.cantidad;
  }, 0);
  const costoEnvio = tipoEntrega === 'DELIVERY' ? COSTO_ENVIO_DELIVERY : 0;
  const total = subtotalSinDescuento - descuentos + costoEnvio;

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Inicio" />

      <main className="flex-1 px-4 py-8 md:px-12">
        {/* Stepper */}
        <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-0">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-[13px] font-bold text-white">
              1
            </div>
            <span className="text-[13px] font-semibold text-ink-900">Entrega</span>
          </div>
          <div className="mb-5 h-[2px] w-40 bg-ink-200 mx-3" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-200 bg-white text-[13px] font-bold text-ink-400">
              2
            </div>
            <span className="text-[13px] font-medium text-ink-400">Pago</span>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">

          {/* Columna izquierda */}
          <section className="flex flex-col gap-4">
            <h1 className="text-[28px] font-bold text-ink-900">Entrega</h1>

            {/* Dirección */}
            <div className="rounded-xl border border-ink-100 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  <span className="text-[14px] font-semibold text-ink-900">Dirección de entrega</span>
                </div>
                {!editandoDireccion && (
                  <button
                    type="button"
                    onClick={() => setEditandoDireccion(true)}
                    className="text-[13px] font-medium text-brand-500 hover:text-brand-700"
                  >
                    Cambiar
                  </button>
                )}
              </div>

              {/* Dirección guardada — solo lectura */}
              {!editandoDireccion && direccionCompleta && (
                <div className="mt-3 rounded-lg border border-ink-100 bg-surface-muted px-4 py-3">
                  <p className="text-[14px] text-ink-800">{calle}</p>
                  <p className="text-[13px] text-ink-500">{distrito}, {provincia}</p>
                </div>
              )}

              {/* Formulario de ingreso / edición */}
              {editandoDireccion && (
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Calle y número (ej. Av. Arequipa 3421)"
                    value={calle}
                    onChange={(e) => setCalle(e.target.value)}
                    className="h-10 w-full rounded-md border border-ink-200 bg-white px-3 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Distrito (ej. San Isidro)"
                      value={distrito}
                      onChange={(e) => setDistrito(e.target.value)}
                      className="h-10 flex-1 rounded-md border border-ink-200 bg-white px-3 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Provincia"
                      value={provincia}
                      onChange={(e) => setProvincia(e.target.value)}
                      className="h-10 w-32 rounded-md border border-ink-200 bg-white px-3 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={guardarDireccion}
                    disabled={!direccionCompleta}
                    className="self-end rounded-md bg-brand-500 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Guardar dirección
                  </button>
                </div>
              )}
            </div>

            {/* Paquetes agrupados por tienda */}
            {(() => {
              // Agrupar items por tienda
              const porTienda = items.reduce<Record<string, typeof items>>((acc, item) => {
                const tienda = item.producto?.nombreTienda ?? 'Tienda';
                if (!acc[tienda]) acc[tienda] = [];
                acc[tienda].push(item);
                return acc;
              }, {});

              const tiendas = Object.entries(porTienda);

              return tiendas.map(([nombreTienda, itemsTienda], idxPaquete) => (
                <div key={nombreTienda} className="rounded-xl border border-ink-100 bg-white shadow-sm overflow-hidden">
                  {/* Cabecera del paquete */}
                  <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
                        Paquete {idxPaquete + 1} de {tiendas.length}
                      </span>
                      <span className="text-[15px] font-bold text-ink-900">{nombreTienda}</span>
                    </div>
                    <Package className="h-5 w-5 text-ink-300" />
                  </div>

                  {/* Items del paquete */}
                  <div className="px-5 pt-4 pb-2 flex flex-col gap-3">
                    {itemsTienda.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                          <img
                            src={item.producto.imagenes?.[0]}
                            alt={item.producto.titulo}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-[14px] font-medium text-ink-900 line-clamp-1">{item.producto.titulo}</p>
                          <p className="text-[13px] text-ink-500">Cant. {item.cantidad}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Opciones de entrega del paquete */}
                  <div className="px-5 pb-5 pt-3 flex flex-col gap-2">

                    {/* Envío a domicilio */}
                    <div
                      className={`rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                        tipoEntrega === 'DELIVERY'
                          ? 'border-brand-400 bg-brand-50/40'
                          : 'border-ink-100 hover:border-ink-200'
                      }`}
                      onClick={() => setTipoEntrega('DELIVERY')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Truck className={`mt-0.5 h-4 w-4 shrink-0 ${tipoEntrega === 'DELIVERY' ? 'text-brand-500' : 'text-ink-400'}`} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-semibold text-ink-900">Envío a domicilio</span>
                            {tipoEntrega === 'DELIVERY' ? (
                              <span className="text-[13px] text-ink-500">
                                Llega el {fechaSeleccionada.textoLargo}
                              </span>
                            ) : (
                              <span className="text-[13px] text-ink-500">S/ 12.00</span>
                            )}
                            {tipoEntrega === 'DELIVERY' && (
                              <div className="mt-1 flex items-center gap-3">
                                <span className="text-[13px] text-ink-500">S/ 12.00</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMostrarFechas(!mostrarFechas);
                                  }}
                                  className="text-[13px] font-medium text-brand-500 hover:text-brand-700"
                                >
                                  Cambiar fecha
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Radio button */}
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${tipoEntrega === 'DELIVERY' ? 'border-brand-500' : 'border-ink-300'}`}>
                          {tipoEntrega === 'DELIVERY' && <div className="h-2 w-2 rounded-full bg-brand-500" />}
                        </div>
                      </div>

                      {/* Selector de fechas */}
                      {tipoEntrega === 'DELIVERY' && mostrarFechas && (
                        <div className="mt-3 border-t border-ink-100 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {FECHAS_ENVIO.map((fecha) => (
                              <button
                                key={fecha.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFechaSeleccionada(fecha);
                                  setMostrarFechas(false);
                                }}
                                className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-all ${
                                  fechaSeleccionada.id === fecha.id
                                    ? 'border-brand-500 bg-brand-500 text-white'
                                    : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                                }`}
                              >
                                {fecha.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Retiro en tienda */}
                    <div
                      className={`rounded-lg border px-4 py-3 cursor-pointer transition-all ${
                        tipoEntrega === 'RECOJO_TIENDA'
                          ? 'border-brand-400 bg-brand-50/40'
                          : 'border-ink-100 hover:border-ink-200'
                      }`}
                      onClick={() => {
                        setTipoEntrega('RECOJO_TIENDA');
                        setMostrarFechas(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <StoreIcon className={`mt-0.5 h-4 w-4 shrink-0 ${tipoEntrega === 'RECOJO_TIENDA' ? 'text-brand-500' : 'text-ink-400'}`} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-semibold text-ink-900">Retiro en tienda</span>
                            <span className="text-[13px] text-ink-500">
                              Retira tu pedido en: Galería Yüma, Piso 3, Stand 304 – Gamarra, desde hoy a las 7 pm
                            </span>
                            <span className="mt-0.5 text-[13px] font-medium text-brand-500">(Gratis)</span>
                          </div>
                        </div>
                        <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${tipoEntrega === 'RECOJO_TIENDA' ? 'border-brand-500' : 'border-ink-300'}`}>
                          {tipoEntrega === 'RECOJO_TIENDA' && <div className="h-2 w-2 rounded-full bg-brand-500" />}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ));
            })()}
          </section>

          {/* Aside — Resumen */}
          <aside className="flex h-fit flex-col gap-5 rounded-xl border border-ink-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-[18px] font-semibold text-ink-900">Resumen de Compra</h2>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-ink-600">Subtotal</span>
                <span className="text-ink-900">{formatearPrecio(subtotalSinDescuento)}</span>
              </div>
              {descuentos > 0 && (
                <div className="flex items-center justify-between text-[14px] text-brand-500">
                  <span>Descuentos</span>
                  <span>- {formatearPrecio(descuentos)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-ink-600">Entrega (1)</span>
                <span className={tipoEntrega === 'RECOJO_TIENDA' ? 'font-medium text-brand-500' : 'text-ink-900'}>
                  {tipoEntrega === 'RECOJO_TIENDA' ? 'Gratis' : formatearPrecio(costoEnvio)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="text-[16px] font-semibold text-ink-900">Total</span>
              <span className="text-[22px] font-bold text-brand-600">{formatearPrecio(total)}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(RUTAS.PAGO, {
                  state: {
                    tipoEntrega,
                    direccionEntrega:
                      tipoEntrega === 'DELIVERY'
                        ? `${calle.trim()}, ${distrito.trim()}, ${provincia.trim()}`
                        : null,
                    fechaEntrega: tipoEntrega === 'DELIVERY' ? fechaSeleccionada.textoLargo : null,
                  },
                })
              }
              disabled={tipoEntrega === 'DELIVERY' && !direccionCompleta}
              className="h-12 w-full rounded-lg bg-[#c83a71] text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#a62b5a] disabled:cursor-not-allowed disabled:opacity-40"
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
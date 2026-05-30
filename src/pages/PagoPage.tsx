import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Check,
  CheckCircle,
  CreditCard,
  Smartphone,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Info,
  Loader2
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../hooks/useAuth';
import { crearPedido } from '../services/checkoutService';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS, COSTO_ENVIO_DELIVERY } from '../constants';

export default function PagoPage() {
  const { items, vaciarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Datos pasados desde CheckoutEntregaPage (opción de entrega por tienda)
  const {
    tipoEntregaPorTienda = {},
    direccionEntrega = null,
    costoEnvio: costoEnvioState = null,
  } = (location.state as {
    tipoEntregaPorTienda?: Record<string, 'DELIVERY' | 'RECOJO_TIENDA'>;
    direccionEntrega?: string | null;
    costoEnvio?: number | null;
  }) ?? {};

  const [metodoPago, setMetodoPago] = useState<'TARJETA' | 'YAPE'>('TARJETA');
  const [necesitaFactura, setNecesitaFactura] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  const [campos, setCampos] = useState({
    numeroTarjeta: '',
    vencimiento: '',
    ccv: '',
    titular: '',
    celular: '',
    codigoYape: '',
  });
  const [errores, setErrores] = useState<Record<string, string>>({});

  const subtotalSinDescuento = items.reduce((acc, i) => {
    const base = i.producto.precioBase ?? i.producto.precioFinal ?? 0;
    return acc + base * i.cantidad;
  }, 0);
  const descuentos = items.reduce((acc, i) => {
    const base = i.producto.precioBase ?? 0;
    const final = i.producto.precioFinal ?? 0;
    const ahorro = base > final ? base - final : 0;
    return acc + ahorro * i.cantidad;
  }, 0);

  // Entrega por tienda: cada paquete con DELIVERY suma un costo de envío
  const tiendas = [...new Set(items.map((i) => i.producto?.nombreTienda ?? 'Tienda'))];
  const getTipoEntrega = (tienda: string) => tipoEntregaPorTienda[tienda] ?? 'DELIVERY';
  const paquetesDelivery = tiendas.filter((t) => getTipoEntrega(t) === 'DELIVERY').length;
  const hayDelivery = paquetesDelivery > 0;
  const costoEnvio = costoEnvioState ?? paquetesDelivery * COSTO_ENVIO_DELIVERY;
  const total = subtotalSinDescuento - descuentos + costoEnvio;

  const actualizar = (campo: keyof typeof campos, valor: string) => {
    let nuevoValor = valor;

    // 1. Campos que SOLO aceptan dígitos
    if (['numeroTarjeta', 'ccv', 'celular', 'codigoYape'].includes(campo)) {
      nuevoValor = valor.replace(/\D/g, '');
    }

    // 2. Límites de longitud máxima
    if (campo === 'numeroTarjeta') nuevoValor = nuevoValor.slice(0, 16);
    if (campo === 'ccv')           nuevoValor = nuevoValor.slice(0, 4);   // Visa/MC = 3, Amex = 4
    if (campo === 'celular')       nuevoValor = nuevoValor.slice(0, 9);   // Perú: 9 dígitos
    if (campo === 'codigoYape')    nuevoValor = nuevoValor.slice(0, 6);   // Código Yape = 6

    // 3. Formato automático MM/AA para vencimiento
    if (campo === 'vencimiento') {
      const soloNum = valor.replace(/\D/g, '');
      nuevoValor = soloNum.length > 2
        ? `${soloNum.slice(0, 2)}/${soloNum.slice(2, 4)}`
        : soloNum;
    }

    // 4. Titular: solo letras y espacios
    if (campo === 'titular') {
      nuevoValor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    setCampos(p => ({ ...p, [campo]: nuevoValor }));
    if (errores[campo]) setErrores(p => ({ ...p, [campo]: '' }));
  };

  const handlePagar = async () => {
    const nuevosErrores: Record<string, string> = {};

    if (metodoPago === 'TARJETA') {
      if (campos.numeroTarjeta.length < 16)
        nuevosErrores.numeroTarjeta = 'La tarjeta debe tener 16 dígitos';
      if (campos.vencimiento.length < 5)
        nuevosErrores.vencimiento = 'Formato incompleto (MM/AA)';
      if (campos.ccv.length < 3)
        nuevosErrores.ccv = 'El CCV debe tener 3 o 4 dígitos';
      if (!campos.titular.trim() || campos.titular.length < 3)
        nuevosErrores.titular = 'Ingresa el nombre completo del titular';
    } else {
      if (campos.celular.length !== 9)
        nuevosErrores.celular = 'El número debe tener exactamente 9 dígitos';
      if (campos.codigoYape.length !== 6)
        nuevosErrores.codigoYape = 'El código de aprobación tiene 6 dígitos';
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    if (items.length === 0) {
      setErrorPago('Tu carrito está vacío.');
      return;
    }

    if (hayDelivery && !direccionEntrega) {
      setErrorPago('Falta la dirección de entrega. Vuelve al paso anterior.');
      return;
    }

    // Requiere sesión con cuenta CLIENTE
    if (!usuario) {
      setErrorPago('Debes iniciar sesión para completar tu compra.');
      return;
    }
    if (usuario.rol !== 'CLIENTE') {
      setErrorPago('Solo las cuentas de tipo Cliente pueden realizar compras.');
      return;
    }

    setErrorPago(null);
    setProcesando(true);
    try {
      // Agrupar items por tienda → un llamado a /checkout por vendedor (transaccional)
      const porTienda = items.reduce<Record<string, typeof items>>((acc, item) => {
        const key = item.producto?.nombreTienda ?? 'Tienda';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      for (const [tienda, itemsTienda] of Object.entries(porTienda)) {
        const tipo = (tipoEntregaPorTienda[tienda] ?? 'DELIVERY') as 'DELIVERY' | 'RECOJO_TIENDA';
        const subtotal = itemsTienda.reduce(
          (acc, it) => acc + (it.precioUnitario ?? it.producto?.precioFinal ?? 0) * it.cantidad, 0
        );
        const envio = tipo === 'DELIVERY' ? COSTO_ENVIO_DELIVERY : 0;
        const totalPedido = subtotal + envio;

        // vendedorId: usuario_id del comerciante — viene en IProducto.idVendedor
        const vendedorId = Number(itemsTienda[0]?.producto?.idVendedor ?? 0);

        await crearPedido({
          vendedorId,
          tipoEntrega: tipo,
          direccionEntrega: tipo === 'DELIVERY' ? direccionEntrega : null,
          total: totalPedido,
          items: itemsTienda.map((it) => ({
            idVarianteProducto: it.idVariante ? Number(it.idVariante) : 0,
            cantidad: it.cantidad,
            precio: it.precioUnitario ?? it.producto?.precioFinal ?? 0,
          })),
        });
      }

      setPagoExitoso(true);
      vaciarCarrito();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensaje?: string } } };
      const mensaje =
        e?.response?.data?.mensaje ?? 'No se pudo procesar el pago. Inténtalo nuevamente.';
      setErrorPago(mensaje);
      console.error('Error en pago:', err);
    } finally {
      setProcesando(false);
    }
  };

  const inputClass = (campo: string) =>
    `w-full rounded-lg border px-4 py-3 text-[14px] outline-none transition-colors focus:ring-1 ${
      errores[campo]
        ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
        : 'border-ink-200 focus:border-brand-500 focus:ring-brand-500'
    }`;

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <TopBar active="Inicio" />

      <main className="flex-1 px-4 py-10 md:px-12">
        {/* Stepper */}
        <div className="mx-auto mb-10 flex max-w-2xl items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-bold">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-[13px] font-medium text-ink-900">Entrega</span>
          </div>
          <div className="mb-6 h-[2px] w-32 bg-ink-100 mx-4" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white font-bold">
              2
            </div>
            <span className="text-[13px] font-medium text-ink-900">Pago</span>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          <section className="flex flex-col gap-6">
            <h1 className="text-[32px] font-bold text-ink-900">Pago</h1>

            <div className="flex flex-col gap-4">
              {/* TARJETA */}
              <div className={`overflow-hidden rounded-xl border transition-all ${metodoPago === 'TARJETA' ? 'border-brand-200 bg-white shadow-sm' : 'border-ink-100 bg-white/60 hover:border-brand-200'}`}>
                <div
                  onClick={() => setMetodoPago('TARJETA')}
                  className="flex cursor-pointer items-center justify-between p-5"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`h-6 w-6 ${metodoPago === 'TARJETA' ? 'text-brand-600' : 'text-ink-500'}`} />
                    <span className="text-[16px] font-bold text-ink-900">Tarjeta de Débito/Crédito</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="flex h-6 w-10 items-center justify-center rounded border border-ink-200 bg-ink-50 text-[10px] font-bold text-ink-600">VISA</div>
                      <div className="flex h-6 w-10 items-center justify-center rounded border border-ink-200 bg-ink-50 text-[10px] font-bold text-ink-600">MC</div>
                    </div>
                    {metodoPago === 'TARJETA' ? <ChevronUp className="h-5 w-5 text-ink-400" /> : <ChevronDown className="h-5 w-5 text-ink-400" />}
                  </div>
                </div>

                {metodoPago === 'TARJETA' && (
                  <div className="flex flex-col gap-4 border-t border-ink-100 p-5 pt-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Número de tarjeta"
                        value={campos.numeroTarjeta}
                        onChange={(e) => actualizar('numeroTarjeta', e.target.value)}
                        className={inputClass('numeroTarjeta')}
                      />
                      {errores.numeroTarjeta && <p className="mt-1 text-[12px] text-red-500">{errores.numeroTarjeta}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Válido hasta MM/AA"
                          value={campos.vencimiento}
                          onChange={(e) => actualizar('vencimiento', e.target.value)}
                          className={inputClass('vencimiento')}
                        />
                        {errores.vencimiento && <p className="mt-1 text-[12px] text-red-500">{errores.vencimiento}</p>}
                      </div>
                      <div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="CCV"
                            value={campos.ccv}
                            onChange={(e) => actualizar('ccv', e.target.value)}
                            className={inputClass('ccv')}
                          />
                          <EyeOff className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                        </div>
                        {errores.ccv && <p className="mt-1 text-[12px] text-red-500">{errores.ccv}</p>}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Nombre del titular"
                        value={campos.titular}
                        onChange={(e) => actualizar('titular', e.target.value)}
                        className={inputClass('titular')}
                      />
                      {errores.titular && <p className="mt-1 text-[12px] text-red-500">{errores.titular}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* YAPE */}
              <div className={`overflow-hidden rounded-xl border transition-all ${metodoPago === 'YAPE' ? 'border-brand-200 bg-white shadow-sm' : 'border-ink-100 bg-white/60 hover:border-brand-200'}`}>
                <div
                  onClick={() => setMetodoPago('YAPE')}
                  className="flex cursor-pointer items-center justify-between p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-[#742384] text-white">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <span className="text-[16px] font-bold text-ink-900">Yape</span>
                  </div>
                  {metodoPago === 'YAPE' ? <ChevronUp className="h-5 w-5 text-ink-400" /> : <ChevronDown className="h-5 w-5 text-ink-400" />}
                </div>

                {metodoPago === 'YAPE' && (
                  <div className="flex flex-col gap-4 border-t border-ink-100 p-5 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Número de celular"
                          value={campos.celular}
                          onChange={(e) => actualizar('celular', e.target.value)}
                          className={inputClass('celular')}
                        />
                        {errores.celular && <p className="mt-1 text-[12px] text-red-500">{errores.celular}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Código de aprobación"
                          value={campos.codigoYape}
                          onChange={(e) => actualizar('codigoYape', e.target.value)}
                          className={inputClass('codigoYape')}
                        />
                        {errores.codigoYape && <p className="mt-1 text-[12px] text-red-500">{errores.codigoYape}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-surface-muted p-4 text-[13px] text-ink-700 border border-ink-100">
                      <Info className="h-5 w-5 text-ink-500 shrink-0" />
                      <p>El código es válido por 2 minutos. Luego podrás generar otro en tu app Yape.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FACTURACIÓN */}
            <div className="mt-4 rounded-xl border border-ink-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-[16px] font-bold text-ink-900">Datos de Facturación</h3>
              <label className="mb-4 flex cursor-pointer items-center gap-2 text-[14px] text-ink-700">
                <input
                  type="checkbox"
                  checked={necesitaFactura}
                  onChange={(e) => setNecesitaFactura(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                ¿Necesitas factura?
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="RUC"
                  disabled={!necesitaFactura}
                  className={`w-full rounded-lg border px-4 py-3 text-[14px] outline-none transition-colors ${necesitaFactura ? 'border-ink-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white' : 'border-transparent bg-ink-50 text-ink-400 cursor-not-allowed'}`}
                />
                <input
                  type="text"
                  placeholder="Razón Social"
                  disabled={!necesitaFactura}
                  className={`w-full rounded-lg border px-4 py-3 text-[14px] outline-none transition-colors ${necesitaFactura ? 'border-ink-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white' : 'border-transparent bg-ink-50 text-ink-400 cursor-not-allowed'}`}
                />
              </div>
            </div>
          </section>

          {/* RESUMEN */}
          <aside className="flex h-fit flex-col gap-6 rounded-xl border border-ink-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-[20px] font-bold text-ink-900">Resumen de Compra</h2>

            {/* Resumen de entrega por tienda */}
            {hayDelivery && direccionEntrega && (
              <div className="rounded-lg border border-ink-100 bg-surface-muted px-4 py-3 text-[13px]">
                <p className="font-medium text-ink-700">
                  Envío a domicilio{paquetesDelivery > 1 ? ` (${paquetesDelivery} paquetes)` : ''}:
                </p>
                <p className="text-ink-600">{direccionEntrega}</p>
              </div>
            )}
            {paquetesDelivery < tiendas.length && (
              <div className="rounded-lg border border-ink-100 bg-surface-muted px-4 py-3 text-[13px]">
                <p className="font-medium text-brand-600">
                  Retiro en tienda{hayDelivery ? ' (algunos paquetes)' : ''} — Gratis
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-ink-700">Subtotal</span>
                <span className="font-medium text-ink-900">{formatearPrecio(subtotalSinDescuento)}</span>
              </div>
              {descuentos > 0 && (
                <div className="flex items-center justify-between text-[15px] text-brand-600">
                  <span>Descuentos</span>
                  <span>- {formatearPrecio(descuentos)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-ink-700">
                  Entrega{paquetesDelivery > 0 ? ` (${paquetesDelivery} paquete${paquetesDelivery > 1 ? 's' : ''})` : ''}
                </span>
                <span className={`font-medium ${costoEnvio === 0 ? 'text-brand-600' : 'text-ink-900'}`}>
                  {costoEnvio === 0 ? 'Gratis' : formatearPrecio(costoEnvio)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="text-[18px] font-bold text-ink-900">Total</span>
              <span className="text-[24px] font-bold text-brand-600">{formatearPrecio(total)}</span>
            </div>
            {errorPago && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[13px] text-red-600">
                {errorPago}
              </p>
            )}
            <button
              onClick={handlePagar}
              disabled={procesando}
              className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#c83a71] text-[16px] font-medium text-white shadow-md transition-colors hover:bg-[#a62b5a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {procesando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando…
                </>
              ) : (
                'Pagar'
              )}
            </button>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Modal pago exitoso */}
      {pagoExitoso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-500" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[22px] font-bold text-ink-900">¡Pago exitoso!</h2>
              <p className="text-[14px] text-ink-500">Tu pedido está siendo procesado.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(RUTAS.INICIO)}
              className="h-11 w-full rounded-lg bg-[#c83a71] text-[15px] font-semibold text-white hover:bg-[#a62b5a] transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
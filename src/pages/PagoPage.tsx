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
  Info
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useCarrito } from '../hooks/useCarrito';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS } from '../constants/rutas';

export default function PagoPage() {
  const { items, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();
  const location = useLocation();

  // Datos pasados desde CheckoutEntregaPage
  const { tipoEntrega = 'DELIVERY', direccionEntrega = null, fechaEntrega = null } =
    (location.state as { tipoEntrega?: string; direccionEntrega?: string | null; fechaEntrega?: string | null }) ?? {};

  const [metodoPago, setMetodoPago] = useState<'TARJETA' | 'YAPE'>('TARJETA');
  const [necesitaFactura, setNecesitaFactura] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);

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
  const costoEnvio = tipoEntrega === 'RECOJO_TIENDA' ? 0 : 12.00;
  const total = subtotalSinDescuento - descuentos + costoEnvio;

  const actualizar = (campo: keyof typeof campos, valor: string) => {
    setCampos(p => ({ ...p, [campo]: valor }));
    // Limpiar error del campo al escribir
    if (errores[campo]) setErrores(p => ({ ...p, [campo]: '' }));
  };

  const handlePagar = () => {
    const nuevosErrores: Record<string, string> = {};

    if (metodoPago === 'TARJETA') {
      if (!campos.numeroTarjeta.trim()) nuevosErrores.numeroTarjeta = 'Ingresa el número de tarjeta';
      if (!campos.vencimiento.trim()) nuevosErrores.vencimiento = 'Ingresa la fecha de vencimiento';
      if (!campos.ccv.trim()) nuevosErrores.ccv = 'Ingresa el CCV';
      if (!campos.titular.trim()) nuevosErrores.titular = 'Ingresa el nombre del titular';
    } else {
      if (!campos.celular.trim()) nuevosErrores.celular = 'Ingresa tu número de celular';
      if (!campos.codigoYape.trim()) nuevosErrores.codigoYape = 'Ingresa el código de aprobación';
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setPagoExitoso(true);
    vaciarCarrito();
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

            {/* Dirección confirmada */}
            {tipoEntrega === 'DELIVERY' && direccionEntrega && (
              <div className="rounded-lg border border-ink-100 bg-surface-muted px-4 py-3 text-[13px]">
                <p className="font-medium text-ink-700">Envío a:</p>
                <p className="text-ink-600">{direccionEntrega}</p>
                {fechaEntrega && <p className="mt-0.5 text-ink-500">Llega el {fechaEntrega}</p>}
              </div>
            )}
            {tipoEntrega === 'RECOJO_TIENDA' && (
              <div className="rounded-lg border border-ink-100 bg-surface-muted px-4 py-3 text-[13px]">
                <p className="font-medium text-brand-600">Retiro en tienda — Gratis</p>
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
                <span className="text-ink-700">Entrega</span>
                <span className={`font-medium ${tipoEntrega === 'RECOJO_TIENDA' ? 'text-brand-600' : 'text-ink-900'}`}>
                  {tipoEntrega === 'RECOJO_TIENDA' ? 'Gratis' : formatearPrecio(costoEnvio)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="text-[18px] font-bold text-ink-900">Total</span>
              <span className="text-[24px] font-bold text-brand-600">{formatearPrecio(total)}</span>
            </div>
            <button
              onClick={handlePagar}
              className="mt-2 h-14 w-full rounded-lg bg-[#c83a71] text-[16px] font-medium text-white transition-colors hover:bg-[#a62b5a] shadow-md"
            >
              Pagar
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
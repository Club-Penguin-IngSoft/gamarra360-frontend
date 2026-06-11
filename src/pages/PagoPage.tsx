// src/pages/PagoPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { STRIPE_PUBLISHABLE_KEY } from '../constants';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../hooks/useAuth';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS } from '../constants/rutas';
import { pedidoService } from '../services/pedidoService';
import { pagoService } from '../services/pagoService';
import type { IGrupoTienda } from '../services/pedidoService';
import type { TipoEntrega } from '../types/IPedido';

// ── Stripe init (fuera del componente para no recrear en cada render) ──
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
const COSTO_DELIVERY = 12;

interface EntregaTiendaState {
  tipoEntrega: TipoEntrega;
  fechaEntrega?: string;
}
interface PersonalizacionGrupoState {
  vendedorId: number;
  idVarianteProducto: number;
  precioUnitario: number;
}
interface CheckoutState {
  entregasPorTienda?: Record<string, EntregaTiendaState>;
  direccionEntrega?: string;
  personalizacionId?: number;
  personalizacionGrupo?: PersonalizacionGrupoState;
}

// ── Formulario interno de Stripe ──────────────────────────────────────
function StripeCheckoutForm({
  ordenId,
  onExito,
}: {
  ordenId: number;
  onExito: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePagar = async () => {
    if (!stripe || !elements) return;
    setCargando(true);
    setError(null);

    // Valida los campos del formulario de Stripe antes de confirmar
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Error al validar el formulario.');
      setCargando(false);
      return;
    }

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe redirige aquí tras el pago exitoso
        return_url: `${window.location.origin}${RUTAS.DETALLE_PEDIDO(ordenId)}`,
      },
    });

    // Si llegamos aquí es porque hubo error (en pago exitoso Stripe redirige)
    if (stripeError) {
      setError(stripeError.message ?? 'El pago no pudo procesarse.');
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: { billingDetails: { name: 'auto' } },
        }}
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePagar}
        disabled={!stripe || cargando}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#c83a71] text-[16px] font-semibold text-white shadow-md transition-colors hover:bg-[#a62b5a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          'Pagar ahora'
        )}
      </button>

      <p className="text-center text-[12px] text-ink-400">
        Pago seguro procesado por Stripe · tus datos están cifrados
      </p>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────
export default function PagoPage() {
  const { items, vaciarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { entregasPorTienda = {}, direccionEntrega = '', personalizacionId, personalizacionGrupo } =
    (location.state as CheckoutState) ?? {};
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [ordenId, setOrdenId] = useState<number | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [errorInicio, setErrorInicio] = useState<string | null>(null);
  // ── Cálculos de totales — se calculan UNA vez y se guardan en estado ──
  const [resumen, setResumen] = useState({
    subtotalSinDescuento: 0,
    descuentos: 0,
    costoEnvio: 0,
    total: 0,
  });

  // Calcula el resumen al montar, antes de que se vacíe el carrito
  useEffect(() => {
    const entregasArr = Object.values(entregasPorTienda);
    const costoEnvio =
      entregasArr.length > 0
        ? entregasArr.reduce(
            (acc, e) => acc + (e.tipoEntrega === 'DELIVERY' ? COSTO_DELIVERY : 0),
            0
          )
        : COSTO_DELIVERY;

    if (personalizacionGrupo) {
      const subtotalSinDescuento = personalizacionGrupo.precioUnitario;
      setResumen({ subtotalSinDescuento, descuentos: 0, costoEnvio, total: subtotalSinDescuento + costoEnvio });
      return;
    }

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
    const total = subtotalSinDescuento - descuentos + costoEnvio;

    setResumen({ subtotalSinDescuento, descuentos, costoEnvio, total });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  

  // ── Al montar: crea la orden en el backend y obtiene el clientSecret ──
  useEffect(() => {
    if ((!items.length && !personalizacionGrupo) || !usuario) return;

    const iniciarPago = async () => {
      setIniciando(true);
      setErrorInicio(null);

      try {
        // 1. Crea la OrdenPago + Pedidos en tu backend (igual que antes)
        let grupos: IGrupoTienda[];

        if (personalizacionGrupo) {
          const idComerciante = String(personalizacionGrupo.vendedorId);
          const entregaTienda = entregasPorTienda[idComerciante];
          const tipoEntrega = entregaTienda?.tipoEntrega ?? 'DELIVERY';
          const costoEntrega = tipoEntrega === 'DELIVERY' ? COSTO_DELIVERY : 0;

          grupos = [{
            vendedorId: personalizacionGrupo.vendedorId,
            tipoEntrega,
            direccionEntrega: tipoEntrega === 'DELIVERY' ? direccionEntrega : undefined,
            total: personalizacionGrupo.precioUnitario + costoEntrega,
            items: [{
              idVarianteProducto: personalizacionGrupo.idVarianteProducto,
              cantidad: 1,
              precio: personalizacionGrupo.precioUnitario,
              personalizacionId,
            }],
          }];
        } else {
          const porComerciante = items.reduce<Record<string, typeof items>>(
            (acc, item) => {
              const id = item.producto.idComerciante || 'sin-tienda';
              if (!acc[id]) acc[id] = [];
              acc[id].push(item);
              return acc;
            },
            {}
          );

          grupos = Object.entries(porComerciante).map(
            ([idComerciante, itemsGrupo]) => {
              const entregaTienda = entregasPorTienda[idComerciante];
              const tipoEntrega = entregaTienda?.tipoEntrega ?? 'DELIVERY';
              const costoEntrega =
                tipoEntrega === 'DELIVERY' ? COSTO_DELIVERY : 0;
              const subtotalGrupo = itemsGrupo.reduce((acc, i) => {
                const precio =
                  i.producto.precioFinal ?? i.producto.precioBase ?? 0;
                return acc + precio * i.cantidad;
              }, 0);
              return {
                vendedorId: Number(idComerciante) || 0,
                tipoEntrega,
                direccionEntrega:
                  tipoEntrega === 'DELIVERY'
                    ? direccionEntrega
                    : undefined,
                total: subtotalGrupo + costoEntrega,
                items: itemsGrupo.map((i) => ({
                  idVarianteProducto: i.idVariante
                    ? Number(i.idVariante)
                    : Number(i.producto.variantes?.[0]?.id) || null,
                  cantidad: i.cantidad,
                  precio: i.precioUnitario,
                })),
              };
            }
          );
        }

        const idOrden = await pedidoService.crearOrdenCompleta(
          Number(usuario.id),
          resumen.total,
          grupos
        );
        setOrdenId(idOrden);

        // 2. Crea el PaymentIntent en Stripe y obtiene el clientSecret
        const { clientSecret: secret } =
          await pagoService.crearIntent(idOrden);
        setClientSecret(secret);

        if (personalizacionId) {
          // El carrito no se usó: guardamos el id para confirmar la
          // personalización tras el redirect de Stripe (ver DetallePedidoPage)
          sessionStorage.setItem('pendingPersonalizacionId', String(personalizacionId));
        } else {
          // Vaciamos el carrito aquí para que no se duplique la orden
          vaciarCarrito();
        }
      } catch (err) {
        console.error('[PagoPage] Error al iniciar pago:', err);
        setErrorInicio(
          'No se pudo iniciar el pago. Por favor vuelve al carrito e intenta de nuevo.'
        );
      } finally {
        setIniciando(false);
      }
    };

    iniciarPago();
  }, []); // solo al montar

  if (!items.length && !clientSecret && !personalizacionGrupo) {
    return (
      <div className="flex min-h-screen flex-col bg-surface-muted">
        <TopBar active="Inicio" />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-[16px] text-ink-500">Tu carrito está vacío.</p>
            <button
              type="button"
              onClick={() => navigate(RUTAS.CARRITO)}
              className="mt-4 rounded-lg bg-[#c83a71] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#a62b5a]"
            >
              Volver al carrito
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <TopBar active="Inicio" />

      <main className="flex-1 px-4 py-10 md:px-12">
        {/* Stepper — igual que antes */}
        <div className="mx-auto mb-10 flex max-w-2xl items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-bold">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-[13px] font-medium text-ink-900">
              Entrega
            </span>
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
          {/* Formulario de pago */}
          <section className="flex flex-col gap-6">
            <h1 className="text-[32px] font-bold text-ink-900">Pago</h1>

            <div className="rounded-xl border border-ink-100 bg-white p-6 shadow-sm">
              {iniciando && (
                <div className="flex flex-col items-center gap-3 py-10 text-ink-400">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                  <p className="text-[14px]">Preparando el formulario de pago...</p>
                </div>
              )}

              {errorInicio && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <p className="text-[14px] text-red-600">{errorInicio}</p>
                  <button
                    type="button"
                    onClick={() => navigate(RUTAS.CARRITO)}
                    className="rounded-lg border border-ink-200 px-5 py-2.5 text-[14px] font-medium text-ink-700 hover:bg-ink-50"
                  >
                    Volver al carrito
                  </button>
                </div>
              )}

              {clientSecret && ordenId && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'flat',
                      variables: {
                        colorPrimary: '#c83a71',
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                      },
                    },
                  }}
                >
                  <StripeCheckoutForm
                    ordenId={ordenId}
                    onExito={() => navigate(RUTAS.DETALLE_PEDIDO(ordenId))}
                  />
                </Elements>
              )}
            </div>
          </section>

          {/* Resumen — igual que antes */}
          <aside className="flex h-fit flex-col gap-6 rounded-xl border border-ink-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-[20px] font-bold text-ink-900">
              Resumen de Compra
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-ink-700">Subtotal</span>
                <span className="font-medium text-ink-900">
                  {formatearPrecio(resumen.subtotalSinDescuento)}
                </span>
              </div>
              {resumen.descuentos > 0 && (
                <div className="flex items-center justify-between text-[15px] text-brand-600">
                  <span>Descuentos</span>
                  <span>- {formatearPrecio(resumen.descuentos)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-ink-700">Entrega</span>
                <span
                  className={
                    resumen.costoEnvio === 0
                      ? 'font-medium text-brand-500'
                      : 'font-medium text-ink-900'
                  }
                >
                  {resumen.costoEnvio === 0 ? 'Gratis' : formatearPrecio(resumen.costoEnvio)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="text-[18px] font-bold text-ink-900">Total</span>
              <span className="text-[24px] font-bold text-brand-600">
                {formatearPrecio(resumen.total)}
              </span>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
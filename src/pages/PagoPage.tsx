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
//import { pedidoService } from '../services/pedidoService';
import { pagoService } from '../services/pagoService';
import type { IGrupoTienda } from '../services/pedidoService';
import type { TipoEntrega } from '../types/IPedido';

// ── Stripe init (fuera del componente para no recrear en cada render) ──
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface EntregaTiendaState {
  tipoEntrega: TipoEntrega;
  fechaEntrega?: string;
}
interface PersonalizacionGrupoState {
  vendedorId: number;
  idVarianteProducto: number;
  precioUnitario: number;
}
interface CotizacionGrupoState {
  vendedorId: number;
  precioUnitario: number;
}
interface CheckoutState {
  entregasPorTienda?: Record<string, EntregaTiendaState>;
  direccionEntrega?: string;
  idDistrito?: number | null;
  costoEnvioEstimado?: number;
  personalizacionId?: number;
  personalizacionGrupo?: PersonalizacionGrupoState;
  cotizacionId?: number;
  cotizacionGrupo?: CotizacionGrupoState;
}

// ── Formulario interno de Stripe ──────────────────────────────────────
function StripeCheckoutForm() {
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
        return_url: `${window.location.origin}/pedido-confirmado`,
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
  const { items } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { entregasPorTienda = {}, direccionEntrega = '', idDistrito = null, costoEnvioEstimado = 0, personalizacionId, personalizacionGrupo, cotizacionId, cotizacionGrupo } =
    (location.state as CheckoutState) ?? {};
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  //const [ordenId, setOrdenId] = useState<number | null>(null);
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
    // costoEnvioEstimado viene de CheckoutEntregaPage con el costo real del distrito seleccionado
    const costoEnvio = costoEnvioEstimado;

    if (personalizacionGrupo) {
      const subtotalSinDescuento = personalizacionGrupo.precioUnitario;
      setResumen({ subtotalSinDescuento, descuentos: 0, costoEnvio, total: subtotalSinDescuento + costoEnvio });
      return;
    }

    if (cotizacionGrupo) {
      const subtotalSinDescuento = cotizacionGrupo.precioUnitario;
      setResumen({ subtotalSinDescuento, descuentos: 0, costoEnvio, total: subtotalSinDescuento + costoEnvio });
      return;
    }

    // Estimación inicial con precioUnitario (fuente de verdad del carrito)
    const subtotalSinDescuento = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
    const total = subtotalSinDescuento + costoEnvio;

    setResumen({ subtotalSinDescuento, descuentos: 0, costoEnvio, total });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  

  // ── Al montar: crea la orden en el backend y obtiene el clientSecret ──
  useEffect(() => {
    if ((!items.length && !personalizacionGrupo && !cotizacionGrupo) || !usuario) return;

  const iniciarPago = async () => {
    setIniciando(true);
    setErrorInicio(null);

    try {
      let grupos: IGrupoTienda[];

      if (personalizacionGrupo) {
        const idComerciante = String(personalizacionGrupo.vendedorId);
        const entregaTienda = entregasPorTienda[idComerciante];
        const tipoEntrega = entregaTienda?.tipoEntrega ?? 'DELIVERY';

        grupos = [{
          vendedorId: personalizacionGrupo.vendedorId,
          tipoEntrega,
          direccionEntrega: tipoEntrega === 'DELIVERY' ? direccionEntrega : undefined,
          idDistrito: tipoEntrega === 'DELIVERY' ? idDistrito : null,
          total: personalizacionGrupo.precioUnitario,
          items: [{
            idVarianteProducto: personalizacionGrupo.idVarianteProducto,
            cantidad: 1,
            precio: personalizacionGrupo.precioUnitario,
            personalizacionId,
          }],
        }];
      } else if (cotizacionGrupo) {
        const idComerciante = String(cotizacionGrupo.vendedorId);
        const entregaTienda = entregasPorTienda[idComerciante];
        const tipoEntrega = entregaTienda?.tipoEntrega ?? 'DELIVERY';

        grupos = [{
          vendedorId: cotizacionGrupo.vendedorId,
          tipoEntrega,
          direccionEntrega: tipoEntrega === 'DELIVERY' ? direccionEntrega : undefined,
          idDistrito: tipoEntrega === 'DELIVERY' ? idDistrito : null,
          total: cotizacionGrupo.precioUnitario,
          items: [{
            idVarianteProducto: null,
            cantidad: 1,
            precio: cotizacionGrupo.precioUnitario,
            cotizacionId,
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
            const subtotalGrupo = itemsGrupo.reduce(
              (acc, i) => acc + i.precioUnitario * i.cantidad,
              0
            );
            return {
              vendedorId: Number(idComerciante) || 0,
              tipoEntrega,
              direccionEntrega: tipoEntrega === 'DELIVERY' ? direccionEntrega : undefined,
              idDistrito: tipoEntrega === 'DELIVERY' ? idDistrito : null,
              total: subtotalGrupo,
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
      const subtotalItems = grupos.reduce((acc, g) => acc + g.total, 0);

      // 1. Prepara el carrito pendiente (NO crea pedidos aún)
      const carritoResp = await pagoService.prepararCarrito(
        Number(usuario.id),
        subtotalItems,
        grupos
      );

      // Actualizar resumen con los valores validados por el backend (fuente de verdad)
      setResumen(prev => ({
        ...prev,
        subtotalSinDescuento: carritoResp.subtotalItems,
        descuentos: 0,
        costoEnvio: carritoResp.costoEntregaTotal,
        total: carritoResp.total,
      }));

      // 2. Crea el PaymentIntent vinculado al carrito pendiente
      const { clientSecret: secret } = await pagoService.crearIntent(carritoResp.carritoPendienteId);
      setClientSecret(secret);

      if (personalizacionId) {
        sessionStorage.setItem('pendingPersonalizacionId', String(personalizacionId));
      }
      // El carrito normal se conserva hasta que Stripe confirme el pago. Vaciarlo
      // aquí hacía perder la compra cuando el pago demoraba, era rechazado o el
      // usuario volvía atrás. PedidoConfirmadoPage lo limpia tras resolver la orden.
      if (!personalizacionId && !cotizacionId) {
        sessionStorage.setItem('pendingCartPayment', 'true');
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

  if (!items.length && !clientSecret && !personalizacionGrupo && !cotizacionGrupo) {
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

              {clientSecret && (
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
                  <StripeCheckoutForm />
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

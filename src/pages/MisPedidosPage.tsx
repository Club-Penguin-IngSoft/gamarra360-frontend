/**
 * Página "Mis Pedidos" — historial de compras del cliente autenticado.
 * Accesible desde MiCuentaPage → Accesos Rápidos → "Mis Pedidos".
 *
 * Diseño basado en el mockup Figma 2682-4477 (tarjetas de pedido).
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Store as StoreIcon,
  Loader2,
  PackageSearch,
  BadgeCheck,
  Clock,
  Truck,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import {
  listarComprasCliente,
  type IPedidoDisplay,
} from '../services/misComprasService';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS } from '../constants/rutas';

/* ── Helpers de presentación ───────────────────────────────────────────── */

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatearNumeroPedido(id: number, iso: string): string {
  const d = new Date(iso);
  const ymd = isNaN(d.getTime())
    ? '00000000'
    : `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `N° PED-${ymd}-${String(id).padStart(6, '0')}`;
}

/* ── Estado del pedido → etiqueta + colores + icono ─────────────────────── */

interface IEstadoInfo {
  texto: string;
  dotColor: string;
  badgeClases: string;
  Icon: React.ElementType;
}

function estadoInfo(pedidoEstado: string, ordenEstado: string): IEstadoInfo {
  // Si la orden no fue pagada mostramos "Pendiente de pago"
  if (ordenEstado === 'PENDIENTE') {
    return {
      texto: 'Pendiente de pago',
      dotColor: 'bg-orange-400',
      badgeClases: 'bg-orange-50 text-orange-600 border border-orange-200',
      Icon: Clock,
    };
  }
  const mapa: Record<string, IEstadoInfo> = {
    PENDIENTE_CONFIRMACION: {
      texto: 'Pendiente de confirmación',
      dotColor: 'bg-orange-400',
      badgeClases: 'bg-orange-50 text-orange-600 border border-orange-200',
      Icon: Clock,
    },
    CONFIRMADO: {
      texto: 'Confirmado',
      dotColor: 'bg-blue-500',
      badgeClases: 'bg-blue-50 text-blue-600 border border-blue-200',
      Icon: BadgeCheck,
    },
    EN_PROCESO: {
      texto: 'En proceso',
      dotColor: 'bg-blue-500',
      badgeClases: 'bg-blue-50 text-blue-600 border border-blue-200',
      Icon: BadgeCheck,
    },
    ENVIADO: {
      texto: 'Enviado',
      dotColor: 'bg-indigo-500',
      badgeClases: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
      Icon: Truck,
    },
    ENTREGADO: {
      texto: 'Entregado',
      dotColor: 'bg-green-500',
      badgeClases: 'bg-green-50 text-green-600 border border-green-200',
      Icon: CheckCircle2,
    },
    CANCELADO: {
      texto: 'Cancelado',
      dotColor: 'bg-red-400',
      badgeClases: 'bg-red-50 text-red-600 border border-red-200',
      Icon: XCircle,
    },
    PAGADO: {
      texto: 'Pagado',
      dotColor: 'bg-green-500',
      badgeClases: 'bg-green-50 text-green-600 border border-green-200',
      Icon: CheckCircle2,
    },
  };
  return (
    mapa[pedidoEstado] ?? {
      texto: pedidoEstado,
      dotColor: 'bg-ink-400',
      badgeClases: 'bg-ink-50 text-ink-600 border border-ink-200',
      Icon: Clock,
    }
  );
}

/* ── Tarjeta de un pedido ─────────────────────────────────────────────── */

function PedidoCard({ pedido }: { pedido: IPedidoDisplay }) {
  const info = estadoInfo(pedido.pedidoEstado, pedido.ordenEstado);
  const esPendientePago = pedido.ordenEstado === 'PENDIENTE';

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      {/* ── Cabecera: fecha + total ── */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-ink-500">
          {formatearFecha(pedido.fecha)}
        </span>
        <span className="text-[16px] font-bold text-ink-900">
          {formatearPrecio(pedido.total)}
        </span>
      </div>

      {/* ── Número de pedido + estado ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-ink-100 px-3 py-1 text-[12px] font-semibold text-ink-700 tracking-wide">
          {formatearNumeroPedido(pedido.pedidoId, pedido.fecha)}
        </span>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${info.badgeClases}`}
        >
          <span className={`h-2 w-2 rounded-full ${info.dotColor}`} />
          {info.texto}
        </span>
      </div>

      {/* ── Detalle del producto ── */}
      <div className="flex items-start gap-4">
        {/* Imagen */}
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-100 bg-surface-muted">
          {pedido.imagenProducto ? (
            <img
              src={pedido.imagenProducto}
              alt={pedido.nombreProducto ?? 'Producto'}
              className="h-full w-full object-cover"
            />
          ) : (
            <ShoppingBag className="h-8 w-8 text-ink-300" />
          )}
        </div>

        {/* Nombre + tienda */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <p className="text-[14px] font-semibold text-ink-900 leading-snug line-clamp-2">
            {pedido.nombreProducto ?? 'Pedido'}
            {pedido.cantidadItems > 1 && (
              <span className="ml-1 font-normal text-ink-500">
                (+{pedido.cantidadItems - 1} producto{pedido.cantidadItems - 1 > 1 ? 's' : ''} más)
              </span>
            )}
          </p>
          {pedido.nombreTienda && (
            <div className="flex items-center gap-1 text-[12px] text-ink-500">
              <StoreIcon className="h-3.5 w-3.5 shrink-0 text-brand-500" />
              <span className="font-semibold uppercase tracking-wide text-brand-600">
                TIENDA
              </span>
              <span className="text-ink-700">{pedido.nombreTienda}</span>
            </div>
          )}
          <span className="text-[12px] text-ink-400 capitalize">
            {pedido.tipoEntrega === 'DELIVERY' ? '🚚 Envío a domicilio' : '🏪 Recojo en tienda'}
          </span>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center justify-end gap-3 pt-1 border-t border-ink-100">
        {esPendientePago && (
          <Link
            to={RUTAS.CHECKOUT}
            className="rounded-lg border border-brand-400 px-5 py-2 text-[14px] font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            Pagar ahora
          </Link>
        )}
        <button
          disabled
          title="Próximamente"
          className="rounded-lg bg-brand-500 px-5 py-2 text-[14px] font-semibold text-white opacity-80 cursor-not-allowed"
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
}

/* ── Estado vacío ──────────────────────────────────────────────────────── */

function SinPedidos() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-16 px-8 text-center shadow-sm border border-ink-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <PackageSearch className="h-8 w-8 text-brand-500" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-[20px] font-bold text-ink-900">
          Aún no tienes pedidos
        </h2>
        <p className="text-[14px] text-ink-500">
          Cuando realices una compra, podrás seguir su estado aquí.
        </p>
      </div>
      <Link
        to={RUTAS.CATALOGO}
        className="mt-2 rounded-lg bg-brand-500 px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}

/* ── Página ─────────────────────────────────────────────────────────────── */

export default function MisPedidosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<IPedidoDisplay[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: solo clientes autenticados
  useEffect(() => {
    if (!usuario) {
      navigate(RUTAS.LOGIN, { replace: true });
    }
  }, [usuario, navigate]);

  // Cargar pedidos
  useEffect(() => {
    if (!usuario) return;
    const clienteId = Number(usuario.id);
    if (isNaN(clienteId)) return;

    setCargando(true);
    setError(null);

    listarComprasCliente(clienteId)
      .then((data) => setPedidos(data))
      .catch(() => setError('No se pudieron cargar tus pedidos. Intenta nuevamente.'))
      .finally(() => setCargando(false));
  }, [usuario]);

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <TopBar active="Inicio" />

      <main className="flex-1 px-4 py-10 md:px-12">
        <div className="mx-auto max-w-3xl flex flex-col gap-6">

          {/* ── Navegación ── */}
          <div className="flex items-center gap-3">
            <Link
              to={RUTAS.CUENTA}
              className="flex items-center gap-1 text-[14px] font-medium text-brand-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Mi Cuenta
            </Link>
            <span className="text-ink-400">/</span>
            <span className="text-[14px] text-ink-500">Mis Pedidos</span>
          </div>

          {/* ── Título ── */}
          <h1 className="text-[32px] font-bold text-ink-900">Mis Pedidos</h1>

          {/* ── Contenido ── */}
          {cargando ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="text-[14px] text-ink-500">Cargando tus pedidos…</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-[14px] text-red-600">
              {error}
            </div>
          ) : pedidos.length === 0 ? (
            <SinPedidos />
          ) : (
            <div className="flex flex-col gap-4">
              {pedidos.map((p) => (
                <PedidoCard key={`${p.ordenPagoId}-${p.pedidoId}`} pedido={p} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStripeStatus } from '../../hooks/useStripeStatus';
import StripeBanner from '../../components/comerciante/StripeBanner';
import { useNavigate } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { RUTAS } from '../../constants/rutas';
import { obtenerMiTienda } from '../../services/tiendaService';
import { useStripeBalance } from '../../hooks/useStripeBalance';
import { useAuth } from '../../hooks';
import { apiClient } from '../../services';

/* ─── Tipos ─────────────────────────────────────────────────────────────── */

interface PedidoPorDia {
  fecha: string;
  cantidad: number;
}

interface ProductoTop {
  idProducto: number;
  nombreProducto: string;
  imagenUrl: string | null;
  unidades: number;
}

interface PedidoResumen {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  clienteId: number;
  nombreCliente: string | null;
  emailCliente: string | null;
}

interface DashboardData {
  pedidosPorDia: PedidoPorDia[];
  productosTopSolicitados: ProductoTop[];
  todosLosProductos: ProductoTop[];
  pedidosRecientes: PedidoResumen[];
  pedidosCompletados: PedidoResumen[];
  totalUnidades: number;
  totalIngresos: number;
}

/* ─── Filtro por rango de fechas ─────────────────────────────────────────── */

function fechaLocalISO(fecha: Date = new Date()): string {
  const offset = fecha.getTimezoneOffset();
  const fechaLocal = new Date(fecha.getTime() - offset * 60_000);
  return fechaLocal.toISOString().slice(0, 10);
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const estadoBadgeClasses: Record<string, string> = {
  ENTREGADO:        'bg-[#D1FAE5] text-[#059669]',
  PENDIENTE:        'bg-[#FEF3C7] text-[#D97706]',
  EN_PROCESO:       'bg-[#DBEAFE] text-[#2563EB]',
  RECIBIDO:         'bg-[#DBEAFE] text-[#2563EB]',
  EN_PREPARACION:   'bg-[#EDE9FE] text-[#7C3AED]',
  EN_CAMINO:        'bg-[#FEF3C7] text-[#D97706]',
  LISTO_PARA_ENTREGA:'bg-[#D1FAE5] text-[#059669]',
  CANCELADO:        'bg-[#FEE2E2] text-[#DC2626]',
};

const estadoLabel: Record<string, string> = {
  ENTREGADO:        'Pagado',
  PENDIENTE:        'Pendiente',
  EN_PROCESO:       'En proceso',
  RECIBIDO:         'Recibido',
  EN_PREPARACION:   'En preparación',
  EN_CAMINO:        'En camino',
  LISTO_PARA_ENTREGA:'Listo para entrega',
  CANCELADO:        'Cancelado',
};

const TOP_COLORS = [
  'bg-primario',
  'bg-[#F97316]',
  'bg-[#8B5CF6]',
  'bg-[#10B981]',
  'bg-[#14B8A6]',
];

function formatFechaLabel(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatRangoLabel(desde: string, hasta: string): string {
  if (!desde || !hasta) return 'Selecciona un rango';

  const opciones: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  const desdeLabel = new Date(desde + 'T00:00:00').toLocaleDateString('es-PE', opciones);
  const hastaLabel = new Date(hasta + 'T00:00:00').toLocaleDateString('es-PE', opciones);

  return desde === hasta ? desdeLabel : `${desdeLabel} - ${hastaLabel}`;
}

/* ─── Componente Pestaña flotante ────────────────────────────────────────── */

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
}

function PestanaFlotante({ titulo, onCerrar, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <div
        className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col pointer-events-auto"
        style={{ border: '1px solid #e5e7eb' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[15px] font-bold text-gray-900">{titulo}</span>
          <button
            onClick={onCerrar}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth={2.5}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Pantalla principal ─────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { stripeCompletado } = useStripeStatus();
  const hoy = fechaLocalISO();
  const [nombreTienda, setNombreTienda] = useState('');
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(false);
  const [stockCritico, setStockCritico] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; valor: number } | null>(null);
  const [pestanaAbierta, setPestanaAbierta] = useState<'completados' | 'recientes' | 'productos' | 'pedidosPorDia' | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const navigate = useNavigate();
  const balance = useStripeBalance();
  const { usuario } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);

  /* Cargar nombre tienda */
  useEffect(() => {
    obtenerMiTienda().then((t) => setNombreTienda(t.nombreComercial)).catch(() => {});
  }, []);

  /* Cargar stock total */
  useEffect(() => {
    obtenerMiTienda()
      .then(({ idTienda }) =>
        apiClient.get<any[]>(`/productos/tienda/${idTienda}`)
      )
      .then(({ data: productos }) => {
        const totalStock = productos.reduce((total: number, p: any) => {
          const stock = (p.variantes ?? []).reduce((s: number, v: any) => s + (v.stock ?? 0), 0);
          return total + stock;
        }, 0);
        setStockCritico(totalStock);
      })
      .catch(() => {});
  }, []);

  /* Cargar dashboard data */
  const cargarDashboard = useCallback(async () => {
    if (!desde || !hasta) return;

    setCargando(true);
    try {
      const { data: res } = await apiClient.get<DashboardData>(
        `/pedidos/comerciante/dashboard?desde=${desde}&hasta=${hasta}`
      );
      setData(res);
    } catch {
      setData(null);
    } finally {
      setCargando(false);
    }
  }, [desde, hasta]);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  /* Filtrar pedidos por fecha seleccionada */
  const pedidosPorFecha = (fecha: string) => {
    if (!data?.pedidosRecientes) return [];
    return data.pedidosRecientes.filter((p) => {
      if (!p.fecha) return false;
      const pedidoFecha = new Date(p.fecha).toISOString().slice(0, 10);
      return pedidoFecha === fecha;
    });
  };

  const handleClickBarra = (fecha: string) => {
    setFechaSeleccionada(fecha);
    setPestanaAbierta('pedidosPorDia');
  };

  /* Stripe */
  const handleIrAStripe = async () => {
    try {
      const { data: d } = await apiClient.get(`/comerciantes/${usuario?.id}/stripe/dashboard`);
      window.open(d.url, '_blank');
    } catch { }
  };

  /* Gráfica */
  const chartData = data?.pedidosPorDia ?? [];
  const maxValor = Math.max(...chartData.map((d) => d.cantidad), 1);

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="flex-1 bg-gray-100 min-h-screen p-7">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-1">Panel de Control</h1>
            <p className="text-[13px] text-gray-500">
              Bienvenido de vuelta,{' '}
              <span className="text-[17px] font-bold text-primario">{nombreTienda}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleIrAStripe}
              className="flex items-center gap-1.5 px-[18px] py-2.5 border border-primario text-primario rounded-lg text-[13px] font-semibold hover:bg-primario hover:text-white transition-colors whitespace-nowrap"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Gestionar pagos
            </button>
            <button
              className="flex items-center gap-1.5 px-[18px] py-2.5 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors whitespace-nowrap"
              onClick={() => navigate(RUTAS.COMERCIANTE_NUEVO_PRODUCTO)}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Publicar Producto
            </button>
          </div>
        </div>

        <StripeBanner yaCompletado={stripeCompletado} />

        {/* ── Stats: 2 cards ── */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Balance — clickeable */}
          <button
            onClick={handleIrAStripe}
            className="bg-white rounded-xl px-[22px] py-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-500 mb-2 cursor-pointer">
                Balance Disponible
              </label>
              <span className="text-[28px] font-bold text-gray-900">
                {balance
                  ? `${balance.moneda.toUpperCase()} ${(balance.disponible / 100).toFixed(2)}`
                  : 'USD 0.00'}
              </span>
              <span className="block text-[11px] text-gray-400 mt-1">
                Pendiente: {balance ? `${(balance.pendiente / 100).toFixed(2)}` : '0.00'}
              </span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-primario-claro text-primario flex items-center justify-center">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </button>

          {/* Stock */}
          <button
            onClick={() => navigate(RUTAS.COMERCIANTE_CATALOGO)}
            className="bg-white rounded-xl px-[22px] py-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer text-left w-full"
          >
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-500 mb-2">
                En/De Stock
              </label>
              <span className="text-[28px] font-bold text-gray-900">{stockCritico}</span>
              <span className="block text-[11px] text-gray-400 mt-1">productos en stock</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
          </button>
        </div>
        {/* ── Filtro por rango de fechas ── */}
        <div className="bg-white rounded-xl px-[22px] py-4 shadow-sm mb-6 mt-1 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 mb-1 font-medium">Desde</span>
            <input
              type="date"
              value={desde}
              max={hasta || hoy}
              onChange={(e) => {
                const nuevaFecha = e.target.value;
                setDesde(nuevaFecha);
                if (hasta && nuevaFecha > hasta) {
                  setHasta(nuevaFecha);
                }
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-700 focus:outline-none focus:border-primario"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 mb-1 font-medium">Hasta</span>
            <input
              type="date"
              value={hasta}
              min={desde}
              max={hoy}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-700 focus:outline-none focus:border-primario"
            />
          </div>

          <button
            onClick={cargarDashboard}
            className="px-4 py-2 rounded-lg bg-primario text-white text-[12px] font-semibold hover:bg-primario-hover transition-colors"
          >
            Aplicar
          </button>

          <span className="text-[11px] text-gray-400 ml-auto">
            Rango: {formatRangoLabel(desde, hasta)}
          </span>
        </div>

        {/* ── Mid row: Gráfica + Pedidos recientes ── */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          {/* Gráfica de pedidos por día */}
          <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-gray-900">Fecha por Cantidad de Pedidos</span>
              <span className="text-[11px] text-gray-400">
                {formatRangoLabel(desde, hasta)}
              </span>
            </div>

            {cargando ? (
              <div className="h-[250px] flex items-center justify-center text-[12px] text-gray-400">Cargando…</div>
            ) : chartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-[12px] text-gray-400">Sin datos en este período</div>
            ) : (
              <div className="relative" ref={chartRef}>
                {/* Gráfico */}
                <div className="bg-gray-50 rounded-lg p-4 mb-2">
                  {/* Eje Y labels */}
                  <div className="flex gap-[1px] items-end h-[220px] relative">
                    {chartData.map((d, i) => {
                      const heightPct = maxValor > 0 ? (d.cantidad / maxValor) * 100 : 0;
                      const isActive = i === chartData.length - 1;
                      return (
                        <div key={d.fecha} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          {/* Tooltip */}
                          <div
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                            style={{ bottom: `calc(${heightPct}% + 12px)` }}
                          >
                            {d.cantidad} {d.cantidad === 1 ? 'pedido' : 'pedidos'}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                          {/* Barra */}
                          <div
                            onClick={() => handleClickBarra(d.fecha)}
                            className={`w-full rounded-t-md transition-all cursor-pointer group-hover:shadow-lg ${
                              isActive ? 'bg-primario shadow-md' : 'bg-primario-claro hover:bg-primario'
                            }`}
                            style={{ 
                              height: `${Math.max(heightPct, 8)}%`,
                              minHeight: '8px',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Etiquetas del eje X */}
                  <div className="flex gap-[1px] mt-2">
                    {chartData.map((d, i) => {
                      const label = formatFechaLabel(d.fecha);
                      // Mostrar solo algunos labels si hay muchos
                      const mostrar = chartData.length <= 14 || i % Math.ceil(chartData.length / 10) === 0 || i === chartData.length - 1;
                      return (
                        <span key={d.fecha} className="flex-1 text-center text-[9px] text-gray-500 font-medium">
                          {mostrar ? label : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Leyenda */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span className="inline-block w-3 h-3 rounded-full bg-primario" /> Pedidos
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span className="inline-block w-3 h-3 rounded-full bg-primario-claro" /> Período anterior
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pedidos Recientes */}
          <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-gray-900">Pedidos Recientes</span>
              <button
                className="text-[12px] text-primario font-medium hover:underline"
                onClick={() => setPestanaAbierta('recientes')}
              >
                Ver todos
              </button>
            </div>
            {cargando ? (
              <div className="text-[12px] text-gray-400 py-6 text-center">Cargando…</div>
            ) : (data?.pedidosRecientes ?? []).length === 0 ? (
              <div className="text-[12px] text-gray-400 py-6 text-center">Sin pedidos en este período</div>
            ) : (
              <div className="space-y-2.5">
                {(data?.pedidosRecientes ?? []).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`${RUTAS.COMERCIANTE_PEDIDOS}/${p.id}`)}
                    className="w-full flex items-center justify-between py-1.5 border-b border-gray-50 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}>
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                        </svg>
                      </div>
                      <div>
                        <span className="block text-[12px] font-semibold text-gray-900">
                          N° PED-{p.fecha ? new Date(p.fecha).toISOString().slice(0, 10).replace(/-/g, '') : '00000000'}-{String(p.id).padStart(6, '0')}
                        </span>
                        <span className="text-[11px] text-gray-400">{p.nombreCliente ?? p.emailCliente ?? '—'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[12px] font-semibold text-gray-900">
                        S/ {(p.total ?? 0).toFixed(2)}
                      </span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${estadoBadgeClasses[p.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                        {estadoLabel[p.estado] ?? p.estado}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Pedidos Completados ── */}
        <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[14px] font-bold text-gray-900">Pedidos Completados</span>
              <span className="ml-2 text-[12px] text-gray-400">{(data?.pedidosCompletados ?? []).length} pedidos · {formatRangoLabel(desde, hasta)}</span>
            </div>
            <button
              className="text-[12px] text-primario font-medium hover:underline"
              onClick={() => setPestanaAbierta('completados')}
            >
              Ver todos
            </button>
          </div>

          {cargando ? (
            <div className="text-[12px] text-gray-400 py-4 text-center">Cargando…</div>
          ) : (data?.pedidosCompletados ?? []).length === 0 ? (
            <div className="text-[12px] text-gray-400 py-4 text-center">Sin pedidos completados en este período</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['PEDIDO','CLIENTE','TOTAL','ESTADO','FECHA'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.4px] pb-2 border-b border-gray-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.pedidosCompletados ?? []).slice(0, 4).map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 text-[12px] font-semibold text-gray-900 border-b border-gray-50">
                      #{String(p.id).padStart(4, '0')}
                    </td>
                    <td className="py-2.5 text-[12px] text-gray-700 border-b border-gray-50">
                      {p.nombreCliente ?? p.emailCliente ?? '—'}
                    </td>
                    <td className="py-2.5 text-[12px] font-semibold text-gray-900 border-b border-gray-50">
                      S/ {(p.total ?? 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 border-b border-gray-50">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#D1FAE5] text-[#059669]">
                        Pagado
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] text-gray-400 border-b border-gray-50">
                      {p.fecha ? new Date(p.fecha).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Productos más solicitados ── */}
        <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[14px] font-bold text-gray-900">Productos más solicitados</span>
              <p className="text-[11px] text-gray-400 mt-1">
                {formatRangoLabel(desde, hasta)}
              </p>
            </div>
            <button
              className="text-[12px] text-primario font-medium hover:underline"
              onClick={() => setPestanaAbierta('productos')}
            >
              Ver todos
            </button>
          </div>

          {cargando ? (
            <div className="text-[12px] text-gray-400 py-4 text-center">Cargando…</div>
          ) : (data?.productosTopSolicitados ?? []).length === 0 ? (
            <div className="text-[12px] text-gray-400 py-4 text-center">Sin datos en este período</div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {(data?.productosTopSolicitados ?? []).map((p, i) => {
                  const maxU = data!.productosTopSolicitados[0]?.unidades ?? 1;
                  const pct = (p.unidades / maxU) * 100;
                  return (
                    <div key={p.idProducto} className="flex items-center gap-3">
                      <span className="w-4 text-[12px] text-gray-400 text-right flex-shrink-0 font-semibold">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-medium text-gray-900 truncate pr-2">{p.nombreProducto}</span>
                          <span className="text-[12px] text-gray-500 flex-shrink-0">{p.unidades} u.</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${TOP_COLORS[i] ?? 'bg-gray-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Línea divisoria */}
              <div className="border-t border-gray-100 my-4" />

              {/* Totales destacados */}
              <div className="bg-gradient-to-r from-primario-claro to-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-gray-600">Total unidades vendidas</span>
                  <span className="text-[16px] font-bold text-gray-900">{data?.totalUnidades ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-gray-600">Total ingresos</span>
                  <span className="text-[16px] font-bold text-primario">S/ {(data?.totalIngresos ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        
      </main>

      {/* ── Pestañas flotantes ── */}
      {pestanaAbierta === 'completados' && (
        <PestanaFlotante titulo="Pedidos Completados" onCerrar={() => setPestanaAbierta(null)}>
          {(data?.pedidosCompletados ?? []).length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-8">Sin pedidos completados en este período.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Pedido','Cliente','Total','Fecha'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-[0.4px] pb-2 border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.pedidosCompletados ?? []).map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 text-[12px] font-semibold text-gray-900 border-b border-gray-50">N° PED-{p.fecha ? new Date(p.fecha).toISOString().slice(0, 10).replace(/-/g, '') : '00000000'}-{String(p.id).padStart(6, '0')}</td>
                    <td className="py-2.5 text-[12px] text-gray-700 border-b border-gray-50">{p.nombreCliente ?? '—'}</td>
                    <td className="py-2.5 text-[12px] font-semibold text-gray-900 border-b border-gray-50">S/ {(p.total??0).toFixed(2)}</td>
                    <td className="py-2.5 text-[11px] text-gray-400 border-b border-gray-50">
                      {p.fecha ? new Date(p.fecha).toLocaleDateString('es-PE') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PestanaFlotante>
      )}

      {pestanaAbierta === 'recientes' && (
        <PestanaFlotante titulo="Pedidos Recientes" onCerrar={() => setPestanaAbierta(null)}>
          {(data?.pedidosRecientes ?? []).length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-8">Sin pedidos en este período.</p>
          ) : (
            <div className="space-y-3">
              {(data?.pedidosRecientes ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <div>
                    <span className="block text-[13px] font-bold text-gray-900">N° PED-{p.fecha ? new Date(p.fecha).toISOString().slice(0, 10).replace(/-/g, '') : '00000000'}-{String(p.id).padStart(6, '0')}</span>
                    <span className="text-[11px] text-gray-400">{p.nombreCliente ?? p.emailCliente ?? '—'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[13px] font-semibold text-gray-900">S/ {(p.total??0).toFixed(2)}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${estadoBadgeClasses[p.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                      {estadoLabel[p.estado] ?? p.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PestanaFlotante>
      )}

      {pestanaAbierta === 'productos' && (
        <PestanaFlotante titulo="Productos más solicitados" onCerrar={() => setPestanaAbierta(null)}>
          {(data?.todosLosProductos ?? []).length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-8">Sin datos en este período.</p>
          ) : (
            <div className="space-y-4">
              {(data?.todosLosProductos ?? []).map((p, i) => {
                const maxU = data!.todosLosProductos[0]?.unidades ?? 1;
                return (
                  <div key={p.idProducto} className="flex items-center gap-3">
                    <span className="w-5 text-[12px] text-gray-400 text-right font-semibold">{i+1}</span>
                    {p.imagenUrl ? (
                      <img src={p.imagenUrl} className="w-9 h-9 rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded bg-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-medium text-gray-900">{p.nombreProducto}</span>
                        <span className="text-[12px] text-gray-500">{p.unidades} u.</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${TOP_COLORS[i % TOP_COLORS.length] ?? 'bg-gray-400'}`}
                          style={{ width: `${(p.unidades/maxU)*100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PestanaFlotante>
      )}

      {pestanaAbierta === 'pedidosPorDia' && fechaSeleccionada && (
        <PestanaFlotante 
          titulo={`Pedidos - ${new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} 
          onCerrar={() => {
            setPestanaAbierta(null);
            setFechaSeleccionada(null);
          }}
        >
          {pedidosPorFecha(fechaSeleccionada).length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-8">Sin pedidos en esta fecha.</p>
          ) : (
            <div className="space-y-3">
              {pedidosPorFecha(fechaSeleccionada).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`${RUTAS.COMERCIANTE_PEDIDOS}/${p.id}`)}
                  className="w-full flex items-center justify-between py-3 border-b border-gray-50 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}>
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[13px] font-semibold text-gray-900">
                        N° PED-{p.fecha ? new Date(p.fecha).toISOString().slice(0, 10).replace(/-/g, '') : '00000000'}-{String(p.id).padStart(6, '0')}
                      </span>
                      <span className="text-[11px] text-gray-400">{p.nombreCliente ?? p.emailCliente ?? '—'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[13px] font-semibold text-gray-900">S/ {(p.total??0).toFixed(2)}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${estadoBadgeClasses[p.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                      {estadoLabel[p.estado] ?? p.estado}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </PestanaFlotante>
      )}
    </div>
  );
}

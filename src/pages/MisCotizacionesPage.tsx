import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import { cotizacionService } from '../services/cotizacionService';
import { RUTAS } from '../constants/rutas';
import { ESTADO_PEDIDO_INFO } from '../utils/pedidoUi';
import type { ICotizacionResumen, EstadoPedido } from '../types/IPedido';

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  RESPONDIDA:  'Respondida',
  ACEPTADA:    'Aceptada',
  RECHAZADA:   'Cancelada',
};

const ESTADO_CLASES: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800',
  RESPONDIDA: 'bg-blue-100 text-blue-800',
  ACEPTADA:   'bg-green-100 text-green-800',
  RECHAZADA:  'bg-red-100 text-red-800',
};

export default function MisCotizacionesPage() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<ICotizacionResumen[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [tab, setTab]                   = useState<'TODAS' | 'PENDIENTE' | 'RESPONDIDA' | 'ACEPTADA' | 'RECHAZADA'>('TODAS');

  useEffect(() => {
    let activo = true;
    cotizacionService.listarMisCotizaciones()
      .then((data) => { if (activo) setCotizaciones(data); })
      .catch(() => { if (activo) setError('No se pudieron cargar tus cotizaciones. Inténtalo más tarde.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const visibles = tab === 'TODAS' ? cotizaciones : cotizaciones.filter((c) => c.estado === tab);

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Cotizaciones" />
      <main className="flex-1 px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-8">
          <h1 className="text-h3 font-bold text-ink-900">Mi Cuenta</h1>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <CuentaSidebar />
            <div className="flex flex-1 flex-col gap-6 lg:max-w-[1000px]">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-h5 font-semibold text-ink-900">Mis Cotizaciones</h2>
                <button
                  type="button"
                  onClick={() => navigate(RUTAS.COTIZACIONES)}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  <Plus className="h-4 w-4" />
                  Nueva cotización
                </button>
              </div>

              {/* Tabs de estado */}
              <div className="flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm">
                {(['TODAS', 'PENDIENTE', 'RESPONDIDA', 'ACEPTADA', 'RECHAZADA'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      tab === t ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-800'
                    }`}
                  >
                    {t === 'TODAS' ? 'Todas' : ESTADO_LABELS[t]}
                  </button>
                ))}
              </div>

              {/* Loading */}
              {cargando && (
                <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
                  <p className="text-body-md">Cargando cotizaciones...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-body-md text-error">
                  {error}
                </div>
              )}

              {/* Vacío */}
              {!cargando && !error && cotizaciones.length === 0 && (
                <div className="flex flex-col items-center gap-5 rounded-xl bg-white py-24 text-center">
                  <FileText className="h-16 w-16 text-ink-200" />
                  <div>
                    <p className="text-title1 font-semibold text-ink-900">Aún no tienes cotizaciones</p>
                    <p className="mt-1 text-body-md text-ink-500">
                      Solicita una cotización a cualquier tienda de Gamarra.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(RUTAS.COTIZACIONES)}
                    className="mt-2 rounded-lg bg-brand-500 px-6 py-3 text-label-lg font-semibold text-white hover:bg-brand-600"
                  >
                    Solicitar cotización
                  </button>
                </div>
              )}

              {/* Sin resultados en tab */}
              {!cargando && !error && cotizaciones.length > 0 && visibles.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-16 text-center">
                  <p className="text-title1 font-semibold text-ink-900">No hay cotizaciones en esta categoría</p>
                  <p className="text-body-md text-ink-500">Prueba con otra pestaña.</p>
                </div>
              )}

              {/* Lista */}
              {!cargando && !error && visibles.length > 0 && (
                <div className="flex flex-col gap-4">
                  {visibles.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => navigate(RUTAS.DETALLE_COTIZACION(c.id))}
                      className="flex items-center gap-4 rounded-xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      {c.fotoTienda ? (
                        <img src={c.fotoTienda} alt="" className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xl font-bold text-brand-600">
                          {(c.nombreTienda ?? 'T').charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink-900 truncate">{c.nombreTienda ?? `Tienda #${c.idTienda}`}</p>
                        <p className="mt-0.5 text-sm text-ink-500">
                          {c.cantidadProductos} {c.cantidadProductos === 1 ? 'producto' : 'productos'} ·{' '}
                          {new Date(c.fechaCreacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {c.precioPropuesto != null && (
                          <p className="mt-1 text-sm font-medium text-ink-700">
                            Propuesta: S/.{c.precioPropuesto.toFixed(2)}
                          </p>
                        )}
                        {c.pedidoEstado != null && ESTADO_PEDIDO_INFO[c.pedidoEstado as EstadoPedido] && (
                          <span className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${ESTADO_PEDIDO_INFO[c.pedidoEstado as EstadoPedido].className}`}>
                            Pedido: {ESTADO_PEDIDO_INFO[c.pedidoEstado as EstadoPedido].label}
                          </span>
                        )}
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_CLASES[c.estado] ?? 'bg-ink-100 text-ink-600'}`}>
                        {ESTADO_LABELS[c.estado] ?? c.estado}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

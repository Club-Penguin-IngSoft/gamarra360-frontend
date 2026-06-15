import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { cotizacionService } from '../../services/cotizacionService';
import { RUTAS } from '../../constants/rutas';
import type { ICotizacionResumen } from '../../types/IPedido';

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  RESPONDIDA: 'Respondida',
  ACEPTADA:   'Aceptada',
  RECHAZADA:  'Cancelada',
};

const ESTADO_CLASES: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800',
  RESPONDIDA: 'bg-blue-100 text-blue-800',
  ACEPTADA:   'bg-green-100 text-green-800',
  RECHAZADA:  'bg-red-100 text-red-800',
};

export default function CotizacionesComerciantePage() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<ICotizacionResumen[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [tab, setTab]                   = useState<'TODAS' | 'PENDIENTE' | 'RESPONDIDA' | 'ACEPTADA' | 'RECHAZADA'>('TODAS');

  useEffect(() => {
    let activo = true;
    cotizacionService.listarCotizacionesComerciante()
      .then((data) => { if (activo) setCotizaciones(data); })
      .catch(() => { if (activo) setError('No se pudieron cargar las cotizaciones.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const visibles = tab === 'TODAS' ? cotizaciones : cotizaciones.filter((c) => c.estado === tab);
  const pendientes = cotizaciones.filter((c) => c.estado === 'PENDIENTE').length;

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <ComercianteSidebar />
      <main className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-[900px]">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Cotizaciones</h1>
              {pendientes > 0 && (
                <p className="mt-0.5 text-sm text-ink-500">
                  {pendientes} {pendientes === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'} de respuesta
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm">
            {(['TODAS', 'PENDIENTE', 'RESPONDIDA', 'ACEPTADA', 'RECHAZADA'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-800'
                }`}
              >
                {t === 'TODAS' ? 'Todas' : ESTADO_LABELS[t]}
                {t === 'PENDIENTE' && pendientes > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    tab === 'PENDIENTE' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pendientes}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {cargando && (
            <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
              <p className="text-sm">Cargando cotizaciones...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div>
          )}

          {/* Vacío */}
          {!cargando && !error && cotizaciones.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-xl bg-white py-24 text-center">
              <FileText className="h-16 w-16 text-ink-200" />
              <p className="font-semibold text-ink-900">Aún no tienes cotizaciones</p>
              <p className="text-sm text-ink-500">Las solicitudes de cotización de tus clientes aparecerán aquí.</p>
            </div>
          )}

          {/* Sin resultados */}
          {!cargando && !error && cotizaciones.length > 0 && visibles.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-16 text-center">
              <p className="font-semibold text-ink-900">No hay cotizaciones en esta categoría</p>
              <p className="text-sm text-ink-500">Prueba con otra pestaña.</p>
            </div>
          )}

          {/* Lista */}
          {!cargando && !error && visibles.length > 0 && (
            <div className="flex flex-col gap-3">
              {visibles.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(RUTAS.COMERCIANTE_COTIZACION_DETALLE(c.id))}
                  className="flex items-center gap-4 rounded-xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-900">
                        {c.nombreCliente ? `Cliente: ${c.nombreCliente}` : `Cotización #${c.id}`}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {c.cantidadProductos} {c.cantidadProductos === 1 ? 'producto' : 'productos'} ·{' '}
                      {new Date(c.fechaCreacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {c.precioPropuesto != null && (
                      <p className="mt-1 text-sm font-medium text-ink-600">
                        Tu propuesta: S/.{c.precioPropuesto.toFixed(2)}
                      </p>
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
      </main>
    </div>
  );
}

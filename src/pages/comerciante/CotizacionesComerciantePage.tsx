import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { cotizacionService } from '../../services/cotizacionService';
import { RUTAS } from '../../constants/rutas';
import { formatearFecha } from '../../utils/pedidoUi';
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

const TABS = ['TODAS', 'PENDIENTE', 'RESPONDIDA', 'ACEPTADA', 'RECHAZADA'] as const;
type Tab = typeof TABS[number];

const PAGE_SIZE = 10;

function generarCodigoCotizacion(fechaIso: string, id: number): string {
  const fecha = new Date(fechaIso);
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `COT-${yyyy}${mm}${dd}-${String(id).padStart(6, '0')}`;
}

function obtenerIniciales(nombre: string | null | undefined): string {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

export default function CotizacionesComerciantePage() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<ICotizacionResumen[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [tab, setTab]                   = useState<Tab>('TODAS');
  const [busqueda, setBusqueda]         = useState('');
  const [pagina, setPagina]             = useState(1);

  useEffect(() => {
    let activo = true;
    cotizacionService.listarCotizacionesComerciante()
      .then((data) => { if (activo) setCotizaciones(data); })
      .catch(() => { if (activo) setError('No se pudieron cargar las cotizaciones.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const pendientes = cotizaciones.filter((c) => c.estado === 'PENDIENTE').length;

  const filtradas = useMemo(() => {
    const busquedaNorm = busqueda.trim().toLowerCase();
    return cotizaciones.filter((c) => {
      if (tab !== 'TODAS' && c.estado !== tab) return false;
      if (!busquedaNorm) return true;
      const codigo = generarCodigoCotizacion(c.fechaCreacion, c.id).toLowerCase();
      const nombre = (c.nombreCliente ?? '').toLowerCase();
      return codigo.includes(busquedaNorm) || nombre.includes(busquedaNorm);
    });
  }, [cotizaciones, busqueda, tab]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const numeroPaginas = () => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= 1) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="min-w-0 flex-1 bg-gray-100 px-4 py-16 sm:px-6 lg:p-7">
        <p className="text-[12px] text-gray-500 mb-2">
          Inicio &rsaquo; <span className="text-primario font-medium">Cotizaciones</span>
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-bold text-gray-900">Tablero de Cotización</h1>
        </div>

        {/* Tabs + búsqueda */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setPagina(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                  tab === t ? 'bg-primario text-white' : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
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

          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="w-full h-10 border border-gray-300 rounded-lg pl-9 pr-3.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
              placeholder="Buscar por código de cotización o cliente..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
              Cargando cotizaciones...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-error">
              {error}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
              {cotizaciones.length === 0 ? 'Aún no tienes cotizaciones.' : 'Sin resultados para los filtros aplicados.'}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Id Cotización', 'Cliente', 'Fecha', 'Tu Propuesta', 'Estado', 'Acción'].map((col) => (
                    <th
                      key={col}
                      className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] px-4 py-3 bg-gray-100 border-b border-gray-200"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginadas.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3.5 text-[13px] font-medium text-gray-900 border-b border-gray-100 align-middle">
                      {generarCodigoCotizacion(c.fechaCreacion, c.id)}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primario-claro text-primario flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
                          {obtenerIniciales(c.nombreCliente)}
                        </div>
                        <span className="text-[13px] font-semibold text-gray-900">
                          {c.nombreCliente ?? `Cliente #${c.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      {formatearFecha(c.fechaCreacion)}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      {c.precioPropuesto != null ? `S/.${c.precioPropuesto.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${ESTADO_CLASES[c.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                        {ESTADO_LABELS[c.estado] ?? c.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-gray-300 text-gray-600 hover:bg-primario-claro hover:text-primario hover:border-primario transition-colors"
                        onClick={() => navigate(RUTAS.COMERCIANTE_COTIZACION_DETALLE(c.id))}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {!cargando && !error && filtradas.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-200">
              <span className="text-[12px] text-gray-500">
                Mostrando {(paginaActual - 1) * PAGE_SIZE + 1}–{Math.min(paginaActual * PAGE_SIZE, filtradas.length)} de {filtradas.length} cotizaciones
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPagina((p) => p - 1)}
                  className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ‹
                </button>
                {numeroPaginas().map((n) => (
                  <button
                    key={n}
                    onClick={() => setPagina(n)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border transition-colors ${
                      n === paginaActual
                        ? 'bg-primario text-white border-primario'
                        : 'text-gray-600 bg-transparent border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                  className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

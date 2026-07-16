import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { RUTAS } from '../../constants/rutas';
import { personalizacionService } from '../../services/personalizacionService';
import type { IPersonalizacionComercianteResumen } from '../../types/IPersonalizacion';
import {
  formatearFecha,
  generarCodigoPersonalizacion,
  getBadgeInfo,
  personalizacionCoincideConTab,
  type TabPersonalizaciones,
} from '../../utils/personalizacionUi';

const PAGE_SIZE = 10;

const TABS: { key: TabPersonalizaciones; label: string }[] = [
  { key: 'TODAS', label: 'Todos' },
  { key: 'EN_PROGRESO', label: 'En Progreso' },
  { key: 'FINALIZADOS', label: 'Finalizados' },
];

function obtenerIniciales(nombre: string | null): string {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

export default function TableroDePersonalizacionesPage() {
  const navigate = useNavigate();

  const [personalizaciones, setPersonalizaciones] = useState<IPersonalizacionComercianteResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState<TabPersonalizaciones>('TODAS');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setCargando(true);
    personalizacionService
      .listarPersonalizacionesComerciante()
      .then(setPersonalizaciones)
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const filtrados = useMemo(() => {
    const busquedaNorm = busqueda.trim().toLowerCase();
    return personalizaciones.filter((p) => {
      if (!personalizacionCoincideConTab(p.estado, p.pedidoEstado, tab)) return false;
      if (!busquedaNorm) return true;
      const codigo = generarCodigoPersonalizacion(p.fechaCreacion, p.id).toLowerCase();
      const nombre = (p.nombreCliente ?? '').toLowerCase();
      const email = (p.emailCliente ?? '').toLowerCase();
      return codigo.includes(busquedaNorm) || nombre.includes(busquedaNorm) || email.includes(busquedaNorm);
    });
  }, [personalizaciones, busqueda, tab]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

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

      <main className="flex-1 bg-gray-100 p-7">
        <p className="text-[12px] text-gray-500 mb-2">
          Inicio &rsaquo; <span className="text-primario font-medium">Personalizaciones</span>
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-bold text-gray-900">Tablero de Personalización</h1>
        </div>

        {/* Tabs + búsqueda */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setPagina(1);
                }}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                  tab === t.key
                    ? 'bg-primario text-white'
                    : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                }`}
              >
                {t.label}
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
              placeholder="Buscar por código de solicitud o cliente..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
              Cargando solicitudes...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
              {personalizaciones.length === 0 ? 'No tienes solicitudes de personalización aún.' : 'Sin resultados para los filtros aplicados.'}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Id Solicitud', 'Cliente', 'Fecha', 'Estado', 'Acción'].map((col) => (
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
                {paginados.map((p) => {
                  const badge = getBadgeInfo(p.estado, p.pedidoEstado);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-4 py-3.5 text-[13px] font-medium text-gray-900 border-b border-gray-100 align-middle">
                        {generarCodigoPersonalizacion(p.fechaCreacion, p.id)}
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primario-claro text-primario flex items-center justify-center text-[12px] font-semibold flex-shrink-0">
                            {obtenerIniciales(p.nombreCliente)}
                          </div>
                          <div>
                            <span className="block text-[13px] font-semibold text-gray-900 mb-0.5">
                              {p.nombreCliente ?? `Cliente #${p.clienteId}`}
                            </span>
                            <span className="text-[11px] text-gray-500">{p.emailCliente ?? '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                        {formatearFecha(p.fechaCreacion)}
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                        <button
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-gray-300 text-gray-600 hover:bg-primario-claro hover:text-primario hover:border-primario transition-colors"
                          onClick={() => navigate(RUTAS.COMERCIANTE_PERSONALIZACION_DETALLE(p.id))}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {!cargando && filtrados.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-200">
              <span className="text-[12px] text-gray-500">
                Mostrando {(paginaActual - 1) * PAGE_SIZE + 1}–{Math.min(paginaActual * PAGE_SIZE, filtrados.length)} de {filtrados.length} solicitudes
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

import { useState, useEffect, useMemo } from 'react';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import ModalCrearOferta from '../../components/comerciante/ModalCrearOferta';
import ConfirmDialog from '../../components/comerciante/ConfirmDialog';
import { PauseCircle, PlayCircle } from 'lucide-react';
import { listarOfertas, eliminarOferta, toggleEstadoOferta } from '../../services/ofertaService';
import type { IOferta, EstadoOferta } from '../../types/IOferta';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatFecha(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d} ${MESES[Number(m) - 1]}, ${y}`;
}

function formatDescuento(o: IOferta): string {
  return o.tipoDescuento === 'PORCENTAJE'
    ? `-${o.valorDescuento}%`
    : `-S/ ${o.valorDescuento.toFixed(2)}`;
}

const ESTADO_LABEL: Record<EstadoOferta, string> = {
  ACTIVO: 'Activo',
  PROGRAMADO: 'Programado',
  FINALIZADO: 'Finalizado',
  PAUSADO: 'Pausado',
};

const ESTADO_BADGE: Record<EstadoOferta, string> = {
  ACTIVO: 'bg-[#D1FAE5] text-[#059669]',
  PROGRAMADO: 'bg-[#DBEAFE] text-[#2563EB]',
  FINALIZADO: 'bg-[#FEE2E2] text-[#DC2626]',
  PAUSADO: 'bg-[#FEF3C7] text-[#D97706]',
};

const PAGE_SIZE = 8;

/* ── KPI Card ────────────────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[13px] text-gray-500 mb-1">{label}</p>
        <p className="text-[30px] font-bold text-gray-900 leading-tight">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function PromocionesPage() {
  const [ofertas, setOfertas] = useState<IOferta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [ofertaEditar, setOfertaEditar] = useState<IOferta | null>(null);
  const [notif, setNotif] = useState<{ msg: string; ok: boolean } | null>(null);
  const [ofertaAEliminar, setOfertaAEliminar] = useState<IOferta | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarOfertas = () => {
    setCargando(true);
    listarOfertas()
      .then(setOfertas)
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarOfertas(); }, []);

  const mostrarNotif = (msg: string, ok = true) => {
    setNotif({ msg, ok });
    setTimeout(() => setNotif(null), 3500);
  };

  const handleNuevaOferta = () => {
    setOfertaEditar(null);
    setModalOpen(true);
  };

  const handleEditar = (o: IOferta) => {
    setOfertaEditar(o);
    setModalOpen(true);
  };

  const handleToggle = async (o: IOferta) => {
    try {
      const actualizado = await toggleEstadoOferta(o.idOferta);
      setOfertas((prev) => prev.map((x) => (x.idOferta === actualizado.idOferta ? actualizado : x)));
      mostrarNotif(
        actualizado.estado === 'PAUSADO'
          ? 'Oferta pausada correctamente.'
          : 'Oferta reactivada correctamente.',
      );
    } catch {
      mostrarNotif('No se pudo cambiar el estado de la oferta.', false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!ofertaAEliminar) return;
    setEliminando(true);
    try {
      await eliminarOferta(ofertaAEliminar.idOferta);
      setOfertas((prev) => prev.filter((o) => o.idOferta !== ofertaAEliminar.idOferta));
      mostrarNotif('Oferta eliminada correctamente.');
      setOfertaAEliminar(null);
    } catch {
      mostrarNotif('No se pudo eliminar la oferta.', false);
    } finally {
      setEliminando(false);
    }
  };

  const handleSuccess = () => {
    cargarOfertas();
    mostrarNotif('Oferta guardada exitosamente.');
  };

  /* Filtrado client-side */
  const filtradas = useMemo(() => {
    const q = busqueda.toLowerCase();
    return ofertas.filter((o) => {
      const coincideBusqueda = o.titulo.toLowerCase().includes(q);
      const coincideEstado = !filtroEstado || o.estado === filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }, [ofertas, busqueda, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const stats = useMemo(() => ({
    activas: ofertas.filter((o) => o.estado === 'ACTIVO').length,
    programadas: ofertas.filter((o) => o.estado === 'PROGRAMADO').length,
    total: ofertas.length,
  }), [ofertas]);

  /* Páginas a mostrar en el paginador */
  const paginas = useMemo(() => {
    const ps: number[] = [];
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= 1) ps.push(i);
    }
    return ps;
  }, [totalPaginas, paginaActual]);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="min-w-0 flex-1 bg-gray-100 px-4 py-16 sm:px-6 lg:p-7">
        {/* Notificación flotante */}
        {notif && (
          <div
            className={`fixed top-5 right-5 z-[60] text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg transition-all ${
              notif.ok ? 'bg-green-600' : 'bg-red-500'
            }`}
          >
            {notif.msg}
          </div>
        )}

        {/* Breadcrumb + header */}
        <p className="text-[12px] text-gray-500 mb-2">
          Inicio &rsaquo; <span className="text-primario font-medium">Promociones</span>
        </p>
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primario">
              Gestión de Marketing
            </span>
            <h1 className="text-[22px] font-bold text-gray-900 mt-0.5">Mis Promociones</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Administra tus ofertas activas, descuentos por volumen y campañas de temporada.
            </p>
          </div>
          <button
            onClick={handleNuevaOferta}
            className="flex items-center gap-2 px-5 py-2.5 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors mt-1"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear Nueva Oferta
          </button>
        </div>

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Promociones Activas"
            value={stats.activas}
            iconBg="bg-pink-100"
            icon={
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#C83771" strokeWidth={1.8}>
                <path d="M3 11l19-9-9 19-2-8-8-2z" />
              </svg>
            }
          />
          <KpiCard
            label="Programadas"
            value={stats.programadas}
            iconBg="bg-blue-100"
            icon={
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.8}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <KpiCard
            label="Total de Ofertas"
            value={stats.total}
            iconBg="bg-pink-100"
            icon={
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#C83771" strokeWidth={1.8}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            }
          />
        </div>

        {/* Barra de búsqueda + filtro */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar por título de oferta..."
              className="w-full h-10 border border-gray-300 rounded-lg pl-9 pr-3 text-[13px] bg-white focus:border-primario focus:outline-none"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
            className="h-10 border border-gray-300 rounded-lg px-3 text-[13px] bg-white focus:border-primario focus:outline-none min-w-[170px]"
          >
            <option value="">Todos los Estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="PROGRAMADO">Programado</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="PAUSADO">Pausado</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
              Cargando ofertas...
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={1.5}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-gray-600">
                {ofertas.length === 0 ? 'No hay ofertas activas' : 'Sin resultados'}
              </p>
              <p className="text-[13px] text-gray-400 text-center max-w-xs">
                {ofertas.length === 0
                  ? 'Crea tu primera oferta para comenzar a atraer más clientes.'
                  : 'Prueba cambiando los filtros aplicados.'}
              </p>
              {ofertas.length === 0 && (
                <button
                  onClick={handleNuevaOferta}
                  className="mt-2 px-5 py-2 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors"
                >
                  + Crear Primera Oferta
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Título de Oferta', 'Descuento', 'Vigencia', 'Estado', 'Acciones'].map(
                      (col) => (
                        <th
                          key={col}
                          className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] px-5 py-3 bg-gray-50 border-b border-gray-200"
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginadas.map((o) => (
                    <tr key={o.idOferta} className="hover:bg-[#FAFAFA]">
                      {/* Título */}
                      <td className="px-5 py-4 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              o.estado === 'ACTIVO'
                                ? 'bg-pink-100'
                                : o.estado === 'PROGRAMADO'
                                  ? 'bg-blue-100'
                                  : 'bg-gray-100'
                            }`}
                          >
                            <svg
                              width={14}
                              height={14}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={
                                o.estado === 'ACTIVO'
                                  ? '#C83771'
                                  : o.estado === 'PROGRAMADO'
                                    ? '#2563EB'
                                    : '#9CA3AF'
                              }
                              strokeWidth={2}
                            >
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                              <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-900">{o.titulo}</p>
                            <p className="text-[11px] text-gray-400">
                              Aplica a: {o.idsProductos.length} producto
                              {o.idsProductos.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Descuento */}
                      <td className="px-5 py-4 border-b border-gray-100 align-middle">
                        <span className="text-[14px] font-bold text-gray-900">
                          {formatDescuento(o)}
                        </span>
                      </td>

                      {/* Vigencia */}
                      <td className="px-5 py-4 border-b border-gray-100 align-middle">
                        <p className="text-[13px] text-gray-900">{formatFecha(o.fechaInicio)}</p>
                        <p className="text-[11px] text-gray-500">hasta {formatFecha(o.fechaFin)}</p>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4 border-b border-gray-100 align-middle">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${ESTADO_BADGE[o.estado]}`}
                        >
                          {ESTADO_LABEL[o.estado]}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-2">
                          {o.estado !== 'FINALIZADO' ? (
                            <button
                              onClick={() => handleEditar(o)}
                              title="Editar"
                              className="w-8 h-8 rounded flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-primario-claro hover:text-primario hover:border-primario transition-colors"
                            >
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              title="Ver detalles"
                              className="w-8 h-8 rounded flex items-center justify-center border border-gray-200 text-gray-400"
                            >
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          )}

                          {/* Botón Pausar / Reanudar */}
                          {(o.estado === 'ACTIVO' || o.estado === 'PROGRAMADO' || o.estado === 'PAUSADO') && (
                            <button
                              onClick={() => handleToggle(o)}
                              title={o.estado === 'PAUSADO' ? 'Reanudar oferta' : 'Pausar oferta'}
                              className={`w-8 h-8 rounded flex items-center justify-center border transition-colors ${
                                o.estado === 'PAUSADO'
                                  ? 'border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-400'
                                  : 'border-gray-200 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400'
                              }`}
                            >
                              {o.estado === 'PAUSADO' ? (
                                <PlayCircle size={15} />
                              ) : (
                                <PauseCircle size={15} />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setOfertaAEliminar(o)}
                            title="Eliminar"
                            className="w-8 h-8 rounded flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-[#FEE2E2] hover:text-red-600 hover:border-red-500 transition-colors"
                          >
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginador */}
              {filtradas.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
                  <span className="text-[12px] text-gray-500">
                    Mostrando {(paginaActual - 1) * PAGE_SIZE + 1}–
                    {Math.min(paginaActual * PAGE_SIZE, filtradas.length)} de {filtradas.length}{' '}
                    promociones
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={paginaActual === 1}
                      onClick={() => setPagina((p) => p - 1)}
                      className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹
                    </button>
                    {paginas.map((n) => (
                      <button
                        key={n}
                        onClick={() => setPagina(n)}
                        className={`w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border transition-colors ${
                          n === paginaActual
                            ? 'bg-primario text-white border-primario'
                            : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      disabled={paginaActual === totalPaginas}
                      onClick={() => setPagina((p) => p + 1)}
                      className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ModalCrearOferta
        open={modalOpen}
        ofertaEditar={ofertaEditar}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={ofertaAEliminar !== null}
        titulo="Eliminar promoción"
        variante="peligro"
        confirmando={eliminando}
        confirmarLabel="Sí, eliminar"
        onConfirmar={handleConfirmarEliminar}
        onCancelar={() => setOfertaAEliminar(null)}
        mensaje={
          ofertaAEliminar?.estado === 'ACTIVO' ? (
            <>
              La promoción <strong>"{ofertaAEliminar.titulo}"</strong> está{' '}
              <strong>activa</strong> y aplica a{' '}
              {ofertaAEliminar.idsProductos.length} producto
              {ofertaAEliminar.idsProductos.length !== 1 ? 's' : ''}. Si la eliminas, el
              descuento dejará de mostrarse de inmediato en {ofertaAEliminar.idsProductos.length !== 1 ? 'esos productos' : 'ese producto'}.
              Esta acción no se puede deshacer.
            </>
          ) : (
            <>
              ¿Eliminar la promoción <strong>"{ofertaAEliminar?.titulo}"</strong>? Esta
              acción no se puede deshacer.
            </>
          )
        }
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, AlertTriangle, ExternalLink } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import { personalizacionService } from '../services/personalizacionService';
import { formatearPrecio } from '../utils/formatearPrecio';
import { ESTADO_PEDIDO_INFO } from '../utils/pedidoUi';
import {
  formatearFecha,
  generarCodigoPersonalizacion,
  getBadgeInfo,
  TIPO_TRABAJO_LABEL,
} from '../utils/personalizacionUi';
import { RUTAS } from '../constants/rutas';
import type { IPersonalizacionDetalle } from '../types/IPersonalizacion';

const BTN_BASE = 'flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-label-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const BTN_PRIMARY = `${BTN_BASE} bg-brand-500 text-white hover:bg-brand-600`;
const BTN_ERROR_LIGHT = `${BTN_BASE} bg-error-claro text-error hover:bg-red-100`;
const BTN_PRIMARY_LIGHT = `${BTN_BASE} bg-brand-50 text-brand-600 hover:bg-brand-100`;

export default function PersonalizacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [personalizacion, setPersonalizacion] = useState<IPersonalizacionDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rechazando, setRechazando]     = useState(false);
  const [cancelando, setCancelando]     = useState(false);
  const [negociando, setNegociando]     = useState(false);
  const [enviandoNeg, setEnviandoNeg]   = useState(false);
  const [precioNeg, setPrecioNeg]       = useState('');
  const [especNeg, setEspecNeg]         = useState('');
  const [comentNeg, setComentNeg]       = useState('');

  useEffect(() => {
    if (!id) return;
    let activo = true;
    personalizacionService
      .obtenerDetallePersonalizacion(Number(id))
      .then((data) => { if (activo) setPersonalizacion(data); })
      .catch(() => { if (activo) setError('No se pudo cargar el detalle de la personalización.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [id]);

  function handleAceptarYPagar() {
    if (!personalizacion) return;
    // total = precio base (siempre presente) + costo de personalización negociado.
    navigate(RUTAS.CHECKOUT, {
      state: {
        personalizacion: {
          personalizacionId: personalizacion.id,
          vendedorId: personalizacion.vendedorId,
          nombreTienda: personalizacion.nombreTienda,
          detalleProductoId: personalizacion.detalleProductoId,
          nombreProducto: personalizacion.nombreProducto,
          imagenUrl: personalizacion.imagenUrl,
          talla: personalizacion.talla,
          color: personalizacion.color,
          sku: personalizacion.sku,
          precioUnitario: personalizacion.total,
        },
      },
    });
  }

  async function handleRechazar() {
    if (!personalizacion) return;
    if (!window.confirm('¿Seguro que deseas rechazar esta propuesta?')) return;
    setRechazando(true);
    try {
      await personalizacionService.rechazarPersonalizacion(personalizacion.id);
      setPersonalizacion((prev) => (prev ? { ...prev, estado: 'RECHAZADA' } : prev));
    } catch {
      window.alert('No se pudo rechazar la propuesta. Inténtalo más tarde.');
    } finally {
      setRechazando(false);
    }
  }

  async function handleCancelar() {
    if (!personalizacion) return;
    if (!window.confirm('¿Seguro que deseas cancelar esta solicitud?')) return;
    setCancelando(true);
    try {
      await personalizacionService.cancelarPorCliente(personalizacion.id);
      setPersonalizacion((prev) => (prev ? { ...prev, estado: 'RECHAZADA' } : prev));
    } catch {
      window.alert('No se pudo cancelar la solicitud. Inténtalo más tarde.');
    } finally {
      setCancelando(false);
    }
  }

  async function handleNegociar() {
    if (!personalizacion) return;
    setEnviandoNeg(true);
    try {
      const actualizada = await personalizacionService.contraProponerCliente(personalizacion.id, {
        precioDeseado: precioNeg ? Number(precioNeg) : undefined,
        especificacion: especNeg.trim() || undefined,
        comentario: comentNeg.trim() || undefined,
      });
      setPersonalizacion(actualizada);
      setNegociando(false);
      setPrecioNeg('');
      setEspecNeg('');
      setComentNeg('');
    } catch {
      window.alert('No se pudo enviar la contrapropuesta. Inténtalo más tarde.');
    } finally {
      setEnviandoNeg(false);
    }
  }

  const badge = personalizacion ? getBadgeInfo(personalizacion.estado, personalizacion.pedido?.estado) : null;

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Inicio" />
      <main className="flex-1 px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-8">
          <h1 className="text-h3 font-bold text-ink-900">Mi Cuenta</h1>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <CuentaSidebar />
            <div className="flex flex-1 flex-col gap-6 lg:max-w-[1000px]">
              <button
                type="button"
                onClick={() => navigate(RUTAS.PERSONALIZACIONES)}
                className="flex items-center gap-2 self-start text-label-lg font-medium text-ink-700 transition-colors hover:text-ink-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Mis Personalizaciones
              </button>

              {cargando && (
                <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
                  <p className="text-body-md">Cargando detalle...</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-body-md text-error">
                  {error}
                </div>
              )}

              {!cargando && !error && !personalizacion && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-100 bg-white py-16 text-center">
                  <ShoppingBag className="h-10 w-10 text-ink-200" />
                  <p className="text-body-md text-ink-500">No se encontró esta personalización.</p>
                </div>
              )}

              {!cargando && !error && personalizacion && badge && (
                <>
                  {/* Encabezado */}
                  <div className="flex flex-col gap-4 rounded-xl border border-ink-100 bg-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-title1 font-semibold text-ink-900">
                        {generarCodigoPersonalizacion(personalizacion.fechaCreacion, personalizacion.id)}
                      </h2>
                      <span className={`rounded-full px-3 py-1.5 text-label-md font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-body-xl text-ink-500">
                      <span>Solicitado el {formatearFecha(personalizacion.fechaCreacion)}</span>
                      <span className="h-1 w-1 rounded-full bg-ink-300" />
                      <span>{personalizacion.nombreTienda ?? `Vendedor #${personalizacion.vendedorId}`}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Tu Solicitud */}
                    <div className="flex flex-col gap-4 rounded-xl border border-ink-100 bg-white p-6 lg:col-span-2">
                      <h3 className="text-title1 font-semibold text-ink-900">Tu Solicitud</h3>

                      <div className="flex items-center gap-4">
                        <div className="h-[140px] w-[140px] shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                          {personalizacion.imagenUrl ? (
                            <img
                              src={personalizacion.imagenUrl}
                              alt={personalizacion.nombreProducto ?? ''}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink-300">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-title2 font-semibold text-ink-900">
                            {personalizacion.nombreProducto ?? 'Producto'}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-label-md text-ink-500">
                            {personalizacion.talla && <span>Talla: {personalizacion.talla}</span>}
                            {personalizacion.color && <span>Color: {personalizacion.color}</span>}
                            {personalizacion.sku && <span className="font-mono">SKU: {personalizacion.sku}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-ink-100 pt-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-label-md font-semibold text-ink-500">TIPO DE TRABAJO</span>
                          <span className="text-body-xl text-ink-900">
                            {personalizacion.tipoPersonalizacion
                              ? TIPO_TRABAJO_LABEL[personalizacion.tipoPersonalizacion] ?? personalizacion.tipoPersonalizacion
                              : '—'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-label-md font-semibold text-ink-500">CANTIDAD</span>
                          <span className="text-body-xl text-ink-900">{personalizacion.cantidad}</span>
                        </div>
                      </div>

                      {personalizacion.urlLogo && (
                        <div className="flex flex-col gap-2 border-t border-ink-100 pt-4">
                          <span className="text-label-md font-semibold text-ink-500">ARTE ORIGINAL</span>
                          <div className="flex items-center gap-4">
                            <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                              <img src={personalizacion.urlLogo} alt="Arte original" className="h-full w-full object-cover" />
                            </div>
                            <a
                              href={personalizacion.urlLogo}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-label-lg font-medium text-brand-600 hover:underline"
                            >
                              Ver completo <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      )}

                      {personalizacion.descripcion && (
                        <div className="flex flex-col gap-2 border-t border-ink-100 pt-4">
                          <span className="text-label-md font-semibold text-ink-500">TUS INSTRUCCIONES</span>
                          <p className="whitespace-pre-line text-body-xl text-ink-700">{personalizacion.descripcion}</p>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                      {/* Resumen de Costos */}
                      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-white p-6">
                        <h3 className="text-title1 font-semibold text-ink-900">Resumen de Costos</h3>
                        <p className="text-label-md text-ink-500">
                          El precio base se mantiene fijo; la negociación solo afecta el costo de personalización.
                        </p>
                        {personalizacion.precioBase != null && (
                          <div className="flex items-center justify-between text-body-xl text-ink-700">
                            <span>Precio base</span>
                            <span>{formatearPrecio(personalizacion.precioBase)}</span>
                          </div>
                        )}
                        {personalizacion.descuentos != null && personalizacion.descuentos > 0 && (
                          <div className="flex items-center justify-between text-body-xl text-brand-600">
                            <span>Descuentos</span>
                            <span>- {formatearPrecio(personalizacion.descuentos)}</span>
                          </div>
                        )}
                        {personalizacion.costoPersonalizacion != null && (
                          <div className="flex items-center justify-between text-body-xl text-ink-700">
                            <span>Costo de personalización</span>
                            <span>{formatearPrecio(personalizacion.costoPersonalizacion)}</span>
                          </div>
                        )}
                        <div className="my-1 border-t border-ink-100" />
                        <div className="flex items-center justify-between">
                          <span className="text-title2 font-semibold text-ink-900">Total</span>
                          <span className="text-h6 font-bold text-brand-600">{formatearPrecio(personalizacion.total)}</span>
                        </div>
                      </div>

                      {/* Tu costo de personalización propuesto (contrapropuesta enviada) */}
                      {personalizacion.precioDeseado != null && (
                        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Tu costo de personalización propuesto</p>
                          <p className="text-2xl font-bold text-brand-700">{formatearPrecio(personalizacion.precioDeseado)}</p>
                          <p className="mt-1 text-xs text-ink-500">
                            + Precio base {formatearPrecio(personalizacion.precioBase ?? 0)} = Total {formatearPrecio((personalizacion.precioBase ?? 0) + personalizacion.precioDeseado)}
                          </p>
                        </div>
                      )}

                      {/* Propuesta del Vendedor */}
                      {personalizacion.propuesta && (
                        <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-white p-6">
                          <h3 className="text-title1 font-semibold text-ink-900">Propuesta del Vendedor</h3>
                          {personalizacion.propuesta.imagen && (
                            <div className="flex flex-col gap-2">
                              <div className="h-[160px] w-full overflow-hidden rounded-lg border border-ink-100 bg-surface-muted">
                                <img src={personalizacion.propuesta.imagen} alt="Mockup propuesto" className="h-full w-full object-cover" />
                              </div>
                              <a
                                href={personalizacion.propuesta.imagen}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 self-start text-label-lg font-medium text-brand-600 hover:underline"
                              >
                                Ver completo <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          )}
                          {personalizacion.propuesta.comentario && (
                            <p className="text-body-xl text-ink-700">{personalizacion.propuesta.comentario}</p>
                          )}
                          {personalizacion.propuesta.condiciones && (
                            <div className="flex flex-col gap-1">
                              <span className="text-label-md font-semibold text-ink-500">CONDICIONES</span>
                              <p className="whitespace-pre-line text-body-md text-ink-700">{personalizacion.propuesta.condiciones}</p>
                            </div>
                          )}
                          {personalizacion.propuesta.anotaciones && (
                            <div className="flex flex-col gap-1">
                              <span className="text-label-md font-semibold text-ink-500">ANOTACIONES</span>
                              <p className="whitespace-pre-line text-body-md text-ink-700">{personalizacion.propuesta.anotaciones}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                            <span className="text-title3 font-semibold text-ink-900">Costo de personalización propuesto</span>
                            <span className="text-title1 font-bold text-brand-600">
                              {formatearPrecio(personalizacion.propuesta.precioPropuesto)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Gestionar */}
                      <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-white p-6">
                        <h3 className="text-title1 font-semibold text-ink-900">Gestionar</h3>

                        {personalizacion.estado === 'PENDIENTE' && (
                          <>
                            <p className="rounded-lg bg-surface-muted px-4 py-3 text-body-md text-ink-700">
                              Tu solicitud está siendo revisada por el vendedor.
                            </p>
                            <button type="button" onClick={handleCancelar} disabled={cancelando} className={BTN_ERROR_LIGHT}>
                              {cancelando ? 'Cancelando...' : 'Cancelar solicitud'}
                            </button>
                          </>
                        )}

                        {personalizacion.estado === 'RESPONDIDA' && (
                          <>
                            {!negociando ? (
                              <>
                                <button type="button" onClick={handleAceptarYPagar} className={BTN_PRIMARY}>
                                  Aceptar y Pagar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNegociando(true)}
                                  className={BTN_PRIMARY_LIGHT}
                                >
                                  Negociar precio
                                </button>
                                <button type="button" onClick={handleRechazar} disabled={rechazando} className={BTN_ERROR_LIGHT}>
                                  {rechazando ? 'Rechazando...' : 'Rechazar propuesta'}
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col gap-3">
                                <p className="text-label-md font-semibold text-ink-700">Enviar contrapropuesta</p>
                                <p className="text-xs text-ink-500">
                                  Precio base (fijo): {formatearPrecio(personalizacion.precioBase ?? 0)} — esto no se negocia, solo el costo de personalización.
                                </p>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-ink-600">
                                    Costo de personalización deseado (S/.) <span className="text-error">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={precioNeg}
                                    onChange={(e) => setPrecioNeg(e.target.value)}
                                    placeholder="Ej: 80.00"
                                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-ink-600">
                                    Nueva especificación (opcional)
                                  </label>
                                  <textarea
                                    value={especNeg}
                                    onChange={(e) => setEspecNeg(e.target.value)}
                                    rows={2}
                                    placeholder="Actualiza las instrucciones si lo necesitas..."
                                    className="w-full resize-none rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-ink-600">
                                    Comentario al vendedor (opcional)
                                  </label>
                                  <textarea
                                    value={comentNeg}
                                    onChange={(e) => setComentNeg(e.target.value)}
                                    rows={2}
                                    placeholder="Explica qué cambios deseas..."
                                    className="w-full resize-none rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setNegociando(false)}
                                    disabled={enviandoNeg}
                                    className="flex-1 rounded-lg border border-ink-200 py-2.5 text-sm font-medium text-ink-700 hover:bg-white disabled:opacity-60"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleNegociar}
                                    disabled={enviandoNeg || !precioNeg.trim() || isNaN(Number(precioNeg)) || Number(precioNeg) <= 0}
                                    className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                                  >
                                    {enviandoNeg ? 'Enviando...' : 'Enviar'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {personalizacion.estado === 'ACEPTADA' && personalizacion.pedido && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-body-md text-ink-700">Estado del pedido</span>
                              <span className={`rounded-full px-3 py-1.5 text-label-md font-medium ${ESTADO_PEDIDO_INFO[personalizacion.pedido.estado].className}`}>
                                {ESTADO_PEDIDO_INFO[personalizacion.pedido.estado].label}
                              </span>
                            </div>
                            {personalizacion.pedido.direccionEntrega && (
                              <p className="text-body-md text-ink-500">
                                Entrega en: <span className="text-ink-700">{personalizacion.pedido.direccionEntrega}</span>
                              </p>
                            )}
                          </>
                        )}

                        {personalizacion.estado === 'RECHAZADA' && (
                          <>
                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-md text-error">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                              <span>{personalizacion.propuesta?.comentario ?? 'Esta propuesta fue rechazada.'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate(RUTAS.PERSONALIZAR(personalizacion.detalleProductoId))}
                              className={BTN_PRIMARY_LIGHT}
                            >
                              Repetir solicitud
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

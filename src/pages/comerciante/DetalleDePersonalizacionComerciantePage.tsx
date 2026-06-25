import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { RUTAS } from '../../constants/rutas';
import { personalizacionService } from '../../services/personalizacionService';
import type { IPersonalizacionComercianteDetalle, IResponderPersonalizacionRequest } from '../../types/IPersonalizacion';
import { generarCodigoPersonalizacion, getBadgeInfo, TIPO_TRABAJO_LABEL } from '../../utils/personalizacionUi';
import { formatearPrecio } from '../../utils';

function obtenerIniciales(nombre: string | null): string {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

export default function DetalleDePersonalizacionComerciantePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState<IPersonalizacionComercianteDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [decision, setDecision] = useState<'ACEPTAR' | 'RECHAZAR'>('ACEPTAR');
  const [precioFinal, setPrecioFinal] = useState('');
  const [anotaciones, setAnotaciones] = useState('');
  const [condiciones, setCondiciones] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (!id) return;
    personalizacionService
      .obtenerDetallePersonalizacionComerciante(Number(id))
      .then(setDetalle)
      .catch(() => setError('No se pudo cargar la solicitud.'))
      .finally(() => setCargando(false));
  }, [id]);

  async function handleEnviar() {
    if (!detalle) return;
    setFormError(null);

    let req: IResponderPersonalizacionRequest;
    if (decision === 'ACEPTAR') {
      const precio = parseFloat(precioFinal);
      if (isNaN(precio) || precio <= 0) {
        setFormError('Ingresa un precio final válido mayor a 0.');
        return;
      }
      req = {
        decision: 'ACEPTAR',
        precioPropuesto: precio,
        anotaciones: anotaciones.trim() || undefined,
        condiciones: condiciones.trim() || undefined,
      };
    } else {
      if (!comentario.trim()) {
        setFormError('Ingresa un comentario explicando el motivo del rechazo.');
        return;
      }
      req = { decision: 'RECHAZAR', comentario: comentario.trim() };
    }

    setEnviando(true);
    try {
      const actualizado = await personalizacionService.responderPersonalizacion(detalle.id, req);
      setDetalle(actualizado);
    } catch {
      setFormError('No se pudo enviar la respuesta. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleAceptarPrecioCliente() {
    if (!detalle?.precioDeseado) return;
    setFormError(null);
    setEnviando(true);
    try {
      const actualizado = await personalizacionService.responderPersonalizacion(detalle.id, {
        decision: 'ACEPTAR',
        precioPropuesto: detalle.precioDeseado,
      });
      setDetalle(actualizado);
    } catch {
      setFormError('No se pudo enviar la respuesta. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleCancelar() {
    if (!detalle) return;
    if (!window.confirm('¿Seguro que deseas cancelar esta solicitud?')) return;
    setCancelando(true);
    try {
      await personalizacionService.cancelarPorVendedor(detalle.id);
      setDetalle((prev) => (prev ? { ...prev, estado: 'RECHAZADA' } : prev));
    } catch {
      setFormError('No se pudo cancelar la solicitud. Inténtalo de nuevo.');
    } finally {
      setCancelando(false);
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen">
        <ComercianteSidebar />
        <main className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primario" />
        </main>
      </div>
    );
  }

  if (error || !detalle) {
    return (
      <div className="flex min-h-screen">
        <ComercianteSidebar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-100">
          <p className="text-[13px] text-gray-500">{error ?? 'Solicitud no encontrada.'}</p>
          <button onClick={() => navigate(RUTAS.COMERCIANTE_PERSONALIZACIONES)} className="text-[13px] text-primario underline">
            Volver a Personalizaciones
          </button>
        </main>
      </div>
    );
  }

  const badge = getBadgeInfo(detalle.estado, null);

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="flex-1 bg-gray-100 p-7">
        <p className="text-[12px] text-gray-500 mb-2">
          <Link to={RUTAS.COMERCIANTE_PERSONALIZACIONES} className="hover:text-primario hover:underline">
            Personalizaciones
          </Link>{' '}
          &rsaquo; <span className="text-primario font-medium">Ver Detalle</span>
        </p>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-[22px] font-bold text-gray-900">{generarCodigoPersonalizacion(detalle.fechaCreacion, detalle.id)}</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Columna principal */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {detalle.precioDeseado != null && detalle.estado === 'PENDIENTE' && (
              <div className="bg-primario-claro border border-primario/20 rounded-xl p-5">
                <p className="text-[11px] font-semibold text-primario uppercase tracking-[0.4px] mb-1">Precio propuesto por el cliente</p>
                <p className="text-[22px] font-bold text-primario mb-3">{formatearPrecio(detalle.precioDeseado)}</p>
                <button
                  type="button"
                  onClick={handleAceptarPrecioCliente}
                  disabled={enviando}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-[13px] font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {enviando ? 'Enviando...' : `Aceptar precio del cliente — ${formatearPrecio(detalle.precioDeseado)}`}
                </button>
              </div>
            )}

            {detalle.estado === 'PENDIENTE' ? (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-[15px] font-bold text-gray-900 mb-4">Responder Solicitud</h2>

                {/* Toggle Aceptar/Rechazar */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setDecision('ACEPTAR')}
                    className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                      decision === 'ACEPTAR'
                        ? 'bg-primario text-white'
                        : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('RECHAZAR')}
                    className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                      decision === 'RECHAZAR'
                        ? 'bg-error text-white'
                        : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Rechazar
                  </button>
                </div>

                {decision === 'ACEPTAR' ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Precio Final (S/)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={precioFinal}
                        onChange={(e) => setPrecioFinal(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-10 border border-gray-300 rounded-lg px-3.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Anotaciones</label>
                      <textarea
                        value={anotaciones}
                        onChange={(e) => setAnotaciones(e.target.value)}
                        rows={3}
                        placeholder="Notas para el cliente sobre la propuesta..."
                        className="w-full resize-none border border-gray-300 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Condiciones Adicionales</label>
                      <textarea
                        value={condiciones}
                        onChange={(e) => setCondiciones(e.target.value)}
                        rows={3}
                        placeholder="Condiciones de pago, entrega, garantías..."
                        className="w-full resize-none border border-gray-300 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Comentario</label>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={4}
                      placeholder="Explica al cliente el motivo del rechazo..."
                      className="w-full resize-none border border-gray-300 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
                    />
                  </div>
                )}

                {formError && <p className="mt-3 text-[12px] text-error">{formError}</p>}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleEnviar}
                    disabled={enviando}
                    className="px-5 py-2.5 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors disabled:opacity-60"
                  >
                    {enviando ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={cancelando}
                    className="px-5 py-2.5 border border-error text-error rounded-lg text-[13px] font-semibold hover:bg-error-claro transition-colors disabled:opacity-60"
                  >
                    {cancelando ? 'Cancelando...' : 'Cancelar solicitud'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-[15px] font-bold text-gray-900 mb-4">Tu Respuesta</h2>
                {detalle.estado === 'RECHAZADA' ? (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1">Motivo de Rechazo</p>
                    <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{detalle.propuesta?.comentario || '—'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {detalle.propuesta?.precioPropuesto != null && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1">Precio Final</p>
                        <p className="text-[18px] font-bold text-gray-900">{formatearPrecio(detalle.propuesta.precioPropuesto)}</p>
                      </div>
                    )}
                    {detalle.propuesta?.anotaciones && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1">Anotaciones</p>
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{detalle.propuesta.anotaciones}</p>
                      </div>
                    )}
                    {detalle.propuesta?.condiciones && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1">Condiciones Adicionales</p>
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{detalle.propuesta.condiciones}</p>
                      </div>
                    )}
                    {detalle.estado === 'RESPONDIDA' && (
                      <button
                        type="button"
                        onClick={handleCancelar}
                        disabled={cancelando}
                        className="mt-2 self-start px-5 py-2.5 border border-error text-error rounded-lg text-[13px] font-semibold hover:bg-error-claro transition-colors disabled:opacity-60"
                      >
                        {cancelando ? 'Cancelando...' : 'Cancelar solicitud'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna lateral */}
          <div className="flex flex-col gap-5">
            {/* Producto Solicitado */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">Producto Solicitado</h2>
              <div className="flex gap-3 mb-4">
                {detalle.imagenUrl ? (
                  <img
                    src={detalle.imagenUrl}
                    alt={detalle.nombreProducto ?? ''}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-gray-900">{detalle.nombreProducto ?? 'Producto'}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {[detalle.talla, detalle.color].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[16px] font-bold text-gray-900">{detalle.cantidad}</div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Cantidad</div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[13px] font-bold text-gray-900">
                    {detalle.tipoPersonalizacion
                      ? TIPO_TRABAJO_LABEL[detalle.tipoPersonalizacion] ?? detalle.tipoPersonalizacion
                      : '—'}
                  </div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Tipo de Trabajo</div>
                </div>
              </div>

              {(detalle.urlLogo || detalle.descripcion) && (
                <div className="flex gap-3 rounded-lg bg-primario-claro p-3">
                  {detalle.urlLogo && (
                    <img
                      src={detalle.urlLogo}
                      alt="Diseño referencial"
                      className="w-12 h-12 rounded object-cover flex-shrink-0 bg-white"
                    />
                  )}
                  <div>
                    <p className="text-[12px] font-semibold text-primario">Diseño Referencial</p>
                    {detalle.descripcion && (
                      <p className="text-[12px] text-gray-700 mt-1 whitespace-pre-wrap">{detalle.descripcion}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Detalle del Cliente */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">Detalle del Cliente</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primario-claro text-primario flex items-center justify-center text-[15px] font-semibold flex-shrink-0">
                  {obtenerIniciales(detalle.nombreCliente)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{detalle.nombreCliente ?? `Cliente #${detalle.clienteId}`}</p>
                  <p className="text-[12px] text-gray-500">{detalle.emailCliente ?? '—'}</p>
                </div>
              </div>
              <p className="text-[12px] text-gray-500">
                {detalle.totalPedidosCliente} pedido{detalle.totalPedidosCliente === 1 ? '' : 's'} con este cliente
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

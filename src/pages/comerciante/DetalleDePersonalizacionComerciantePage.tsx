import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { RUTAS } from '../../constants/rutas';
import { personalizacionService } from '../../services/personalizacionService';
import type { IPersonalizacionComercianteDetalle, IResponderPersonalizacionRequest } from '../../types/IPersonalizacion';
import { generarCodigoPersonalizacion, getBadgeInfo, TIPO_TRABAJO_LABEL } from '../../utils/personalizacionUi';
import { formatearPrecio } from '../../utils';
import { subirImagenS3 } from '../../services/catalogoService';
import ChatPersonalizacion from '../../components/ChatPersonalizacion';

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
  const [imagenDiseno, setImagenDiseno] = useState('');
  const [subiendoDiseno, setSubiendoDiseno] = useState(false);
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
      if (!imagenDiseno) {
        setFormError('Adjunta el diseño final que verá y aprobará el cliente.');
        return;
      }
      req = {
        decision: 'ACEPTAR',
        precioPropuesto: precio,
        anotaciones: anotaciones.trim() || undefined,
        condiciones: condiciones.trim() || undefined,
        imagen: imagenDiseno,
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

  async function handleSubirDiseno(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('El diseño debe ser una imagen.');
      return;
    }
    setSubiendoDiseno(true);
    setFormError(null);
    try {
      setImagenDiseno(await subirImagenS3(file));
    } catch {
      setFormError('No se pudo subir el diseño. Inténtalo nuevamente.');
    } finally {
      setSubiendoDiseno(false);
    }
  }

  async function handleAceptarPrecioCliente() {
    if (!detalle?.precioDeseado) return;
    setFormError(null);
    if (!imagenDiseno) {
      setFormError('Adjunta el diseño final antes de aceptar el precio del cliente.');
      return;
    }
    setEnviando(true);
    try {
      const actualizado = await personalizacionService.responderPersonalizacion(detalle.id, {
        decision: 'ACEPTAR',
        precioPropuesto: detalle.precioDeseado,
        imagen: imagenDiseno,
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
    const motivo = window.prompt('Indica el motivo de la cancelación:')?.trim();
    if (!motivo) return;
    setCancelando(true);
    try {
      await personalizacionService.cancelarPorVendedor(detalle.id, motivo);
      setDetalle((prev) => (prev ? {
        ...prev,
        estado: 'RECHAZADA',
        propuesta: prev.propuesta ? { ...prev.propuesta, comentario: motivo } : {
          precioPropuesto: null,
          comentario: motivo,
          condiciones: null,
          anotaciones: null,
          imagen: null,
          fecha: new Date().toISOString(),
        },
      } : prev));
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

      <main className="min-w-0 flex-1 bg-gray-100 px-4 py-16 sm:px-6 lg:p-7">
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
                <p className="text-[11px] font-semibold text-primario uppercase tracking-[0.4px] mb-1">Costo de personalización propuesto por el cliente</p>
                <p className="text-[22px] font-bold text-primario mb-1">{formatearPrecio(detalle.precioDeseado)}</p>
                <p className="text-[12px] text-gray-600 mb-3">
                  + Precio base {formatearPrecio(detalle.precioBase ?? 0)} = Total a cobrar {formatearPrecio((detalle.precioBase ?? 0) + detalle.precioDeseado)}
                </p>
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
                <h2 className="text-[15px] font-bold text-gray-900">Responder solicitud</h2>
                <p className="mb-4 mt-1 text-[12px] text-gray-500">Selecciona si aceptarás o rechazarás esta solicitud.</p>

                <div className="mb-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1" role="radiogroup" aria-label="Decisión sobre la solicitud">
                  <button
                    type="button"
                    onClick={() => setDecision('ACEPTAR')}
                    role="radio"
                    aria-checked={decision === 'ACEPTAR'}
                    className={`rounded-md px-4 py-2.5 text-[13px] font-semibold transition-all ${
                      decision === 'ACEPTAR'
                        ? 'bg-white text-primario shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('RECHAZAR')}
                    role="radio"
                    aria-checked={decision === 'RECHAZAR'}
                    className={`rounded-md px-4 py-2.5 text-[13px] font-semibold transition-all ${
                      decision === 'RECHAZAR'
                        ? 'bg-white text-error shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Rechazar
                  </button>
                </div>

                {decision === 'ACEPTAR' ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Diseño final para aprobación del cliente *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleSubirDiseno(e.target.files?.[0])}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[12px]"
                      />
                      {subiendoDiseno && <p className="mt-1 text-[12px] text-gray-500">Subiendo diseño...</p>}
                      {imagenDiseno && <img src={imagenDiseno} alt="Diseño final" className="mt-3 max-h-56 rounded-lg border border-gray-200 object-contain" />}
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Costo de personalización (S/)</label>
                      <p className="text-[12px] text-gray-500 mb-1.5">
                        Precio base del producto: {formatearPrecio(detalle.precioBase ?? 0)} (se suma automáticamente, no lo incluyas aquí).
                      </p>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={precioFinal}
                        onChange={(e) => setPrecioFinal(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-10 border border-gray-300 rounded-lg px-3.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
                      />
                      {precioFinal.trim() !== '' && !isNaN(parseFloat(precioFinal)) && (
                        <p className="mt-1.5 text-[12px] text-gray-600">
                          Total a cobrar al cliente: <span className="font-semibold text-gray-900">{formatearPrecio((detalle.precioBase ?? 0) + parseFloat(precioFinal))}</span>
                        </p>
                      )}
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

                <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleEnviar}
                    disabled={enviando}
                    className="w-full rounded-lg bg-primario px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primario-hover disabled:opacity-60 sm:w-auto"
                  >
                    {enviando ? 'Enviando respuesta...' : decision === 'ACEPTAR' ? 'Enviar aceptación' : 'Enviar rechazo'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={cancelando}
                    className="px-2 py-2 text-[12px] font-medium text-gray-500 underline-offset-2 transition-colors hover:text-error hover:underline disabled:opacity-60"
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
                    <p className="text-[13px] text-gray-700 whitespace-pre-wrap break-words">{detalle.propuesta?.comentario || '—'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {detalle.propuesta?.precioPropuesto != null && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1">Costo de personalización</p>
                        <p className="text-[18px] font-bold text-gray-900">{formatearPrecio(detalle.propuesta.precioPropuesto)}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          + Precio base {formatearPrecio(detalle.precioBase ?? 0)} = Total {formatearPrecio((detalle.precioBase ?? 0) + detalle.propuesta.precioPropuesto)}
                        </p>
                      </div>
                    )}
                    {detalle.propuesta?.imagen && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-2">Diseño enviado</p>
                        <a href={detalle.propuesta.imagen} target="_blank" rel="noreferrer">
                          <img src={detalle.propuesta.imagen} alt="Diseño enviado al cliente" className="max-h-72 rounded-lg border border-gray-200 object-contain" />
                        </a>
                      </div>
                    )}
                    {detalle.propuesta?.anotaciones && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1">Anotaciones</p>
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap break-words">{detalle.propuesta.anotaciones}</p>
                      </div>
                    )}
                    {detalle.propuesta?.condiciones && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1">Condiciones Adicionales</p>
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap break-words">{detalle.propuesta.condiciones}</p>
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
            <ChatPersonalizacion personalizacionId={detalle.id} soy="VENDEDOR" />
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
                      <p className="text-[12px] text-gray-700 mt-1 whitespace-pre-wrap break-words">{detalle.descripcion}</p>
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

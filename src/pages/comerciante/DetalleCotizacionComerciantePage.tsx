import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User } from 'lucide-react';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import EspecificacionConLinks from '../../components/EspecificacionConLinks';
import { cotizacionService, type IRespuestaCotizacionRequest } from '../../services/cotizacionService';
import { RUTAS } from '../../constants/rutas';
import type { ICotizacionDetalle } from '../../types/IPedido';

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

export default function DetalleCotizacionComerciantePage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cotizacion, setCotizacion]   = useState<ICotizacionDetalle | null>(null);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [enviando, setEnviando]       = useState(false);
  const [cancelando, setCancelando]   = useState(false);
  const [respondida, setRespondida]   = useState(false);

  // Formulario de respuesta
  const [precioPropuesto, setPrecioPropuesto] = useState('');
  const [comentario, setComentario]           = useState('');
  const [condiciones, setCondiciones]         = useState('');
  const [anotaciones, setAnotaciones]         = useState('');

  useEffect(() => {
    if (!id) return;
    cotizacionService.obtenerDetalle(Number(id))
      .then((data) => {
        setCotizacion(data);
        if (data.respuesta) {
          setPrecioPropuesto(String(data.respuesta.precioPropuesto ?? ''));
          setComentario(data.respuesta.comentario ?? '');
          setCondiciones(data.respuesta.condiciones ?? '');
          setAnotaciones(data.respuesta.anotaciones ?? '');
        }
      })
      .catch(() => setError('No se pudo cargar la cotización.'))
      .finally(() => setCargando(false));
  }, [id]);

  async function handleCancelar() {
    if (!cotizacion) return;
    if (!window.confirm('¿Seguro que deseas cancelar esta cotización?')) return;
    setCancelando(true);
    setError(null);
    try {
      await cotizacionService.cancelarCotizacionComerciante(cotizacion.id);
      setCotizacion((prev) => prev ? { ...prev, estado: 'RECHAZADA' } : prev);
    } catch {
      setError('No se pudo cancelar la cotización. Inténtalo de nuevo.');
    } finally {
      setCancelando(false);
    }
  }

  async function enviarRespuesta(precio: number) {
    if (!cotizacion) return;
    if (isNaN(precio) || precio <= 0) {
      setError('Ingresa un precio válido mayor a 0.');
      return;
    }
    setEnviando(true);
    setError(null);
    const req: IRespuestaCotizacionRequest = {
      precioPropuesto: precio,
      comentario:  comentario.trim() || undefined,
      condiciones: condiciones.trim() || undefined,
      anotaciones: anotaciones.trim() || undefined,
    };
    try {
      const actualizada = await cotizacionService.responder(cotizacion.id, req);
      setCotizacion(actualizada);
      setRespondida(true);
    } catch {
      setError('No se pudo enviar la respuesta. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  function handleResponder() {
    enviarRespuesta(parseFloat(precioPropuesto));
  }

  function handleAceptarPrecioCliente() {
    if (!cotizacion?.precioDeseado) return;
    enviarRespuesta(cotizacion.precioDeseado);
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen bg-surface-muted">
        <ComercianteSidebar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
        </main>
      </div>
    );
  }

  if (error && !cotizacion) {
    return (
      <div className="flex min-h-screen bg-surface-muted">
        <ComercianteSidebar />
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-ink-500">{error}</p>
          <button onClick={() => navigate(RUTAS.COMERCIANTE_COTIZACIONES)} className="text-brand-600 underline">
            Volver a cotizaciones
          </button>
        </main>
      </div>
    );
  }

  if (!cotizacion) return null;

  const puedeResponder = cotizacion.estado === 'PENDIENTE' && !respondida;
  const yaRespondio    = cotizacion.estado !== 'PENDIENTE' || respondida;

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <ComercianteSidebar />
      <main className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-[760px]">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate(RUTAS.COMERCIANTE_COTIZACIONES)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a cotizaciones
          </button>

          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <User className="h-5 w-5 text-ink-400" />
                <span className="font-semibold text-ink-900">
                  {cotizacion.nombreCliente ? cotizacion.nombreCliente : `Cliente #${cotizacion.clienteId}`}
                </span>
              </div>
              <p className="text-sm text-ink-400">
                Recibida el {new Date(cotizacion.fechaCreacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_CLASES[cotizacion.estado] ?? 'bg-ink-100 text-ink-600'}`}>
              {ESTADO_LABELS[cotizacion.estado] ?? cotizacion.estado}
            </span>
          </div>

          {/* Productos solicitados */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-ink-900">Productos solicitados</h2>
            {cotizacion.productos.length === 0 ? (
              <p className="text-sm text-ink-400">Sin productos.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {cotizacion.productos.map((p, i) => (
                  <div key={p.id} className="flex gap-3 rounded-xl border border-ink-100 p-4">
                    {p.imagenUrl ? (
                      <img src={p.imagenUrl} alt="" className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-ink-100">
                        <Package className="h-7 w-7 text-ink-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-900">{p.nombre ?? `Producto ${i + 1}`}</p>
                      <p className="mt-0.5 text-xs text-ink-400">{p.tipo === 'CATALOGO' ? 'Del catálogo' : 'Ingresado manualmente'}</p>
                      {p.precio != null && (
                        <p className="mt-0.5 text-sm text-ink-600">Precio base: S/.{p.precio.toFixed(2)}</p>
                      )}
                      {p.especificacion && (
                        <EspecificacionConLinks texto={p.especificacion} className="mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contrapropuesta del cliente (si existe precio deseado) */}
          {cotizacion.precioDeseado != null && (
            <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">Precio propuesto por el cliente</p>
              <p className="text-2xl font-bold text-brand-700">S/.{cotizacion.precioDeseado.toFixed(2)}</p>
              <p className="mt-1 text-xs text-ink-400">El cliente envió una contrapropuesta. Acepta su precio o responde con uno nuevo abajo.</p>
              {puedeResponder && (
                <button
                  type="button"
                  onClick={handleAceptarPrecioCliente}
                  disabled={enviando}
                  className="mt-3 w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {enviando ? 'Enviando...' : `Aceptar precio del cliente — S/.${cotizacion.precioDeseado.toFixed(2)}`}
                </button>
              )}
            </div>
          )}

          {/* Formulario de respuesta */}
          {puedeResponder && (
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-ink-900">Responder cotización</h2>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Precio total propuesto (S/.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioPropuesto}
                  onChange={(e) => setPrecioPropuesto(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Comentario</label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Detalles sobre tu propuesta, tiempos de entrega, etc."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Condiciones</label>
                <textarea
                  value={condiciones}
                  onChange={(e) => setCondiciones(e.target.value)}
                  placeholder="Condiciones de pago, entrega, garantías..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Anotaciones adicionales</label>
                <textarea
                  value={anotaciones}
                  onChange={(e) => setAnotaciones(e.target.value)}
                  placeholder="Cualquier información adicional relevante..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleResponder}
                  disabled={enviando}
                  className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {enviando ? 'Enviando respuesta...' : 'Enviar propuesta al cliente'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={cancelando}
                  className="w-full rounded-xl border border-red-300 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar cotización'}
                </button>
              </div>
            </div>
          )}

          {/* Respuesta ya enviada */}
          {yaRespondio && cotizacion.respuesta && (
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-ink-900">Tu propuesta enviada</h2>
              {cotizacion.respuesta.precioPropuesto != null && (
                <p className="mb-2 text-2xl font-bold text-ink-900">
                  S/.{cotizacion.respuesta.precioPropuesto.toFixed(2)}
                </p>
              )}
              {cotizacion.respuesta.comentario && (
                <p className="text-sm text-ink-700">{cotizacion.respuesta.comentario}</p>
              )}
              {respondida && (
                <p className="mt-3 text-sm font-medium text-green-700">
                  ¡Propuesta enviada! El cliente recibirá una notificación.
                </p>
              )}
            </div>
          )}

          {/* Cancelar desde estado RESPONDIDA */}
          {cotizacion.estado === 'RESPONDIDA' && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              {error && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <button
                type="button"
                onClick={handleCancelar}
                disabled={cancelando}
                className="w-full rounded-xl border border-red-300 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {cancelando ? 'Cancelando...' : 'Cancelar cotización'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

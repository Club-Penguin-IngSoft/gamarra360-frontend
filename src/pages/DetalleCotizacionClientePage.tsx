import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Package, Store } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { cotizacionService } from '../services/cotizacionService';
import { RUTAS } from '../constants/rutas';
import type { ICotizacionDetalle } from '../types/IPedido';

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  RESPONDIDA: 'Con propuesta',
  ACEPTADA:   'Aceptada',
  RECHAZADA:  'Cancelada',
};

const ESTADO_CLASES: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800',
  RESPONDIDA: 'bg-blue-100 text-blue-800',
  ACEPTADA:   'bg-green-100 text-green-800',
  RECHAZADA:  'bg-red-100 text-red-800',
};

export default function DetalleCotizacionClientePage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cotizacion, setCotizacion] = useState<ICotizacionDetalle | null>(null);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [accion, setAccion]         = useState<'aceptando' | 'rechazando' | null>(null);
  const [confirmacion, setConfirmacion] = useState<'ACEPTADA' | 'RECHAZADA' | null>(null);

  useEffect(() => {
    if (!id) return;
    cotizacionService.obtenerDetalle(Number(id))
      .then(setCotizacion)
      .catch(() => setError('No se pudo cargar la cotización.'))
      .finally(() => setCargando(false));
  }, [id]);

  async function handleAceptar() {
    if (!cotizacion) return;
    setAccion('aceptando');
    try {
      const actualizada = await cotizacionService.aceptar(cotizacion.id);
      setCotizacion(actualizada);
      setConfirmacion('ACEPTADA');
    } catch {
      setError('No se pudo aceptar la cotización. Inténtalo de nuevo.');
    } finally {
      setAccion(null);
    }
  }

  async function handleRechazar() {
    if (!cotizacion) return;
    setAccion('rechazando');
    try {
      await cotizacionService.rechazar(cotizacion.id);
      setCotizacion((prev) => prev ? { ...prev, estado: 'RECHAZADA' } : prev);
      setConfirmacion('RECHAZADA');
    } catch {
      setError('No se pudo cancelar la cotización.');
    } finally {
      setAccion(null);
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen flex-col bg-surface-muted">
        <TopBar active="Cotizaciones" />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !cotizacion) {
    return (
      <div className="flex min-h-screen flex-col bg-surface-muted">
        <TopBar active="Cotizaciones" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-ink-500">{error}</p>
          <button onClick={() => navigate(RUTAS.MIS_COTIZACIONES)} className="text-brand-600 underline">
            Volver a mis cotizaciones
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cotizacion) return null;

  const puedeActuar = cotizacion.estado === 'RESPONDIDA';

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Cotizaciones" />
      <main className="flex-1 px-4 py-10 md:px-12">
        <div className="mx-auto max-w-[760px]">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate(RUTAS.MIS_COTIZACIONES)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mis cotizaciones
          </button>

          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Store className="h-5 w-5 text-ink-400" />
                <span className="font-semibold text-ink-900">{cotizacion.nombreTienda ?? `Tienda #${cotizacion.vendedorId}`}</span>
              </div>
              <p className="text-sm text-ink-400">
                Enviada el {new Date(cotizacion.fechaCreacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_CLASES[cotizacion.estado] ?? 'bg-ink-100 text-ink-600'}`}>
              {ESTADO_LABELS[cotizacion.estado] ?? cotizacion.estado}
            </span>
          </div>

          {/* Productos */}
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
                    <div className="flex-1">
                      <p className="font-medium text-ink-900">{p.nombre ?? `Producto ${i + 1}`}</p>
                      <p className="mt-0.5 text-xs text-ink-400">{p.tipo === 'CATALOGO' ? 'Del catálogo' : 'Ingresado manualmente'}</p>
                      {p.precio != null && (
                        <p className="mt-0.5 text-sm text-ink-600">Precio ref.: S/.{p.precio.toFixed(2)}</p>
                      )}
                      {p.especificacion && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">{p.especificacion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Respuesta del comerciante */}
          {cotizacion.respuesta ? (
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
              <h2 className="mb-3 font-semibold text-ink-900">Propuesta del comerciante</h2>
              {cotizacion.respuesta.precioPropuesto != null && (
                <p className="mb-2 text-2xl font-bold text-ink-900">
                  S/.{cotizacion.respuesta.precioPropuesto.toFixed(2)}
                  <span className="ml-2 text-sm font-normal text-ink-500">precio total propuesto</span>
                </p>
              )}
              {cotizacion.respuesta.comentario && (
                <div className="mb-2">
                  <p className="text-xs font-semibold uppercase text-ink-400">Comentario</p>
                  <p className="mt-0.5 text-sm text-ink-700">{cotizacion.respuesta.comentario}</p>
                </div>
              )}
              {cotizacion.respuesta.condiciones && (
                <div className="mb-2">
                  <p className="text-xs font-semibold uppercase text-ink-400">Condiciones</p>
                  <p className="mt-0.5 text-sm text-ink-700">{cotizacion.respuesta.condiciones}</p>
                </div>
              )}
              {cotizacion.respuesta.anotaciones && (
                <div className="mb-2">
                  <p className="text-xs font-semibold uppercase text-ink-400">Anotaciones</p>
                  <p className="mt-0.5 text-sm text-ink-700">{cotizacion.respuesta.anotaciones}</p>
                </div>
              )}
              {cotizacion.respuesta.imagen && (
                <img src={cotizacion.respuesta.imagen} alt="Imagen adjunta" className="mt-3 max-h-48 rounded-lg object-contain" />
              )}
              {cotizacion.respuesta.fecha && (
                <p className="mt-3 text-xs text-ink-400">
                  Respondida el {new Date(cotizacion.respuesta.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          ) : cotizacion.estado === 'PENDIENTE' ? (
            <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm text-center">
              <p className="text-sm text-ink-500">El comerciante aún no ha respondido tu solicitud.</p>
            </div>
          ) : null}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Confirmación flash */}
          {confirmacion && (
            <div className={`mb-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
              confirmacion === 'ACEPTADA' ? 'bg-green-50 text-green-800' : 'bg-ink-50 text-ink-700'
            }`}>
              {confirmacion === 'ACEPTADA'
                ? <><CheckCircle className="h-5 w-5 text-green-600" /> Cotización aceptada. ¡El comerciante ha sido notificado!</>
                : <><XCircle className="h-5 w-5 text-ink-500" /> Cotización cancelada.</>
              }
            </div>
          )}

          {/* Acciones */}
          {puedeActuar && !confirmacion && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAceptar}
                disabled={accion !== null}
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {accion === 'aceptando' ? 'Aceptando...' : 'Aceptar propuesta'}
              </button>
              <button
                type="button"
                onClick={handleRechazar}
                disabled={accion !== null}
                className="flex-1 rounded-xl border border-red-300 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {accion === 'rechazando' ? 'Cancelando...' : 'Cancelar cotización'}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

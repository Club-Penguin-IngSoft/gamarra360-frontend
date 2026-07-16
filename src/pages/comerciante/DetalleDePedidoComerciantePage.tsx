import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { RUTAS } from '../../constants/rutas';
import { pedidoService } from '../../services/pedidoService';
import type { IPedidoComercianteDetalle } from '../../types/IPedido';
import { formatearFecha, generarCodigoPedido, ESTADO_PEDIDO_INFO, etiquetaAvanzarEstado } from '../../utils/pedidoUi';
import { TIPO_TRABAJO_LABEL } from '../../utils/personalizacionUi';
import { formatearPrecio } from '../../utils';

function obtenerIniciales(nombre: string | null): string {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

export default function DetalleDePedidoComerciantePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState<IPedidoComercianteDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [avanzando, setAvanzando] = useState(false);

  useEffect(() => {
    if (!id) return;
    pedidoService
      .obtenerDetallePedidoComerciante(Number(id))
      .then(setDetalle)
      .catch(() => setErrorCarga('No se pudo cargar el pedido.'))
      .finally(() => setCargando(false));
  }, [id]);

  async function handleAvanzarEstado() {
    if (!detalle || !id) return;
    setAvanzando(true);
    setErrorAccion(null);
    try {
      const pedidoActualizado = await pedidoService.avanzarEstadoPedido(Number(id));
      setDetalle((prev) => prev ? { ...prev, estado: pedidoActualizado.estado } : prev);
    } catch {
      setErrorAccion('No se pudo actualizar el estado del pedido. Inténtalo de nuevo.');
    } finally {
      setAvanzando(false);
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

  if (errorCarga || !detalle) {
    return (
      <div className="flex min-h-screen">
        <ComercianteSidebar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-100">
          <p className="text-[13px] text-gray-500">{errorCarga ?? 'Pedido no encontrado.'}</p>
          <button onClick={() => navigate(RUTAS.COMERCIANTE_PEDIDOS)} className="text-[13px] text-primario underline">
            Volver a Pedidos
          </button>
        </main>
      </div>
    );
  }

  const estadoInfo = ESTADO_PEDIDO_INFO[detalle.estado];
  const totalCompras = detalle.historialCliente.length + 1;
  const labelAvanzar = etiquetaAvanzarEstado(detalle.estado, detalle.tipoEntrega);

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="flex-1 bg-gray-100 p-7">
        <p className="text-[12px] text-gray-500 mb-2">
          <Link to={RUTAS.COMERCIANTE_PEDIDOS} className="hover:text-primario hover:underline">
            Pedidos
          </Link>{' '}
          &rsaquo; <span className="text-primario font-medium">Ver Detalle</span>
        </p>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-gray-900">{generarCodigoPedido(detalle.fecha, detalle.id)}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${estadoInfo.className}`}>
              {estadoInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {labelAvanzar && (
              <button
                disabled={avanzando}
                onClick={handleAvanzarEstado}
                className="flex items-center gap-1.5 px-[18px] py-2.5 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors disabled:opacity-60"
              >
                {avanzando ? 'Actualizando...' : labelAvanzar}
              </button>
            )}
            {!labelAvanzar && (
              <button
                className="flex items-center gap-1.5 px-[18px] py-2.5 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors"
                onClick={() => window.alert('Próximamente disponible')}
              >
                <FileText size={15} />
                Generar Guía de Envío
              </button>
            )}
          </div>
        </div>

        {errorAccion && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
            {errorAccion}
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Columna principal */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Artículos del Pedido */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">Artículos del Pedido</h2>
              <div className="flex flex-col gap-4">
                {detalle.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                    {item.imagenUrl ? (
                      <img
                        src={item.imagenUrl}
                        alt={item.nombreProducto ?? ''}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-gray-900">{item.nombreProducto ?? 'Producto'}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {[item.talla, item.color, item.sku].filter(Boolean).join(' · ')}
                      </p>
                      <p className="text-[12px] text-gray-700 mt-1">
                        {item.cantidad} × {formatearPrecio(item.precio)}
                      </p>

                      {item.personalizacion && (
                        <div className="mt-2 flex gap-3 rounded-lg bg-primario-claro p-3">
                          {item.personalizacion.urlLogo && (
                            <img
                              src={item.personalizacion.urlLogo}
                              alt="Logo de personalización"
                              className="w-12 h-12 rounded object-cover flex-shrink-0 bg-white"
                            />
                          )}
                          <div>
                            <p className="text-[12px] font-semibold text-primario">
                              Personalización: {TIPO_TRABAJO_LABEL[item.personalizacion.tipoPersonalizacion] ?? item.personalizacion.tipoPersonalizacion}
                            </p>
                            {item.personalizacion.descripcion && (
                              <p className="text-[12px] text-gray-700 mt-1 whitespace-pre-wrap break-words">{item.personalizacion.descripcion}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información de Envío */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">Información de Envío</h2>
              <p className="text-[13px] text-gray-700 mb-1">
                {detalle.tipoEntrega === 'DELIVERY' ? 'Envío a domicilio' : 'Recojo en tienda'}
              </p>
              {detalle.tipoEntrega === 'DELIVERY' && detalle.direccionEntrega && (
                <p className="text-[13px] text-gray-900">{detalle.direccionEntrega}</p>
              )}
            </div>
          </div>

          {/* Columna lateral */}
          <div className="flex flex-col gap-5">
            {/* Cliente */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primario-claro text-primario flex items-center justify-center text-[15px] font-semibold flex-shrink-0">
                  {obtenerIniciales(detalle.nombreCliente)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{detalle.nombreCliente ?? `Cliente #${detalle.clienteId}`}</p>
                  <p className="text-[12px] text-gray-500">{detalle.emailCliente ?? '—'}</p>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[16px] font-bold text-gray-900">{totalCompras}</div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Total Compras</div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[16px] font-bold text-gray-900">{formatearPrecio(detalle.total)}</div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Costo del Pedido</div>
                </div>
              </div>


            </div>

            {/* Historial del Cliente */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">Historial del Cliente</h2>
              {detalle.historialCliente.length === 0 ? (
                <p className="text-[13px] text-gray-400">Sin pedidos anteriores con este cliente.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {detalle.historialCliente.map((h) => {
                    const info = ESTADO_PEDIDO_INFO[h.estado];
                    return (
                      <div key={h.id} className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[12px] font-semibold text-gray-900">{generarCodigoPedido(h.fecha, h.id)}</p>
                          <p className="text-[11px] text-gray-500">{formatearFecha(h.fecha)}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${info.className}`}>
                          {info.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

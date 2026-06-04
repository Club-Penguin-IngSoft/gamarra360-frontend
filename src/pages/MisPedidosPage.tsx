import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, ChevronRight } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { pedidoService } from '../services/pedidoService';
import { useAuth } from '../hooks/useAuth';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS } from '../constants/rutas';
import type { IOrdenPago, EstadoPago } from '../types/IPedido';

const ETIQUETA_ESTADO: Record<EstadoPago, string> = {
  PENDIENTE: 'Pendiente de pago',
  PAGADO: 'Pagado',
  FALLIDO: 'Fallido',
};

const COLOR_ESTADO: Record<EstadoPago, string> = {
  PENDIENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAGADO: 'bg-green-50 text-green-700 border-green-200',
  FALLIDO: 'bg-red-50 text-red-700 border-red-200',
};

function formatearFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function MisPedidosPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [ordenes, setOrdenes] = useState<IOrdenPago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clienteId = Number(usuario?.id ?? 0);
    pedidoService
      .obtenerMisOrdenes(clienteId)
      .then(setOrdenes)
      .catch(() => setError('No se pudieron cargar tus pedidos. Inténtalo más tarde.'))
      .finally(() => setCargando(false));
  }, [usuario?.id]);

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <TopBar active="Inicio" />

      <main className="flex-1 px-4 py-10 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-[28px] font-bold text-ink-900">Mis Pedidos</h1>

          {cargando && (
            <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
              <p className="text-[14px]">Cargando tus pedidos...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-[14px] text-red-700">
              {error}
            </div>
          )}

          {!cargando && !error && ordenes.length === 0 && (
            <div className="flex flex-col items-center gap-5 py-24 text-center">
              <ShoppingBag className="h-16 w-16 text-ink-200" />
              <div>
                <p className="text-[18px] font-semibold text-ink-900">Aún no tienes pedidos</p>
                <p className="mt-1 text-[14px] text-ink-500">Cuando realices una compra aparecerá aquí.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(RUTAS.CATALOGO)}
                className="mt-2 rounded-lg bg-[#c83a71] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#a62b5a] transition-colors"
              >
                Explorar productos
              </button>
            </div>
          )}

          {!cargando && !error && ordenes.length > 0 && (
            <div className="flex flex-col gap-4">
              {ordenes.map((orden) => (
                <div
                  key={orden.id}
                  className="rounded-xl border border-ink-100 bg-white shadow-sm overflow-hidden"
                >
                  {/* Cabecera */}
                  <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-ink-400" />
                        <span className="text-[13px] font-mono text-ink-500">Orden #{orden.id}</span>
                      </div>
                      <span className="text-[12px] text-ink-400">{formatearFecha(orden.fecha)}</span>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${COLOR_ESTADO[orden.estado]}`}>
                      {ETIQUETA_ESTADO[orden.estado]}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-1 text-[14px]">
                      <span className="text-ink-500">Total:</span>
                      <span className="ml-1 font-bold text-brand-600">{formatearPrecio(orden.total)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(RUTAS.DETALLE_PEDIDO(orden.id))}
                      className="flex items-center gap-1 text-[13px] font-medium text-brand-500 hover:text-brand-700 transition-colors"
                    >
                      Ver detalle <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

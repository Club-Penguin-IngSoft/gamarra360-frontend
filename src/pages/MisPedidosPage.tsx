import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import PedidoTabs from '../components/pedidos/PedidoTabs';
import PedidoOrdenCard from '../components/pedidos/PedidoOrdenCard';
import { pedidoService } from '../services/pedidoService';
import { obtenerProducto } from '../services/catalogoService';
import { useAuth } from '../hooks/useAuth';
import { useCarrito } from '../hooks/useCarrito';
import { RUTAS } from '../constants/rutas';
import { pedidoCoincideConTab, type TabPedidos } from '../utils/pedidoUi';
import type { IDetalleOrden, IPedidoConDetalles } from '../types/IPedido';

export default function MisPedidosPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { agregarAlCarrito } = useCarrito();
  const [ordenes, setOrdenes] = useState<IDetalleOrden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabPedidos>('TODAS');
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [repitiendoId, setRepitiendoId] = useState<number | null>(null);

  useEffect(() => {
    const clienteId = Number(usuario?.id ?? 0);
    if (!clienteId) {
      setCargando(false);
      return;
    }

    let activo = true;
    setCargando(true);

    pedidoService
      .obtenerMisOrdenes(clienteId)
      .then((resumen) => Promise.all(resumen.map((o) => pedidoService.obtenerDetalleOrden(o.id))))
      .then((detalles) => {
        if (activo) setOrdenes(detalles);
      })
      .catch(() => {
        if (activo) setError('No se pudieron cargar tus pedidos. Inténtalo más tarde.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [usuario?.id]);

  async function handleCancelar(pedidoId: number) {
    if (!window.confirm('¿Seguro que deseas cancelar este pedido?')) return;

    setCancelandoId(pedidoId);
    try {
      await pedidoService.cancelarPedido(pedidoId);
      setOrdenes((actuales) =>
        actuales.map((orden) => ({
          ...orden,
          pedidos: orden.pedidos.map((p) => (p.id === pedidoId ? { ...p, estado: 'CANCELADO' as const } : p)),
        })),
      );
    } catch {
      window.alert('No se pudo cancelar el pedido. Inténtalo más tarde.');
    } finally {
      setCancelandoId(null);
    }
  }

  async function handleRepetir(pedido: IPedidoConDetalles) {
    setRepitiendoId(pedido.id);
    try {
      let agregados = 0;
      for (const detalle of pedido.detalles) {
        if (!detalle.idProducto) continue;
        const producto = await obtenerProducto(String(detalle.idProducto));
        agregarAlCarrito(
          producto,
          detalle.cantidad,
          detalle.idVarianteProducto != null ? String(detalle.idVarianteProducto) : undefined,
        );
        agregados += 1;
      }
      if (agregados === 0) {
        window.alert('Los productos de este pedido ya no están disponibles.');
        return;
      }
      navigate(RUTAS.CARRITO);
    } catch {
      window.alert('No se pudo repetir el pedido. Inténtalo más tarde.');
    } finally {
      setRepitiendoId(null);
    }
  }

  const ordenesVisibles = ordenes.filter((orden) => orden.pedidos.some((p) => pedidoCoincideConTab(p.estado, tab)));

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Inicio" />

      <main className="flex-1 px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-8">
          <h1 className="text-h3 font-bold text-ink-900">Mi Cuenta</h1>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <CuentaSidebar />

            <div className="flex flex-1 flex-col gap-6 lg:max-w-[1000px]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-h5 font-semibold text-ink-900">Mis Pedidos</h2>
                <PedidoTabs activa={tab} onChange={setTab} />
              </div>

              {cargando && (
                <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
                  <p className="text-body-md">Cargando tus pedidos...</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-body-md text-red-700">
                  {error}
                </div>
              )}

              {!cargando && !error && ordenes.length === 0 && (
                <div className="flex flex-col items-center gap-5 rounded-xl bg-white py-24 text-center">
                  <ShoppingBag className="h-16 w-16 text-ink-200" />
                  <div>
                    <p className="text-title1 font-semibold text-ink-900">Aún no tienes pedidos</p>
                    <p className="mt-1 text-body-md text-ink-500">Cuando realices una compra aparecerá aquí.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(RUTAS.CATALOGO)}
                    className="mt-2 rounded-lg bg-brand-500 px-6 py-3 text-label-lg font-semibold text-white transition-colors hover:bg-brand-600"
                  >
                    Explorar productos
                  </button>
                </div>
              )}

              {!cargando && !error && ordenes.length > 0 && ordenesVisibles.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-16 text-center">
                  <p className="text-title1 font-semibold text-ink-900">No tienes pedidos en esta categoría</p>
                  <p className="text-body-md text-ink-500">Prueba con otra pestaña.</p>
                </div>
              )}

              {!cargando && !error && ordenesVisibles.length > 0 && (
                <div className="flex flex-col gap-4">
                  {ordenesVisibles.map((orden) => (
                    <PedidoOrdenCard
                      key={orden.id}
                      orden={orden}
                      tab={tab}
                      onCancelar={handleCancelar}
                      onRepetir={handleRepetir}
                      cancelandoId={cancelandoId}
                      repitiendoId={repitiendoId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import PersonalizacionTabs from '../components/personalizaciones/PersonalizacionTabs';
import PersonalizacionCard from '../components/personalizaciones/PersonalizacionCard';
import { personalizacionService } from '../services/personalizacionService';
import { RUTAS } from '../constants/rutas';
import { personalizacionCoincideConTab, type TabPersonalizaciones } from '../utils/personalizacionUi';
import type { IPersonalizacionResumen } from '../types/IPersonalizacion';

export default function MisPersonalizacionesPage() {
  const navigate = useNavigate();
  const [personalizaciones, setPersonalizaciones] = useState<IPersonalizacionResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabPersonalizaciones>('TODAS');

  useEffect(() => {
    let activo = true;
    personalizacionService
      .listarMisPersonalizaciones()
      .then((data) => { if (activo) setPersonalizaciones(data); })
      .catch(() => { if (activo) setError('No se pudieron cargar tus personalizaciones. Inténtalo más tarde.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  function handlePagarAhora(p: IPersonalizacionResumen) {
    navigate(RUTAS.CHECKOUT, {
      state: {
        personalizacion: {
          personalizacionId: p.id,
          vendedorId: p.vendedorId,
          nombreTienda: p.nombreTienda,
          detalleProductoId: p.detalleProductoId,
          nombreProducto: p.nombreProducto,
          imagenUrl: p.imagenUrl,
          talla: p.talla,
          color: p.color,
          sku: p.sku,
          precioUnitario: p.total,
        },
      },
    });
  }

  const visibles = personalizaciones.filter((p) => personalizacionCoincideConTab(p.estado, p.pedidoEstado, tab));

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
                <h2 className="text-h5 font-semibold text-ink-900">Mis Personalizaciones</h2>
                <PersonalizacionTabs activa={tab} onChange={setTab} />
              </div>

              {cargando && (
                <div className="flex flex-col items-center gap-4 py-20 text-ink-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500" />
                  <p className="text-body-md">Cargando tus personalizaciones...</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-body-md text-error">
                  {error}
                </div>
              )}

              {!cargando && !error && personalizaciones.length === 0 && (
                <div className="flex flex-col items-center gap-5 rounded-xl bg-white py-24 text-center">
                  <Sparkles className="h-16 w-16 text-ink-200" />
                  <div>
                    <p className="text-title1 font-semibold text-ink-900">Aún no tienes personalizaciones</p>
                    <p className="mt-1 text-body-md text-ink-500">
                      Solicita una personalización desde cualquier producto personalizable.
                    </p>
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

              {!cargando && !error && personalizaciones.length > 0 && visibles.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-16 text-center">
                  <p className="text-title1 font-semibold text-ink-900">No tienes personalizaciones en esta categoría</p>
                  <p className="text-body-md text-ink-500">Prueba con otra pestaña.</p>
                </div>
              )}

              {!cargando && !error && visibles.length > 0 && (
                <div className="flex flex-col gap-4">
                  {visibles.map((p) => (
                    <PersonalizacionCard key={p.id} personalizacion={p} onPagarAhora={handlePagarAhora} />
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

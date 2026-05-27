import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ListFilter, SearchX, X } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import SortSelect, { SORT_OPTIONS_DEFAULT } from '../components/SortSelect';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { PAGINA_TAMANO_CATALOGO } from '../constants';
import { RUTAS } from '../constants/rutas';
import { useCatalogo } from '../hooks/useCatalogo';
import type { IFiltrosCatalogo, OrdenCatalogo } from '../types/IFiltro';
import { FILTROS_VACIOS } from '../types/IFiltro';

/* --------------------------- Toolbar components --------------------------- */

function FilterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-11 items-center gap-2 rounded-lg border border-brand-500 bg-white px-6 text-[15px] font-medium text-brand-600 hover:bg-brand-50"
    >
      <ListFilter className="h-4 w-4" />
      Filtros
    </button>
  );
}

/* ----------------------------- Filter Panel ------------------------------ */

/* ---------------------------------- Page --------------------------------- */

export default function CatalogoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q')?.trim() ?? null;

  const [sort, setSort] = useState(SORT_OPTIONS_DEFAULT[0]);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState<IFiltrosCatalogo>({
    ...FILTROS_VACIOS,
    q: queryParam,
  });
  const mapSortToBackend = (value: string): OrdenCatalogo => {
    switch (value) {
      case 'Menor precio':
        return 'PRICE_ASC';
      case 'Mayor precio':
        return 'PRICE_DESC';
      case 'Lo más reciente':
      default:
        return 'RECENT';
    }
  };

  // Sincronizar paginación hacia el backend
  useEffect(() => {
    setFiltros((f) => ({
      ...f,
      page,
      size: PAGINA_TAMANO_CATALOGO,
    }));
  }, [page]);
  const prevPathRef = useRef<string | null>(null);

  // Sincronizar el q del URL con el estado de filtros (cuando cambia el query
  // param, por ejemplo al navegar desde otra página o usar el botón "atrás")
  useEffect(() => {
    setFiltros((f) =>
      f.q === queryParam
        ? f
        : {
            ...f,
            q: queryParam,
            page: 1,
            size: PAGINA_TAMANO_CATALOGO,
            random: false,
            seed: null,
          },
    );
    setPage(1);
  }, [queryParam]);

  // Aplicar ordenamiento desde el dropdown
  useEffect(() => {
    setFiltros((f) => ({
      ...f,
      sort: mapSortToBackend(sort),
      random: false,
      seed: null,
    }));
    setPage(1);
  }, [sort]);

  // Al volver desde otra ruta (ej. detalle de producto), resetear filtros
  // para evitar catálogo vacío por filtros previos.
  useEffect(() => {
    const prevPath = prevPathRef.current;
    if (prevPath && prevPath !== RUTAS.CATALOGO) {
      setFiltros({
        ...FILTROS_VACIOS,
        q: queryParam,
        page: 1,
        size: PAGINA_TAMANO_CATALOGO,
        random: false,
        seed: null,
      });
      setPage(1);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, queryParam]);

  const { productos, totalItems, totalPages, cargando } = useCatalogo(filtros);

  // Apply filters only when user confirms
  const handleApplyFiltros = (f: IFiltrosCatalogo) => {
    const next = {
      ...f,
      page: 1,
      size: PAGINA_TAMANO_CATALOGO,
    };
    setFiltros(next);
    setPage(1);
  };

  // Limpia el término de búsqueda y vuelve al catálogo completo
  const limpiarBusqueda = () => {
    navigate(RUTAS.CATALOGO);
  };

  const totalProductos = totalItems;
  const desde = totalProductos === 0 ? 0 : (page - 1) * PAGINA_TAMANO_CATALOGO + 1;
  const hasta = Math.min(page * PAGINA_TAMANO_CATALOGO, totalProductos);

  // CU-08: estamos en modo búsqueda si hay un query no vacío
  const enModoBusqueda = Boolean(queryParam);
  const sinResultados = !cargando && totalProductos === 0;

  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Productos" />
      <FilterPanel
        open={filterOpen}
        filtros={filtros}
        onApply={handleApplyFiltros}
        onClose={() => setFilterOpen(false)}
      />
      <main className="flex flex-col gap-12 px-12 py-20">
        <section className="flex flex-col gap-12">
          {/* Heading: cambia según si hay búsqueda activa o no */}
          <div className="flex flex-col gap-3 self-stretch">
            {enModoBusqueda ? (
              <>
                <h1 className="text-[40px] font-extrabold leading-tight text-ink-900 md:text-[48px]">
                  Resultados para{' '}
                  <span className="text-brand-600">«{queryParam}»</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[16px] text-ink-700">
                    {cargando
                      ? 'Buscando…'
                      : sinResultados
                        ? 'Sin coincidencias.'
                        : `${totalProductos} ${totalProductos === 1 ? 'producto encontrado' : 'productos encontrados'}, ordenados por relevancia.`}
                  </p>
                  <button
                    onClick={limpiarBusqueda}
                    className="inline-flex items-center gap-1 rounded-full border border-ink-100 bg-white px-3 py-1 text-[13px] font-medium text-ink-700 hover:border-brand-500 hover:text-brand-600"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar búsqueda
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-[48px] font-extrabold leading-tight">
                  <span className="block text-ink-900">Catálogo de</span>
                  <span className="block text-brand-600">Productos</span>
                </h1>
                <p className="text-[18px] text-ink-700">
                  Explorando {totalProductos} productos únicos de los mejores
                  talleres.
                </p>
              </>
            )}
          </div>

          {/* Toolbar — se oculta si no hay resultados */}
          {!sinResultados && (
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <FilterButton onClick={() => setFilterOpen(true)} />
                <SortSelect
                  value={sort}
                  onChange={setSort}
                  options={SORT_OPTIONS_DEFAULT}
                />
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                compact
              />
            </div>
          )}

          {/* Grid de resultados | skeleton | empty state */}
          {cargando ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: PAGINA_TAMANO_CATALOGO }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-white"
                />
              ))}
            </div>
          ) : sinResultados ? (
            /* CU-08: control de mensajes informativos en caso de cero coincidencias */
            <EmptyState
              icon={SearchX}
              title={
                enModoBusqueda
                  ? `No encontramos resultados para «${queryParam}»`
                  : 'Ningún producto coincide con los filtros'
              }
              description={
                enModoBusqueda
                  ? 'Prueba con otras palabras clave, revisa la ortografía o explora el catálogo completo.'
                  : 'Prueba ajustando los filtros para ver más resultados.'
              }
              action={
                enModoBusqueda ? (
                  <button
                    onClick={limpiarBusqueda}
                    className="rounded-lg bg-brand-500 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-brand-600"
                  >
                    Ver todo el catálogo
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyFiltros(FILTROS_VACIOS)}
                    className="rounded-lg border border-brand-500 bg-white px-5 py-2.5 text-[14px] font-medium text-brand-600 hover:bg-brand-50"
                  >
                    Limpiar filtros
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {productos.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>

              <div className="flex justify-between">
                <span className="hidden self-center text-[14px] text-ink-500 md:inline">
                  Mostrando {desde}-{hasta} de {totalProductos}
                </span>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
                <span className="hidden md:inline" />
              </div>
            </>
          )}
        </section>
      </main>

      <section className="px-12 pb-10">
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#AD225E] to-[#CF2F77] px-6 py-8 md:px-8 md:py-10">
          <div className="max-w-none">
            <h2 className="whitespace-nowrap text-[40px] font-extrabold leading-tight text-white">
              ¿Listo para tu Cotización Personalizada?
            </h2>

            <p className="mt-2 whitespace-nowrap text-[16px] text-white/85">
              Solicita tu cotización para productos exclusivos y personalizados.
              ¡Te damos el mejor precio a medida de tus necesidades!
            </p>

            <button className="mt-5 inline-flex h-11 items-center rounded-md bg-white px-5 text-[16px] font-semibold text-[#AD225E] hover:bg-white/95">
              Cotiza ahora
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

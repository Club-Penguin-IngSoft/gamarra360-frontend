import { useState } from 'react';
import { ListFilter } from 'lucide-react';

import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import SortSelect, { SORT_OPTIONS_DEFAULT } from '../components/SortSelect';
import ProductCard from '../components/ProductCard';
import { PAGINA_TAMANO_CATALOGO } from '../constants';
import type { IFiltrosCatalogo } from '../types/IFiltro';
import { FILTROS_VACIOS } from '../types/IFiltro';
import { useCatalogo } from '../hooks/useCatalogo';

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

export default function CatalogoPage() {
  const [sort, setSort]             = useState(SORT_OPTIONS_DEFAULT[0]);
  const [page, setPage]             = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros]       = useState<IFiltrosCatalogo>(FILTROS_VACIOS);

  const hayFiltrosReales =
    (filtros.categorias && filtros.categorias.length > 0) ||
    filtros.tipoServicio ||
    filtros.precioMin ||
    filtros.precioMax;

  const filtrosParaHook = hayFiltrosReales ? filtros : undefined;

  // El hook ya devuelve IProducto[] completamente adaptados desde el service.
  // NO hay que volver a mapear aquí.
  const { productos, totalPaginas, totalElementos, cargando, error } = useCatalogo(
    filtrosParaHook,
    page,
    PAGINA_TAMANO_CATALOGO,
  );

  const handleChangeFiltros = (f: IFiltrosCatalogo) => {
    setFiltros(f);
    setPage(1);
  };
  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  // Ordenamiento client-side sobre los productos ya adaptados
  const productosSorted = [...(productos ?? [])].sort((a, b) => {
    const pa = a.precioFinal ?? a.precioBase ?? Infinity;
    const pb = b.precioFinal ?? b.precioBase ?? Infinity;
    if (sort === SORT_OPTIONS_DEFAULT[1]) return pa - pb;          // Menor precio
    if (sort === SORT_OPTIONS_DEFAULT[2]) return pb - pa;          // Mayor precio
    return Number(b.id) - Number(a.id);                           // Lo más reciente → ID desc
  });

  const desde = totalElementos === 0 ? 0 : (page - 1) * PAGINA_TAMANO_CATALOGO + 1;
  const hasta = Math.min(page * PAGINA_TAMANO_CATALOGO, totalElementos);

  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Productos" />
      <FilterPanel
        open={filterOpen}
        filtros={filtros}
        onChange={handleChangeFiltros}
        onClose={() => setFilterOpen(false)}
      />
      <main className="flex flex-col gap-12 px-12 py-20">
        <section className="flex flex-col gap-12">

          <div className="flex flex-col gap-2 self-stretch">
            <h1 className="text-[48px] font-extrabold leading-tight">
              <span className="block text-ink-900">Catálogo de</span>
              <span className="block text-brand-600">Productos</span>
            </h1>
            <p className="text-[18px] text-ink-700">
              Explorando {totalElementos} productos únicos de los mejores talleres de Gamarra.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <FilterButton onClick={() => setFilterOpen(true)} />
              <SortSelect value={sort} onChange={handleSort} options={SORT_OPTIONS_DEFAULT} />
            </div>
            <Pagination page={page} totalPages={totalPaginas} onChange={setPage} compact />
          </div>

          {/* Error de red o del servidor */}
          {!cargando && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-[15px] font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Sin resultados */}
          {!cargando && !error && productosSorted.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-white py-20 text-center">
              <p className="text-[16px] text-ink-500">
                No se encontraron productos para los filtros seleccionados.
              </p>
            </div>
          )}

          {/* Grilla */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cargando
              ? Array.from({ length: PAGINA_TAMANO_CATALOGO }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-xl border border-ink-100 bg-white shadow-sm"
                  />
                ))
              : productosSorted.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
          </div>

          <div className="flex justify-between mt-4">
            <span className="hidden self-center text-[14px] text-ink-500 md:inline">
              Mostrando {desde}–{hasta} de {totalElementos}
            </span>
            <Pagination page={page} totalPages={totalPaginas} onChange={setPage} />
            <span className="hidden md:inline" />
          </div>

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
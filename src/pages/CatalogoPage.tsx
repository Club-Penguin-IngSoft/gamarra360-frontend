import { useState, useEffect } from 'react';
import { ListFilter, AlertTriangle } from 'lucide-react';

// Componentes de la Interfaz (Tu versión)
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import SortSelect, { SORT_OPTIONS_DEFAULT } from '../components/SortSelect';
import ProductCard from '../components/ProductCard';
import { PAGINA_TAMANO_CATALOGO } from '../constants';
import type { IFiltrosCatalogo } from '../types/IFiltro';
import { FILTROS_VACIOS } from '../types/IFiltro';

// Servicios de Backend y Tipos (Versión de John)

import type { IProducto } from '../types/IProducto';

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

/* ---------------------------------- Page --------------------------------- */

export default function CatalogoPage() {
  // --- Estados de la Interfaz (Tuyos) ---
  const [sort, setSort] = useState(SORT_OPTIONS_DEFAULT[0]);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState<IFiltrosCatalogo>(FILTROS_VACIOS);

  // --- Estados del Backend (De John) ---
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Conexión a la Base de Datos AWS (De John) ---
  useEffect(() => {
    const cargarProductosDesdeAWS = async () => {
      try {
        setCargando(true);
        setError(null);
        const datos = await productoService.obtenerTodos();
        
        // Adaptador de Backend a Frontend
        const productosAdaptados: IProducto[] = datos.map((item: any) => ({
          id: String(item.idProducto), 
          titulo: item.nombre || 'Producto sin título',
          descripcion: item.descripcion || '',
          idComerciante: String(item.idTienda || '1'),
          nombreTienda: item.nombreTienda || `Tienda N° ${item.idTienda || '1'}`,
          categoria: 'UNISEX_ADULTOS', 
          tipoServicio: item.esPersonalizable ? 'PERSONALIZABLE' : 'COMPRA_DIRECTA', 
          precioBase: item.precioBase,
          precioFinal: item.precioBase, 
          imagenes: item.imagenes ? item.imagenes.map((img: any) => img.url) : [],
          variantes: [],
          especificaciones: []
        }));

        setProductos(productosAdaptados);
      } catch (err: any) {
        console.error("Error al traer productos de AWS:", err);
        setError(err.response?.data?.mensaje || "No se pudieron cargar los productos. Verifica tu conexión.");
      } finally {
        setCargando(false);
      }
    };

    cargarProductosDesdeAWS();
  }, []); // Se ejecuta una vez al montar el componente

  // --- Lógica de Paginación y Filtros (Tuya) ---
  const handleChangeFiltros = (f: IFiltrosCatalogo) => {
    setFiltros(f);
    setPage(1);
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  // Ordenamiento local (Menor/Mayor precio)
  const productosSorted = [...productos].sort((a, b) => {
    const pa = a.precioFinal ?? a.precioBase ?? Infinity;
    const pb = b.precioFinal ?? b.precioBase ?? Infinity;
    if (sort === SORT_OPTIONS_DEFAULT[1]) return pa - pb; 
    if (sort === SORT_OPTIONS_DEFAULT[2]) return pb - pa; 
    return 0; 
  });

  const totalProductos = productosSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalProductos / PAGINA_TAMANO_CATALOGO));
  const desde = (page - 1) * PAGINA_TAMANO_CATALOGO + 1;
  const hasta = Math.min(page * PAGINA_TAMANO_CATALOGO, totalProductos);
  const productosPagina = productosSorted.slice(
    (page - 1) * PAGINA_TAMANO_CATALOGO,
    page * PAGINA_TAMANO_CATALOGO,
  );

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
          
          {/* Cabecera del Catálogo */}
          <div className="flex flex-col gap-2 self-stretch">
            <h1 className="text-[48px] font-extrabold leading-tight">
              <span className="block text-ink-900">Catálogo de</span>
              <span className="block text-brand-600">Productos</span>
            </h1>
            <p className="text-[18px] text-ink-700">
              Explorando {totalProductos} productos únicos de los mejores talleres.
            </p>
          </div>

          {/* Controles: Botón Filtro, Selector de Orden y Paginador */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <FilterButton onClick={() => setFilterOpen(true)} />
              <SortSelect
                value={sort}
                onChange={handleSort}
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

          {/* Mensaje de Error de AWS (De John) */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-5 text-red-700 border border-red-200">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="font-bold text-[16px]">Error de comunicación</h3>
                <p className="text-[14px] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Mensaje de Base de Datos Vacía (De John) */}
          {!cargando && !error && productos.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl border-ink-200 bg-white">
              <p className="text-ink-500 text-[16px]">La conexión a AWS fue exitosa, pero la tabla de productos está vacía.</p>
            </div>
          )}

          {/* Grilla de Productos */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cargando
              ? Array.from({ length: PAGINA_TAMANO_CATALOGO }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-xl bg-white shadow-sm border border-ink-100"
                  />
                ))
              : productosPagina.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
          </div>

          {/* Paginación Inferior */}
          <div className="flex justify-between mt-4">
            <span className="hidden self-center text-[14px] text-ink-500 md:inline">
              Mostrando {totalProductos > 0 ? desde : 0}-{hasta} de {totalProductos}
            </span>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            <span className="hidden md:inline" />
          </div>
        </section>
      </main>

      {/* Banner Cotización (Tuyo) */}
      <section className="px-12 pb-10">
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#AD225E] to-[#CF2F77] px-6 py-8 md:px-8 md:py-10 shadow-md">
          <div className="max-w-none">
            <h2 className="whitespace-nowrap text-[40px] font-extrabold leading-tight text-white">
              ¿Listo para tu Cotización Personalizada?
            </h2>
            <p className="mt-2 whitespace-nowrap text-[16px] text-white/85">
              Solicita tu cotización para productos exclusivos y personalizados.
              ¡Te damos el mejor precio a medida de tus necesidades!
            </p>
            <button className="mt-5 inline-flex h-11 items-center rounded-md bg-white px-5 text-[16px] font-semibold text-[#AD225E] hover:bg-white/95 transition-colors">
              Cotiza ahora
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
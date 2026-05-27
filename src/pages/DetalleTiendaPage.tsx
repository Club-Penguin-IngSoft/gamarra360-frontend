/**
 * Detalle de Tienda — Figma nodes 2428-14120, 2428-14976, 2428-15579.
 *
 * Página adaptativa: muestra distintos bloques según los `tiposServicio`
 * que ofrece la tienda. Posibles combinaciones:
 *
 *  - Solo COTIZACION              → Hero + bloque "Servicio bajo cotización" + tags "Especialistas en..."
 *  - Solo COMPRA_DIRECTA / PERS.  → Hero + sección Catálogo (toolbar + grid)
 *  - Ambos                         → Hero + cotización + catálogo
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  ListFilter,
  MapPin,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import FilterPanel, { aplicarFiltrosCliente } from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import SortSelect, { SORT_OPTIONS_DEFAULT } from '../components/SortSelect';
import ProductCard from '../components/ProductCard';
import TagPill from '../components/TagPill';
import EmptyState from '../components/EmptyState';
import { Package } from 'lucide-react';
import { RUTAS } from '../constants/rutas';
import { useTienda } from '../hooks/useTienda';
import { listarProductosDeTienda } from '../services/catalogoService';
import type { ITienda } from '../types/ITienda';
import { ETIQUETA_GALERIA } from '../types/ITienda';
import type { IProducto } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';
import { FILTROS_VACIOS } from '../types/IFiltro';

const PRODUCTOS_POR_PAGINA = 8;

/* ============================== Breadcrumb ============================= */

function Breadcrumb({ tienda }: { tienda: ITienda }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 rounded-md p-1"
    >
      <Link
        to={RUTAS.INICIO}
        className="rounded px-2 py-1 text-[14px] text-ink-500 hover:text-brand-500"
      >
        Inicio
      </Link>
      <ChevronRight className="h-4 w-4 text-ink-500" />
      <Link
        to={RUTAS.TIENDAS}
        className="rounded px-2 py-1 text-[14px] text-ink-500 hover:text-brand-500"
      >
        Tiendas
      </Link>
      <ChevronRight className="h-4 w-4 text-ink-500" />
      <span className="rounded px-2 py-1 text-[15px] font-semibold text-brand-600">
        {tienda.nombre}
      </span>
    </nav>
  );
}

/* =============================== Brand Hero ============================ */

function BrandHero({ tienda }: { tienda: ITienda }) {
  // Iniciales del logo (ej. "Vidal & Co." → "V&C", "Estilo Killa" → "EK")
  const iniciales = tienda.nombre
    .split(/\s+/)
    .filter((w) => w.length > 0 && w !== 'de' && w !== 'del')
    .slice(0, 3)
    .map((w) => w[0]!.toUpperCase())
    .join('');

  const ubicacion =
    tienda.galeria && tienda.direccion
      ? `${ETIQUETA_GALERIA[tienda.galeria]}, ${tienda.direccion}`
      : tienda.galeria
        ? ETIQUETA_GALERIA[tienda.galeria]
        : tienda.direccion ?? '';

  return (
    <section className="relative overflow-hidden rounded-xl bg-ink-800 text-white">
      {/* Imagen sutil de fondo */}
      <img
        src={tienda.logo}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-15"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-800 via-ink-800/95 to-ink-800/70" />

      <div className="relative flex flex-col gap-8 p-12 md:flex-row md:items-center">
        {/* Logo cuadrado con iniciales sobre la foto real de la tienda */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 md:h-32 md:w-32">
          <img
            src={tienda.logo}
            alt={`Logo ${tienda.nombre}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-[28px] font-bold tracking-tight text-white md:text-[34px]">
              {iniciales}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {/* Tags */}
          {tienda.tiposServicio && tienda.tiposServicio.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tienda.tiposServicio.map((ts) => (
                <TagPill key={ts} producto={{ tipoServicio: ts }} size="lg" />
              ))}
            </div>
          )}

          {/* Nombre */}
          <h1 className="text-[40px] font-bold leading-tight md:text-[48px]">
            {tienda.nombre}
          </h1>

          {/* Ubicación */}
          {ubicacion && (
            <div className="flex items-center gap-2 text-[14px] text-white/80">
              <MapPin className="h-4 w-4" />
              <span>{ubicacion}</span>
            </div>
          )}

          {/* Descripción larga */}
          {tienda.descripcionLarga && (
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-white/90">
              {tienda.descripcionLarga}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ====================== Sección: Servicio bajo Cotización =============== */

function CotizacionSection({ tienda }: { tienda: ITienda }) {
  // Si la tienda tiene info personalizada de servicio, úsala. Si no, defaults.
  const servicio = tienda.servicioCotizacion ?? {
    titulo: 'Servicio bajo Cotización',
    descripcion:
      'Confeccionamos según tus especificaciones. Cuéntanos qué necesitas y te enviaremos una propuesta personalizada.',
    imagen: tienda.logo,
  };

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Card principal: Servicio destacado */}
      <article className="overflow-hidden rounded-xl border border-ink-50 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Lado izquierdo: texto + CTA */}
          <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
            <span className="text-[12px] font-bold tracking-[0.1em] text-brand-600">
              EXPERIENCIA
            </span>
            <h2 className="text-[24px] font-semibold leading-tight text-ink-900">
              {servicio.titulo}
            </h2>
            <p className="text-[15px] leading-relaxed text-ink-700">
              {servicio.descripcion}
            </p>
            <button className="mt-2 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-600">
              Solicitar cotización
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Lado derecho: imagen */}
          <div className="aspect-[4/3] overflow-hidden bg-surface-muted md:aspect-auto">
            <img
              src={servicio.imagen}
              alt={servicio.titulo}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </article>

      {/* Card secundaria: Especialistas en... */}
      {tienda.tiposProducto && tienda.tiposProducto.length > 0 && (
        <article className="flex flex-col gap-4 rounded-xl border border-ink-50 bg-white p-6 md:p-8">
          <h3 className="text-[20px] font-semibold text-ink-900">
            Especialistas en...
          </h3>
          <div className="flex flex-wrap gap-2">
            {tienda.tiposProducto.map((tp) => (
              <span
                key={tp}
                className="rounded-md border border-ink-100 px-3 py-1.5 text-[13px] font-medium text-ink-700"
              >
                {tp}
              </span>
            ))}
          </div>
        </article>
      )}
    </section>
  );
}


/* ========================== Catálogo Section ========================== */

function CatalogoSection({
  productos,
}: {
  productos: IProducto[];
}) {
  const [sort, setSort] = useState(SORT_OPTIONS_DEFAULT[0]);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState<IFiltrosCatalogo>(FILTROS_VACIOS);

  // Filtrado client-side sobre los productos de ESTA tienda
  const productosFiltrados = useMemo(
    () => aplicarFiltrosCliente(productos, filtros),
    [productos, filtros],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA),
  );
  const productosPagina = productosFiltrados.slice(
    (page - 1) * PRODUCTOS_POR_PAGINA,
    page * PRODUCTOS_POR_PAGINA,
  );

  const handleChangeFiltros = (f: IFiltrosCatalogo) => {
    setFiltros(f);
    setPage(1); // resetear paginación al filtrar
  };

  return (
    <section className="flex flex-col gap-6">
      {/* FilterPanel — drawer compartido */}
      <FilterPanel
        open={filterOpen}
        filtros={filtros}
        onChange={handleChangeFiltros}
        onClose={() => setFilterOpen(false)}
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-[32px] font-bold text-ink-900">Catálogo</h2>
        <p className="text-[15px] text-ink-500">
          Explorando {productosFiltrados.length}{' '}
          {productosFiltrados.length === 1 ? 'producto único' : 'productos únicos'}{' '}
          de la tienda.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-brand-500 bg-white px-6 text-[15px] font-medium text-brand-600 hover:bg-brand-50"
          >
            <ListFilter className="h-4 w-4" />
            Filtros
          </button>

          <SortSelect
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS_DEFAULT}
          />
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Grid */}
      {productosPagina.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            productos.length === 0
              ? 'Esta tienda aún no tiene productos en catálogo'
              : 'Ningún producto coincide con los filtros'
          }
          description={
            productos.length === 0
              ? 'Por ahora puedes contactarla directamente para solicitar una cotización.'
              : 'Prueba ajustando los filtros para ver más resultados.'
          }
          action={
            productos.length > 0 ? (
              <button
                onClick={() => handleChangeFiltros(FILTROS_VACIOS)}
                className="rounded-lg border border-brand-500 bg-white px-5 py-2.5 text-[14px] font-medium text-brand-600 hover:bg-brand-50"
              >
                Limpiar filtros
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productosPagina.map((p) => (
            <ProductCard key={p.id} producto={p} variant="compact" />
          ))}
        </div>
      )}

      {/* Bottom pagination */}
      {productosPagina.length > 0 && (
        <div className="flex justify-between">
          <span className="hidden self-center text-[14px] text-ink-500 md:inline">
            Mostrando {(page - 1) * PRODUCTOS_POR_PAGINA + 1}–
            {Math.min(page * PRODUCTOS_POR_PAGINA, productosFiltrados.length)} de{' '}
            {productosFiltrados.length}
          </span>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          <span className="hidden md:inline" />
        </div>
      )}
    </section>
  );
}

/* =============================== Page ================================= */

export default function DetalleTiendaPage() {
  const { id } = useParams<{ id: string }>();
  const { tienda, cargando, error } = useTienda(id);
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  useEffect(() => {
    if (!id) return;
    setCargandoProductos(true);
    listarProductosDeTienda(id)
      .then(setProductos)
      .finally(() => setCargandoProductos(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <TopBar active="Tiendas" />
        <main className="flex flex-1 items-center justify-center px-12 py-24">
          <span className="text-[18px] text-ink-500">Cargando tienda...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tienda) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <TopBar active="Tiendas" />
        <main className="flex flex-col items-center justify-center gap-4 px-12 py-24 text-center">
          <h1 className="text-3xl font-bold text-ink-900">
            Tienda no encontrada
          </h1>
          <p className="text-ink-500">
            {error ?? 'Esta tienda no existe o ya no está disponible.'}
          </p>
          <Link
            to={RUTAS.TIENDAS}
            className="rounded-lg bg-brand-500 px-6 py-3 text-[15px] font-medium text-white hover:bg-brand-600"
          >
            Volver al directorio
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  /* -----------------------------------------------------------------
   * Decisiones de qué mostrar — basadas en `tiposServicio` de la tienda
   * y NO en el conteo de productos (un comerciante con productos pendientes
   * de publicar igual ofrece catálogo).
   *
   *   Solo COTIZACION                  → solo bloque cotización
   *   Solo COMPRA_DIRECTA/PERSONALIZABLE → solo catálogo
   *   Ambos                             → cotización + catálogo
   * ----------------------------------------------------------------- */
  const tipos = tienda.tiposServicio ?? [];
  const ofreceCotizacion = tipos.includes('COTIZACION');
  const ofreceCatalogo =
    tipos.includes('COMPRA_DIRECTA') || tipos.includes('PERSONALIZABLE');

  // Para el catálogo solo mostramos productos que NO sean cotización
  const productosCatalogo = productos.filter(
    (p) => p.tipoServicio !== 'COTIZACION',
  );

  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Tiendas" />
      <main className="flex flex-col gap-10 px-12 py-12">
        <Breadcrumb tienda={tienda} />
        <BrandHero tienda={tienda} />

        {ofreceCotizacion && <CotizacionSection tienda={tienda} />}

        {ofreceCatalogo && (
          cargandoProductos ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-white"
                />
              ))}
            </div>
          ) : (
            <CatalogoSection productos={productosCatalogo} />
          )
        )}
      </main>
      <Footer />
    </div>
  );
}

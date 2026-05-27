/**
 * Directorio de Tiendas — Figma node 2295-5852.
 * Filtros laterales — Figma node 2295-5889.
 *
 * Sigue el mismo patrón del `CatalogoPage` (drawer lateral de filtros con
 * acordeones) pero con secciones específicas para tiendas:
 *  - Categoría
 *  - Tipo de Producto
 *  - Tipo de Servicio
 *  - Galería
 *
 * NO incluye color/material/talla/precio porque son atributos del producto,
 * no del comercio.
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ChevronDown,
  ListFilter,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import StoreCard from '../components/StoreCard';
import EmptyState from '../components/EmptyState';
import { Store as StoreIcon } from 'lucide-react';
import { listarTiendas } from '../services/tiendaService';
import type { ITienda, GaleriaGamarra } from '../types/ITienda';
import { ETIQUETA_GALERIA } from '../types/ITienda';
import type { Categoria, TipoServicio } from '../types/IProducto';
import type { IFiltrosTiendas } from '../types/IFiltro';
import { FILTROS_TIENDAS_VACIOS } from '../types/IFiltro';

/* =========================================================================
   Constantes locales (etiquetas visibles para los selectables)
   ========================================================================= */

const CATEGORIAS_UI: { value: Categoria; label: string }[] = [
  { value: 'HOMBRE', label: 'Hombre' },
  { value: 'MUJER', label: 'Mujer' },
  { value: 'NINOS', label: 'Niños' },
  { value: 'UNISEX_ADULTOS', label: 'Unisex Adultos' },
  { value: 'UNISEX_NINOS', label: 'Unisex Niños' },
];

const TIPOS_PRODUCTO = [
  'Polos',
  'Blusas',
  'Pantalones',
  'Casacas',
  'Vestidos',
  'Pijamas',
  'Ropa Interior',
  'Ropa de Baño',
];

const TIPOS_SERVICIO_UI: { value: TipoServicio; label: string }[] = [
  { value: 'COMPRA_DIRECTA', label: 'Compra directa' },
  { value: 'PERSONALIZABLE', label: 'Personalizable' },
  { value: 'COTIZACION', label: 'Cotización' },
];

const GALERIAS_UI: { value: GaleriaGamarra; label: string }[] = (
  Object.keys(ETIQUETA_GALERIA) as GaleriaGamarra[]
).map((value) => ({ value, label: ETIQUETA_GALERIA[value] }));

const TIENDAS_POR_PAGINA = 9;

/* =========================================================================
   Filter Panel (sigue el patrón de CatalogoPage)
   ========================================================================= */

type SeccionFiltro = 'categoria' | 'producto' | 'servicio' | 'galeria';

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-ink-100 py-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[15px] font-semibold text-ink-900">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-ink-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className="mt-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-[13px] transition-colors ${
        active
          ? 'border-brand-500 bg-brand-50 text-brand-600'
          : 'border-ink-100 text-ink-700 hover:border-brand-500 hover:text-brand-600'
      }`}
    >
      {label}
    </button>
  );
}

function RadioOption({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[14px] text-ink-700">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-brand-500"
      />
      <span>{label}</span>
    </label>
  );
}

function GaleriaSelect({
  value,
  onChange,
}: {
  value: GaleriaGamarra | null;
  onChange: (v: GaleriaGamarra | null) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? (e.target.value as GaleriaGamarra) : null)
        }
        className="h-10 w-full appearance-none rounded-md border border-ink-100 bg-white px-3 pr-8 text-[14px] text-ink-700 focus:border-brand-500 focus:outline-none"
      >
        <option value="">Todas</option>
        {GALERIAS_UI.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
    </div>
  );
}

function TiendasFilterPanel({
  open,
  filtros,
  onChange,
  onClose,
}: {
  open: boolean;
  filtros: IFiltrosTiendas;
  onChange: (f: IFiltrosTiendas) => void;
  onClose: () => void;
}) {
  const [sections, setSections] = useState<Record<SeccionFiltro, boolean>>({
    categoria: true,
    producto: true,
    servicio: true,
    galeria: true,
  });

  const toggleSection = (k: SeccionFiltro) =>
    setSections((s) => ({ ...s, [k]: !s[k] }));

  const toggleCategoria = (c: Categoria) => {
    onChange({
      ...filtros,
      categorias: filtros.categorias.includes(c)
        ? filtros.categorias.filter((x) => x !== c)
        : [...filtros.categorias, c],
    });
  };

  const toggleTipoProducto = (t: string) => {
    onChange({
      ...filtros,
      tiposProducto: filtros.tiposProducto.includes(t)
        ? filtros.tiposProducto.filter((x) => x !== t)
        : [...filtros.tiposProducto, t],
    });
  };

  const limpiarTodo = () => {
    onChange(FILTROS_TIENDAS_VACIOS);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[300px] flex-col bg-white shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Filtros de tiendas"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50">
              <ListFilter className="h-4 w-4 text-brand-500" />
            </span>
            <h2 className="text-[18px] font-semibold text-ink-900">Filtros</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 transition-colors hover:text-ink-900"
            aria-label="Cerrar filtros"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Secciones scrollables */}
        <div className="flex-1 overflow-y-auto px-6">
          <FilterSection
            title="Categoría"
            open={sections.categoria}
            onToggle={() => toggleSection('categoria')}
          >
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_UI.map((c) => (
                <PillButton
                  key={c.value}
                  label={c.label}
                  active={filtros.categorias.includes(c.value)}
                  onClick={() => toggleCategoria(c.value)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            title="Tipo de Producto"
            open={sections.producto}
            onToggle={() => toggleSection('producto')}
          >
            <div className="flex flex-wrap gap-2">
              {TIPOS_PRODUCTO.map((t) => (
                <PillButton
                  key={t}
                  label={t}
                  active={filtros.tiposProducto.includes(t)}
                  onClick={() => toggleTipoProducto(t)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            title="Tipo de Servicio"
            open={sections.servicio}
            onToggle={() => toggleSection('servicio')}
          >
            {TIPOS_SERVICIO_UI.map((s) => (
              <RadioOption
                key={s.value}
                name="tipoServicio"
                label={s.label}
                checked={filtros.tipoServicio === s.value}
                onChange={() =>
                  onChange({ ...filtros, tipoServicio: s.value })
                }
              />
            ))}
          </FilterSection>

          <FilterSection
            title="Galería"
            open={sections.galeria}
            onToggle={() => toggleSection('galeria')}
          >
            <GaleriaSelect
              value={filtros.galeria}
              onChange={(g) => onChange({ ...filtros, galeria: g })}
            />
          </FilterSection>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col gap-2 border-t border-ink-100 p-6">
          <button
            onClick={onClose}
            className="h-11 rounded-lg bg-brand-500 text-[15px] font-medium text-white transition-colors hover:bg-brand-600"
          >
            Aplicar filtros
          </button>
          <button
            onClick={limpiarTodo}
            className="h-11 rounded-lg border border-brand-500 bg-white text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            Limpiar todo
          </button>
        </div>
      </aside>
    </>
  );
}


/* =========================================================================
   Page
   ========================================================================= */

export default function TiendasPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState<IFiltrosTiendas>(FILTROS_TIENDAS_VACIOS);
  const [tiendas, setTiendas] = useState<ITienda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [page, setPage] = useState(1);

  // Cargar tiendas al iniciar y cuando cambien los filtros
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    listarTiendas(filtros)
      .then((data) => {
        if (!cancelado) {
          setTiendas(data);
          setPage(1); // resetear paginación al filtrar
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [filtros]);

  const totalTiendas = tiendas.length;
  const totalPages = Math.max(1, Math.ceil(totalTiendas / TIENDAS_POR_PAGINA));
  const tiendasPagina = tiendas.slice(
    (page - 1) * TIENDAS_POR_PAGINA,
    page * TIENDAS_POR_PAGINA,
  );

  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Tiendas" />
      <TiendasFilterPanel
        open={filterOpen}
        filtros={filtros}
        onChange={setFiltros}
        onClose={() => setFilterOpen(false)}
      />

      <main className="flex flex-col gap-12 px-12 py-20">
        <section className="flex flex-col gap-12">
          {/* Heading */}
          <div className="flex flex-col gap-3 self-stretch">
            <h1 className="text-[48px] font-extrabold leading-tight text-ink-900">
              <span className="block text-ink-900">Directorio de</span>
              <span className="block text-brand-600">Tiendas</span>
            </h1>
            <p className="max-w-full text-[18px] leading-relaxed text-ink-700">
              Explora el emporio comercial más grande de Sudamérica. Conecta con fabricantes directos, talleres de confección y las mejores galerías de moda.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-brand-500 bg-white px-6 text-[15px] font-medium text-brand-600 hover:bg-brand-50"
            >
              <ListFilter className="h-4 w-4" />
              Filtros
            </button>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>

          {/* Grid */}
          {cargando ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: TIENDAS_POR_PAGINA }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-white"
                />
              ))}
            </div>
          ) : tiendasPagina.length === 0 ? (
            <EmptyState
              icon={StoreIcon}
              title="No se encontraron tiendas"
              description="Prueba ajustando los filtros para ver más resultados."
              action={
                <button
                  onClick={() => setFiltros(FILTROS_TIENDAS_VACIOS)}
                  className="rounded-lg border border-brand-500 bg-white px-5 py-2.5 text-[14px] font-medium text-brand-600 hover:bg-brand-50"
                >
                  Limpiar filtros
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tiendasPagina.map((t) => (
                <StoreCard key={t.id} tienda={t} />
              ))}
            </div>
          )}

          {/* Bottom pagination */}
          {!cargando && tiendasPagina.length > 0 && (
            <div className="flex justify-between">
              <span className="hidden self-center text-[14px] text-ink-500 md:inline">
                Mostrando {(page - 1) * TIENDAS_POR_PAGINA + 1}–
                {Math.min(page * TIENDAS_POR_PAGINA, totalTiendas)} de{' '}
                {totalTiendas}
              </span>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
              <span className="hidden md:inline" />
            </div>
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

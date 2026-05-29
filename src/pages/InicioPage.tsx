import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import customBadgeIcon from '../assets/images/verified-logo.svg';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import { RUTAS } from '../constants/rutas';
import { listarProductosPaginados } from '../services/catalogoService';
import { listarTiendasDestacadas } from '../services/tiendaService';
import type { ITienda } from '../types/ITienda';
import type { IProducto, Categoria } from '../types/IProducto';

/** Pseudo-categoría visible en UI — incluye "TODO" además de los enums del backend */
type CategoriaUI =
  | 'TODO'
  | 'HOMBRE'
  | 'MUJER'
  | 'NIÑOS'
  | 'UNISEX ADULTOS';

const CATEGORIAS_UI: CategoriaUI[] = [
  'TODO',
  'HOMBRE',
  'MUJER',
  'NIÑOS',
  'UNISEX ADULTOS',
];

/** Mapeo de la etiqueta visual al enum del backend */
const CAT_MAP: Record<CategoriaUI, Categoria | null> = {
  TODO: null,
  HOMBRE: 'HOMBRE',
  MUJER: 'MUJER',
  NIÑOS: 'NINOS',
  'UNISEX ADULTOS': 'UNISEX_ADULTOS',
};

/* ── Rotación diaria ─────────────────────────────────────────────────────── */

/** Genera un número entero a partir de la fecha actual (YYYYMMDD). */
function semillaDelDia(): number {
  const hoy = new Date();
  return (
    hoy.getFullYear() * 10000 +
    (hoy.getMonth() + 1) * 100 +
    hoy.getDate()
  );
}

/**
 * Fisher-Yates determinista con LCG. Dado el mismo `seed` siempre
 * produce el mismo orden, pero cambia cada día.
 */
function shuffleDiario<T>(arr: T[], seed: number): T[] {
  const copia = [...arr];
  let s = seed;
  for (let i = copia.length - 1; i > 0; i--) {
    s = Math.imul(s, 1664525) + 1013904223;
    const j = Math.abs(s) % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* --------------------------------- Hero ---------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-muted/50 via-surface-muted to-surface-muted" />

      <div className="relative flex min-h-[420px] items-center justify-center px-6 py-[120px]">
        <h1 className="text-center text-5xl font-bold leading-[1.1] text-ink-900 md:text-6xl">
          Todo lo que buscas,
          <br />
          solo en <span className="text-brand-500">Gamarra</span>
        </h1>
      </div>
    </section>
  );
}

/* ----------------------------- Section Header ---------------------------- */

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-3 self-stretch">
      <span className="text-[16px] font-bold uppercase tracking-[0.08em] text-brand-700">
        {eyebrow}
      </span>
      <h2 className="text-3xl font-bold text-ink-800 md:text-4xl">{title}</h2>
    </div>
  );
}

/* ----------------------------- Category Tags ----------------------------- */

function CategoryTags({
  active,
  onChange,
}: {
  active: CategoriaUI;
  onChange: (c: CategoriaUI) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {CATEGORIAS_UI.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-ink-900 text-white'
                : 'bg-surface-tag text-ink-700 hover:bg-ink-100'
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------- Catálogo Global ----------------------------- */

function CatalogoGlobal() {
  const [categoria, setCategoria] = useState<CategoriaUI>('TODO');
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [cargando, setCargando] = useState(true);

  // Carga solo 20 productos al inicio — suficiente para mezclar y mostrar 4
  useEffect(() => {
    setCargando(true);
    listarProductosPaginados(0, 20)
      .then(({ contenido }) => setProductos(contenido))
      .finally(() => setCargando(false));
  }, []);

  // Filtra por categoría, rota diariamente y muestra 4
  const categoriaMapeada = CAT_MAP[categoria];
  const filtrados = categoriaMapeada
    ? productos.filter((p) => p.categoria === categoriaMapeada)
    : productos;
  const destacados = shuffleDiario(filtrados, semillaDelDia()).slice(0, 4);

  return (
    <section className="flex flex-col gap-8 px-12 py-12">
      <div className="flex flex-col gap-6">
        <SectionHeader
          eyebrow="Catálogo"
          title="Descubre Productos de Todo Gamarra"
        />
        <CategoryTags active={categoria} onChange={setCategoria} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cargando
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-xl bg-surface-muted"
              />
            ))
          : destacados.map((p) => <ProductCard key={p.id} producto={p} />)}
      </div>

      <div className="flex justify-center pt-2">
        <Link
          to={RUTAS.CATALOGO}
          className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-600 transition-opacity hover:opacity-80"
        >
          Ver todos los productos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}


/* ------------------------------ Directorio ------------------------------- */

function Directorio() {
  const [tiendas, setTiendas] = useState<ITienda[]>([]);

  useEffect(() => {
    listarTiendasDestacadas().then((data) =>
      setTiendas(shuffleDiario(data, semillaDelDia())),
    );
  }, []);

  return (
    <section
      className="flex flex-col gap-8 px-12 py-12"
      style={{ backgroundColor: 'rgba(240, 241, 243, 0.3)' }}
    >
      <SectionHeader eyebrow="Directorio" title="Tiendas de Moda Destacadas" />
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {tiendas.map((t) => (
          <StoreCard key={t.id} tienda={t} variant="compact" />
        ))}
      </div>
      <div className="flex justify-center pt-2">
        <Link
          to={RUTAS.TIENDAS}
          className="inline-flex items-center gap-2 text-[15px] font-medium text-brand-600 transition-opacity hover:opacity-80"
        >
          Ver todas las tiendas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* --------------------------- SpecialOrdersCTA ---------------------------- */

function SpecialOrdersCTA() {
  return (
    <section className="relative overflow-hidden px-12 py-16">
      <div className="absolute inset-0 bg-[#2F343E]" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(120% 80% at 10% 120%, transparent 60%, rgba(255,255,255,0.10) 61%, transparent 62%),
            radial-gradient(130% 90% at 20% 120%, transparent 62%, rgba(255,255,255,0.08) 63%, transparent 64%),
            radial-gradient(140% 100% at 30% 120%, transparent 64%, rgba(255,255,255,0.07) 65%, transparent 66%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2F343E] via-[#2F343E]/95 to-[#343A46]" />

      <div className="relative max-w-6xl">
        <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#D34C82]">
          Cotizaciones y pedidos especiales
        </span>

        <h2 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
          ¿Buscas un pedido a medida o por volumen?
        </h2>

        <p className="mt-4 max-w-[1300px] text-[16px] leading-relaxed text-white/75">
          Conectamos directamente con los mejores talleres y fabricantes de
          Gamarra.
          <br />
          Solicita cotizaciones personalizadas tanto para producciones a gran
          escala como para pedidos individuales de alta gama o diseños a medida.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600">
            Solicitar cotización
          </button>

          <button className="inline-flex items-center justify-center rounded-lg bg-white/10 px-8 py-4 text-[15px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15">
            Saber más
          </button>

          <span className="ml-2 inline-flex items-center gap-2 text-[16px] text-white/65">
            <img
              src={customBadgeIcon}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 object-contain"
            />
            Desde una unidad hasta producciones masivas
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Merchant CTA ------------------------------- */

function MerchantCTA() {
  return (
    <section className="relative overflow-hidden bg-brand-900 px-12 py-20">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(-90deg, rgba(185, 0, 55, 0.2) 0%, rgba(185, 0, 55, 0) 100%)',
        }}
      />
      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            ¿Tienes una tienda en Gamarra?
          </h2>
          <p className="max-w-lg text-[18px] leading-relaxed text-ink-400">
            Únete a la plataforma que está digitalizando el emporio comercial de
            moda más grande de Sudamérica. Conecta con miles de clientes hoy.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={RUTAS.REGISTRO_COMERCIANTE}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-[18px] text-[15px] font-medium text-white transition-colors hover:bg-brand-600"
            >
              Empezar a vender
            </Link>
            <Link
              to={RUTAS.VENDER}
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-8 py-[18px] text-[15px] font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
            >
              Saber más
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80"
            alt="Tiendas en Gamarra"
            className="rounded-3xl shadow-2xl ring-1 ring-white/10"
          />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function InicioPage() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Inicio" />
      <main>
        <Hero />
        <CatalogoGlobal />
        <Directorio />
        <SpecialOrdersCTA />
        <MerchantCTA />
      </main>
      <Footer />
    </div>
  );
}

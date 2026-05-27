import { useEffect, useMemo, useState } from 'react';
import discountBadge from '../assets/images/etiqueta-descuento.svg';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Store as StoreIcon,
  Truck,
  ArrowRight,
  Brush,
  FileText,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import QuantityStepper from '../components/QuantityStepper';
import TagPill from '../components/TagPill';
import ProductCard from '../components/ProductCard';
import { RUTAS } from '../constants/rutas';
import { useProducto } from '../hooks/useProducto';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../hooks/useAuth';
import { listarProductosDeTienda } from '../services/catalogoService';
import { calcularDescuento, formatearPrecio } from '../utils/formatearPrecio';
import type {
  IProducto,
  IVarianteProducto,
  IEspecificacionProducto,
} from '../types/IProducto';

/* =========================================================================
   Subcomponentes compartidos
   ========================================================================= */

function Breadcrumb({ producto }: { producto: IProducto }) {
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
        to={RUTAS.CATALOGO}
        className="rounded px-2 py-1 text-[14px] text-ink-500 hover:text-brand-500"
      >
        Productos
      </Link>
      <ChevronRight className="h-4 w-4 text-ink-500" />
      <span className="rounded px-2 py-1 text-[15px] font-semibold text-brand-600">
        {producto.titulo}
      </span>
    </nav>
  );
}

function Heading({ producto }: { producto: IProducto }) {
  return (
    <div className="flex flex-col gap-4">
      <TagPill producto={producto} />
      <h1 className="text-[36px] font-bold leading-[1.15] text-ink-800 md:text-[40px]">
        {producto.titulo}
      </h1>
    </div>
  );
}

function PrecioBlock({ producto }: { producto: IProducto }) {
  const descuento = calcularDescuento(producto.precioBase, producto.precioFinal);
  const tieneDescuento = descuento > 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[32px] font-bold text-brand-600 md:text-[36px]">
          {formatearPrecio(producto.precioFinal)}
        </span>

        {tieneDescuento && (
          <div className="relative h-9 w-[80px] shrink-0">
            <img
              src={discountBadge}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold leading-none text-white">
              -{descuento}%
            </span>
          </div>
        )}
      </div>

      {tieneDescuento && (
        <span className="text-[20px] font-medium text-ink-500 line-through">
          {formatearPrecio(producto.precioBase)}
        </span>
      )}
    </div>
  );
}

function StoreCard({ producto }: { producto: IProducto }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-50 bg-white p-4">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80"
          alt={`Logo ${producto.nombreTienda}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[13px] text-ink-500">Vendido por</span>
        <span className="text-[16px] font-semibold text-ink-900">
          {producto.nombreTienda}
        </span>
      </div>
      <Link
        to={RUTAS.DETALLE_TIENDA(producto.idTienda)}
        className="inline-flex items-center text-[15px] font-medium text-brand-600 hover:text-brand-500"
      >
        Visitar tienda
      </Link>
    </div>
  );
}

function ColorSelector({
  colores,
  activo,
  onChange,
}: {
  colores: { name: string; hex: string }[];
  activo: number;
  onChange: (i: number) => void;
}) {
  if (colores.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[16px] font-bold tracking-[0.08em] text-ink-900">
          COLOR
        </span>
        <span className="text-[14px] uppercase text-ink-700">
          {colores[activo].name}
        </span>
      </div>
      <div className="flex gap-3">
        {colores.map((c, i) => (
          <button
            key={c.hex}
            onClick={() => onChange(i)}
            aria-label={c.name}
            aria-pressed={activo === i}
            style={{ backgroundColor: c.hex }}
            className={`h-10 w-10 rounded-full ring-offset-2 transition-shadow ${
              activo === i
                ? 'ring-2 ring-brand-500'
                : 'ring-1 ring-ink-100 hover:ring-ink-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function TallaSelector({
  tallas,
  activa,
  onChange,
}: {
  tallas: string[];
  activa: string;
  onChange: (t: string) => void;
}) {
  if (tallas.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-bold tracking-[0.08em] text-ink-900">
          TALLA
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {tallas.map((t) => {
          const isActive = t === activa;
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={`min-w-[56px] rounded-md px-6 py-2.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-500 hover:text-brand-600'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CantidadStepper({
  cantidad,
  onChange,
  stockRestante,
}: {
  cantidad: number;
  onChange: (n: number) => void;
  stockRestante: number;
}) {
  const stockBajo = stockRestante > 0 && stockRestante <= 5;
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[16px] font-bold tracking-[0.08em] text-ink-900">
        CANTIDAD
      </span>
      <div className="flex items-center justify-between gap-4">
        <QuantityStepper
          cantidad={cantidad}
          onChange={onChange}
          ariaLabel="Selector de cantidad de producto"
        />
        {stockBajo && (
          <span className="text-[14px] font-semibold text-brand-600">
            ¡ÚLTIMAS {stockRestante} UNIDADES!
          </span>
        )}
      </div>
    </div>
  );
}

function EntregaInfo({ mostrarRetiroEnTienda = true }: { mostrarRetiroEnTienda?: boolean }) {
  return (
    <div className="flex flex-col gap-3 border-t border-ink-100 pt-8">
      <span className="text-[12px] font-semibold tracking-[0.08em] text-ink-900">
        ENTREGA
      </span>
      <div className="flex items-center gap-2 text-[15px] text-ink-700">
        <Truck className="h-5 w-5 text-ink-500" />
        <span>Envío a domicilio</span>
      </div>
      {mostrarRetiroEnTienda && (
        <div className="flex items-center gap-2 text-[15px] text-ink-700">
          <StoreIcon className="h-5 w-5 text-ink-500" />
          <span>Retiro en tienda</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Hook: lógica de selección de variantes (color + talla + cantidad)
   ========================================================================= */

function useSeleccionVariante(producto: IProducto) {
  const colores = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string }>();
    producto.variantes?.forEach((v) => {
      if (v.color && v.colorHex && !seen.has(v.color)) {
        seen.set(v.color, { name: v.color, hex: v.colorHex });
      }
    });
    return Array.from(seen.values());
  }, [producto.variantes]);

  const tallas = useMemo(() => {
    const seen = new Set<string>();
    producto.variantes?.forEach((v) => v.talla && seen.add(v.talla));
    return Array.from(seen);
  }, [producto.variantes]);

  const [colorActivo, setColorActivo] = useState(0);
  const [tallaActiva, setTallaActiva] = useState<string>(
    tallas[1] ?? tallas[0] ?? '',
  );
  const [cantidad, setCantidad] = useState(1);

  const varianteSeleccionada: IVarianteProducto | undefined = useMemo(() => {
    return producto.variantes?.find(
      (v) => v.talla === tallaActiva && v.color === colores[colorActivo]?.name,
    );
  }, [producto.variantes, tallaActiva, colores, colorActivo]);

  return {
    colores,
    tallas,
    colorActivo,
    setColorActivo,
    tallaActiva,
    setTallaActiva,
    cantidad,
    setCantidad,
    varianteSeleccionada,
    stockRestante: varianteSeleccionada?.stock ?? 0,
  };
}

/* =========================================================================
   Layout 1: Producto COMPRA_DIRECTA (Figma 2357-5727)
   ========================================================================= */

function CompraDirectaInfo({ producto }: { producto: IProducto }) {
  const { agregarAlCarrito } = useCarrito();
  const s = useSeleccionVariante(producto);

  return (
    <div className="flex flex-col gap-8">
      <Heading producto={producto} />
      <PrecioBlock producto={producto} />
      <StoreCard producto={producto} />

      <div className="flex flex-col gap-6">
        <ColorSelector
          colores={s.colores}
          activo={s.colorActivo}
          onChange={s.setColorActivo}
        />
        <TallaSelector
          tallas={s.tallas}
          activa={s.tallaActiva}
          onChange={s.setTallaActiva}
        />
        <CantidadStepper
          cantidad={s.cantidad}
          onChange={s.setCantidad}
          stockRestante={s.stockRestante}
        />
      </div>

      <button
        onClick={() =>
          agregarAlCarrito(producto, s.cantidad, s.varianteSeleccionada?.id)
        }
        className="h-14 rounded-lg bg-brand-500 text-[16px] font-medium text-white transition-colors hover:bg-brand-600"
      >
        Añadir al carrito
      </button>

      <EntregaInfo />
    </div>
  );
}

/* =========================================================================
   Layout 2: Producto PERSONALIZABLE (Figma 2413-7951)
   ========================================================================= */

function PersonalizationPromoCard({ producto }: { producto: IProducto }) {
  const navigate = useNavigate();
  const { estaAutenticado } = useAuth();

  /**
   * Si el usuario está autenticado → va directo al formulario de personalización.
   * Si NO está autenticado → redirige a /login con returnTo apuntando al
   * formulario, así el flujo continúa después del login.
   */
  const handleSolicitar = () => {
    const destino = RUTAS.PERSONALIZAR(producto.id);
    if (estaAutenticado) {
      navigate(destino);
    } else {
      navigate(`${RUTAS.LOGIN}?returnTo=${encodeURIComponent(destino)}`);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 text-white"
      style={{
        backgroundImage:
          'linear-gradient(169deg, #A92D5F 0%, #ED7DA1 100%)',
      }}
    >
      {/* Decorative brush icon (top-right, partially clipped) */}
      <Brush
        className="absolute -right-4 -top-4 h-32 w-32 rotate-12 text-white/15"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4">
        <h3 className="text-[20px] font-bold leading-tight">
          ¿Quieres Personalizar tu Producto?
        </h3>
        <p className="text-[15px] leading-relaxed text-white/90">
          Elige entre estampado, bordado o impresión textil. Sube tu diseño o
          agrega un texto. Recuerda que esta opción tiene un{' '}
          <strong className="font-bold">costo adicional</strong> para un acabado
          premium.
        </p>
        <button
          onClick={handleSolicitar}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-brand-500 bg-white text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          Solicitar personalización
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PersonalizableInfo({ producto }: { producto: IProducto }) {
  const { agregarAlCarrito } = useCarrito();
  const s = useSeleccionVariante(producto);

  return (
    <div className="flex flex-col gap-8">
      <Heading producto={producto} />
      <PrecioBlock producto={producto} />
      <StoreCard producto={producto} />

      <div className="flex flex-col gap-6">
        <ColorSelector
          colores={s.colores}
          activo={s.colorActivo}
          onChange={s.setColorActivo}
        />
        <TallaSelector
          tallas={s.tallas}
          activa={s.tallaActiva}
          onChange={s.setTallaActiva}
        />
        <CantidadStepper
          cantidad={s.cantidad}
          onChange={s.setCantidad}
          stockRestante={s.stockRestante}
        />
      </div>

      {/* Card específica de PERSONALIZABLE — entre Cantidad y Añadir al carrito */}
      <PersonalizationPromoCard producto={producto} />

      <button
        onClick={() =>
          agregarAlCarrito(producto, s.cantidad, s.varianteSeleccionada?.id)
        }
        className="h-14 rounded-lg bg-brand-500 text-[16px] font-medium text-white transition-colors hover:bg-brand-600"
      >
        Añadir al carrito
      </button>

      {/* En PERSONALIZABLE el Figma solo muestra Envío a domicilio */}
      <EntregaInfo mostrarRetiroEnTienda={false} />
    </div>
  );
}

/* =========================================================================
   Layout 3: Producto COTIZACION (diseño específico pendiente)
   ========================================================================= */

function CotizacionInfo({ producto }: { producto: IProducto }) {
  return (
    <div className="flex flex-col gap-8">
      <Heading producto={producto} />

      {producto.descripcion && (
        <p className="text-[16px] leading-relaxed text-ink-700">
          {producto.descripcion}
        </p>
      )}

      <div className="flex items-baseline gap-3">
        <span className="text-[24px] italic font-medium text-ink-500">
          Bajo Pedido
        </span>
        <span className="text-[14px] text-ink-500">
          — precio según especificaciones
        </span>
      </div>

      <StoreCard producto={producto} />

      <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50 p-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-sky-700" />
          <h2 className="text-[16px] font-semibold text-ink-900">
            Vista de Cotización en construcción
          </h2>
        </div>
        <p className="text-[14px] leading-relaxed text-ink-700">
          Estamos preparando el flujo para enviar tu solicitud de cotización al
          comerciante con tus requerimientos específicos (cantidad, tallas,
          plazos, etc.).
        </p>
      </div>

      <Link
        to={RUTAS.CARRITO}
        className="flex h-14 items-center justify-center gap-2 rounded-lg bg-sky-700 text-[16px] font-medium text-white transition-colors hover:bg-sky-800"
      >
        <FileText className="h-5 w-5" />
        Solicitar cotización
      </Link>

      <EntregaInfo />
    </div>
  );
}

/* =========================================================================
   Gallery (compartida)
   ========================================================================= */

function Gallery({ imagenes, titulo }: { imagenes: string[]; titulo: string }) {
  const [active, setActive] = useState(0);
  const thumbs = imagenes.slice(0, 3);
  const mostrarThumbs = thumbs.length > 1;

  return (
    <div className="flex flex-row gap-4">
      {mostrarThumbs && (
        <div className="flex flex-col gap-4">
          {thumbs.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-20 w-20 overflow-hidden rounded-lg bg-white transition-all md:h-24 md:w-24 ${
                active === i
                  ? 'opacity-100 ring-2 ring-brand-500'
                  : 'opacity-60 ring-1 ring-ink-50 hover:opacity-90'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1">
        <div className="aspect-square overflow-hidden rounded-xl bg-surface-muted shadow-sm ring-1 ring-ink-50">
          <img
            src={imagenes[active]}
            alt={titulo}
            className="block h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Especificaciones (compartida COMPRA_DIRECTA + PERSONALIZABLE)
   ========================================================================= */

function Specifications({
  especificaciones,
}: {
  especificaciones?: IEspecificacionProducto[];
}) {
  if (!especificaciones || especificaciones.length === 0) return null;
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[24px] font-bold text-ink-900 md:text-[28px]">
        Especificaciones Técnicas
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {especificaciones.map((s) => (
          <div
            key={s.nombre}
            className="flex flex-col gap-2 rounded-lg border border-ink-50 bg-white p-4"
          >
            <span className="text-[11px] font-semibold tracking-[0.1em] text-ink-500">
              {s.nombre}
            </span>
            <span className="text-[15px] font-medium text-ink-900">
              {s.descripcion}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   Related Products (compartida)
   ========================================================================= */

function RelatedProducts({ producto }: { producto: IProducto }) {
  const [relacionados, setRelacionados] = useState<IProducto[]>([]);

  useEffect(() => {
    listarProductosDeTienda(producto.idTienda, producto.id).then(
      setRelacionados,
    );
  }, [producto.idTienda, producto.id]);

  if (relacionados.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-bold text-ink-800">
            Más de {producto.nombreTienda}
          </h2>
          <p className="text-[14px] text-ink-500">
            Otras piezas seleccionadas de esta tienda
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={RUTAS.TIENDAS}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 hover:bg-surface-muted"
            aria-label="Ver tienda (anterior)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <Link
            to={RUTAS.TIENDAS}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 hover:bg-surface-muted"
            aria-label="Ver tienda (siguiente)"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Productos relacionados */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relacionados.slice(0, 4).map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   Page
   ========================================================================= */

export default function DetalleProductoPage() {
  const { id } = useParams<{ id: string }>();
  const { producto, cargando, error } = useProducto(id);

  if (cargando) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <TopBar active="Productos" />
        <main className="flex flex-1 items-center justify-center px-12 py-24">
          <span className="text-[18px] text-ink-500">Cargando producto...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <TopBar active="Productos" />
        <main className="flex flex-col items-center justify-center gap-4 px-12 py-24 text-center">
          <h1 className="text-3xl font-bold text-ink-900">
            Producto no encontrado
          </h1>
          <p className="text-ink-500">
            {error ?? 'El producto que buscas no existe o ya no está disponible.'}
          </p>
          <Link
            to={RUTAS.CATALOGO}
            className="rounded-lg bg-brand-500 px-6 py-3 text-[15px] font-medium text-white hover:bg-brand-600"
          >
            Volver al catálogo
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Selecciona el layout según el tipo de servicio
  const InfoComponent = (() => {
    switch (producto.tipoServicio) {
      case 'COMPRA_DIRECTA':
        return CompraDirectaInfo;
      case 'PERSONALIZABLE':
        return PersonalizableInfo;
      case 'COTIZACION':
        return CotizacionInfo;
    }
  })();

  // Especificaciones técnicas se muestran para COMPRA_DIRECTA y PERSONALIZABLE
  const mostrarEspecificaciones =
    producto.tipoServicio === 'COMPRA_DIRECTA' ||
    producto.tipoServicio === 'PERSONALIZABLE';

  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Productos" />
      <main className="flex flex-col gap-16 px-12 py-12">
        <Breadcrumb producto={producto} />
        <div className="flex flex-col gap-10">
          <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Gallery imagenes={producto.imagenes} titulo={producto.titulo} />
            <InfoComponent producto={producto} />
          </section>
          {mostrarEspecificaciones && (
            <Specifications especificaciones={producto.especificaciones} />
          )}
          <RelatedProducts producto={producto} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

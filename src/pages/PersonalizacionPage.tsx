/**
 * Página de "Solicitar Personalización" — Figma node 2415-12304.
 *
 * Solo accesible para usuarios autenticados. La protección se aplica desde
 * el botón "Solicitar personalización" del DetalleProductoPage que verifica
 * `estaAutenticado` y redirige a /login si es necesario.
 *
 * El flujo termina al enviar la solicitud — pendiente de cablear al endpoint
 * POST /api/v1/personalizacion del backend Spring Boot.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Store as StoreIcon,
  CloudUpload,
  Sparkles,
  Stamp,
  Brush,
  Info,
  CheckCircle2,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import QuantityStepper from '../components/QuantityStepper';
import { RUTAS } from '../constants/rutas';
import { useProducto } from '../hooks/useProducto';
import { formatearPrecio } from '../utils/formatearPrecio';
import type { IProducto } from '../types/IProducto';

/* ------------------- Tipos locales de la personalización ------------------ */

type TipoTrabajo = 'estampado' | 'bordado' | 'impresion';

interface ITipoTrabajoOption {
  id: TipoTrabajo;
  label: string;
  precioDesde: number;
  icon: typeof Sparkles;
}

const TIPOS_TRABAJO: ITipoTrabajoOption[] = [
  { id: 'estampado', label: 'Estampado', precioDesde: 20.9, icon: Stamp },
  { id: 'bordado', label: 'Bordado industrial', precioDesde: 15.0, icon: Sparkles },
  { id: 'impresion', label: 'Impresión textil', precioDesde: 25.0, icon: Brush },
];

type DesignTab = 'subir' | 'texto';

/* ============================ Subcomponentes ============================ */

function ProductSummaryCard({ producto }: { producto: IProducto }) {
  // Variantes derivadas (mismo enfoque que DetalleProductoPage)
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
  const [tallaActiva, setTallaActiva] = useState(tallas[1] ?? tallas[0] ?? '');
  const [cantidad, setCantidad] = useState(1);

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-white p-6 sm:flex-row sm:items-start">
      {/* Imagen — columna izquierda, grande */}
      <div className="h-44 w-44 shrink-0 overflow-hidden rounded-md border border-ink-100 bg-surface-muted sm:h-52 sm:w-52">
        <img
          src={producto.imagenes[0]}
          alt={producto.titulo}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Columna derecha — toda la info apilada verticalmente */}
      <div className="flex flex-1 flex-col gap-4 min-w-0">
        {/* Título + tienda */}
        <div className="flex flex-col gap-1">
          <h3 className="text-[20px] font-semibold leading-tight text-ink-900">
            {producto.titulo}
          </h3>
          <div className="flex items-center gap-1 text-[14px] text-ink-500">
            <StoreIcon className="h-4 w-4" />
            <span>{producto.nombreTienda}</span>
          </div>
        </div>

        {/* Color */}
        {colores.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-semibold tracking-wider text-ink-900">
                COLOR
              </span>
              <span className="text-[13px] uppercase text-ink-700">
                {colores[colorActivo].name}
              </span>
            </div>
            <div className="flex gap-2">
              {colores.map((c, i) => (
                <button
                  key={c.hex}
                  onClick={() => setColorActivo(i)}
                  aria-label={c.name}
                  aria-pressed={colorActivo === i}
                  style={{ backgroundColor: c.hex }}
                  className={`h-8 w-8 rounded-full ring-offset-2 transition-shadow ${
                    colorActivo === i
                      ? 'ring-2 ring-brand-500'
                      : 'ring-1 ring-ink-100 hover:ring-ink-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Talla */}
        {tallas.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold tracking-wider text-ink-900">
              TALLA
            </span>
            <div className="flex flex-wrap gap-2">
              {tallas.map((t) => {
                const isActive = t === tallaActiva;
                return (
                  <button
                    key={t}
                    onClick={() => setTallaActiva(t)}
                    className={`min-w-[40px] rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-500 text-white'
                        : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-500'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cantidad */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold tracking-wider text-ink-900">
            CANTIDAD
          </span>
          <QuantityStepper
            cantidad={cantidad}
            onChange={setCantidad}
            size="sm"
            ariaLabel="Selector de cantidad a personalizar"
          />
        </div>
      </div>
    </div>
  );
}

function TipoTrabajoRadioCard({
  option,
  selected,
  onSelect,
}: {
  option: ITipoTrabajoOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      onClick={onSelect}
      type="button"
      className={`flex h-full flex-col gap-2 rounded-lg border p-4 text-left transition-colors ${
        selected
          ? 'border-brand-500 bg-brand-50/30'
          : 'border-ink-100 bg-white hover:border-ink-200'
      }`}
      aria-pressed={selected}
    >
      {/* Fila superior: icono + label a la izquierda, radio a la derecha */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            className={`h-4 w-4 shrink-0 ${
              selected ? 'text-brand-500' : 'text-ink-500'
            }`}
          />
          <span className="truncate text-[14px] font-medium text-ink-900">
            {option.label}
          </span>
        </div>
        {/* Radio circle */}
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? 'border-brand-500' : 'border-ink-200'
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-brand-500" />}
        </span>
      </div>
      {/* "Desde S/ X.XX" debajo */}
      <span className="text-[12px] text-ink-500">
        Desde {formatearPrecio(option.precioDesde)}
      </span>
    </button>
  );
}

/**
 * Patrón hexagonal sutil para el fondo del dropzone — coincide con el Figma.
 * SVG inline codificado como data URI para evitar dependencias externas.
 */
const PATRON_HEXAGONAL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='64' viewBox='0 0 56 64'><g fill='none' stroke='%23DEE2E6' stroke-width='1'><path d='M28 1L52 15v32L28 61L4 47V15z'/><path d='M28 17L40 24v14L28 45L16 38V24z'/></g></svg>\")";

function UploadDropzone() {
  const [filename, setFilename] = useState<string | null>(null);

  return (
    <label
      className="relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-dashed border-ink-200 bg-surface-muted px-6 py-12 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/30"
      htmlFor="diseno-upload"
      style={{
        backgroundImage: PATRON_HEXAGONAL,
        backgroundRepeat: 'repeat',
        backgroundSize: '56px 64px',
      }}
    >
      <input
        id="diseno-upload"
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="sr-only"
        onChange={(e) => setFilename(e.target.files?.[0]?.name ?? null)}
      />

      {/* Círculo brand con icono — destaca sobre el patrón */}
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 shadow-sm">
        <CloudUpload className="h-6 w-6 text-white" strokeWidth={2} />
      </span>
      <span className="relative text-[15px] font-medium text-ink-900">
        {filename ?? 'Arrastra tu diseño aquí o haz clic para subir'}
      </span>
      <span className="relative text-[12px] text-ink-500">
        PNG, JPG o SVG (Max 10MB)
      </span>
    </label>
  );
}

function DetallesPersonalizacionCard({
  tipoSeleccionado,
  setTipoSeleccionado,
}: {
  tipoSeleccionado: TipoTrabajo;
  setTipoSeleccionado: (t: TipoTrabajo) => void;
}) {
  const [tab, setTab] = useState<DesignTab>('subir');
  const [posicion, setPosicion] = useState('');
  const [alto, setAlto] = useState('');
  const [ancho, setAncho] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [texto, setTexto] = useState('');

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-white p-6">
      <h3 className="text-[20px] font-semibold text-ink-900">
        Detalles de Personalización
      </h3>

      {/* TIPO DE TRABAJO — grid horizontal de 3 columnas */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-semibold tracking-wider text-ink-700">
          TIPO DE TRABAJO
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TIPOS_TRABAJO.map((opt) => (
            <TipoTrabajoRadioCard
              key={opt.id}
              option={opt}
              selected={tipoSeleccionado === opt.id}
              onSelect={() => setTipoSeleccionado(opt.id)}
            />
          ))}
        </div>
      </div>

      {/* INFORMACIÓN GENERAL */}
      <div className="flex flex-col gap-4">
        <span className="text-[13px] font-semibold tracking-wider text-ink-700">
          INFORMACIÓN GENERAL
        </span>

        {/* Tabs: Subir Diseño / Solo Texto */}
        <div className="flex border-b border-ink-100">
          {(['subir', 'texto'] as DesignTab[]).map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                type="button"
                className={`-mb-px flex-1 border-b-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                  isActive
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                {t === 'subir' ? 'Subir Diseño' : 'Solo Texto'}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === 'subir' ? (
          <UploadDropzone />
        ) : (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="texto-personalizado"
              className="text-[13px] font-medium text-ink-700"
            >
              Texto a personalizar
            </label>
            <input
              id="texto-personalizado"
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ej. 'Familia López', 'Equipo 2026'..."
              className="h-12 rounded border border-ink-100 bg-white px-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}

        {/* Posición + medidas */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="posicion"
            className="text-[13px] font-medium text-ink-700"
          >
            Posición del diseño
          </label>
          <input
            id="posicion"
            type="text"
            value={posicion}
            onChange={(e) => setPosicion(e.target.value)}
            placeholder="Ej. Pecho izquierdo, espalda completa..."
            className="h-12 rounded border border-ink-100 bg-white px-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="alto" className="text-[13px] font-medium text-ink-700">
              Alto (cm)
            </label>
            <input
              id="alto"
              type="number"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
              placeholder="0"
              className="h-12 rounded border border-ink-100 bg-white px-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="ancho" className="text-[13px] font-medium text-ink-700">
              Ancho (cm)
            </label>
            <input
              id="ancho"
              type="number"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
              placeholder="0"
              className="h-12 rounded border border-ink-100 bg-white px-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Textarea instrucciones */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="instrucciones"
            className="text-[13px] font-medium text-ink-700"
          >
            Instrucciones adicionales
          </label>
          <textarea
            id="instrucciones"
            value={instrucciones}
            onChange={(e) =>
              setInstrucciones(e.target.value.slice(0, 2000))
            }
            placeholder="Detalles sobre colores, técnica, referencias visuales, plazos..."
            rows={4}
            className="resize-y rounded border border-ink-100 bg-white px-3 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
          />
          <div className="text-right text-[12px] text-ink-500">
            {instrucciones.length}/2000
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumenCostos({
  producto,
  tipoSeleccionado,
  onEnviar,
  onCancelar,
}: {
  producto: IProducto;
  tipoSeleccionado: TipoTrabajo;
  onEnviar: () => void;
  onCancelar: () => void;
}) {
  const precioBase = producto.precioBase ?? producto.precioFinal ?? 0;
  const precioFinal = producto.precioFinal ?? precioBase;
  const descuentos = precioBase > precioFinal ? precioBase - precioFinal : 0;
  const tipoActual = TIPOS_TRABAJO.find((t) => t.id === tipoSeleccionado)!;
  const costoPersonalizacion = tipoActual.precioDesde;
  const totalDesde = precioFinal + costoPersonalizacion;

  return (
    <aside className="flex h-fit flex-col gap-6 rounded-xl bg-white p-6 lg:sticky lg:top-24">
      <h2 className="text-[20px] font-semibold text-ink-900">
        Resumen de Costos
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[15px]">
          <span className="text-ink-700">Precio base (1 unid.)</span>
          <span className="text-ink-900">{formatearPrecio(precioBase)}</span>
        </div>
        {descuentos > 0 && (
          <div className="flex items-center justify-between text-[15px] text-brand-600">
            <span>Descuentos</span>
            <span>- {formatearPrecio(descuentos)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-[15px]">
          <span className="text-ink-700">Costo de personalización</span>
          <span className="text-ink-900">
            Desde {formatearPrecio(costoPersonalizacion)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 pt-4">
        <span className="text-[18px] font-semibold text-ink-900">Total</span>
        <span className="text-[22px] font-bold text-brand-600">
          Desde {formatearPrecio(totalDesde)}
        </span>
      </div>

      {/* Alert info */}
      <div className="flex items-start gap-2 rounded-lg border-2 border-brand-100 bg-brand-50/40 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <p className="text-[13px] leading-relaxed text-ink-700">
          El costo final dependerá de la complejidad del diseño. El vendedor te
          enviará una cotización exacta para tu aprobación.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onEnviar}
          className="h-12 rounded-lg bg-brand-500 text-[15px] font-medium text-white transition-colors hover:bg-brand-600"
        >
          Enviar solicitud
        </button>
        <button
          onClick={onCancelar}
          className="h-12 rounded-lg border border-brand-500 bg-white text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          Cancelar
        </button>
      </div>
    </aside>
  );
}

/* ------------------- Modal de confirmación de envío -------------------- */

/**
 * Modal centrado con backdrop blur que aparece cuando el usuario envía
 * exitosamente la solicitud de personalización.
 * Diseño basado en Figma node 2428-13590.
 */
function SolicitudEnviadaModal({
  nombreTienda,
  onClose,
}: {
  nombreTienda: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      {/* Backdrop semitransparente con blur */}
      <div
        className="fixed inset-0 z-[60] bg-black/25"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal centrado */}
      <div
        className="fixed left-1/2 top-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="modal-personalizacion-titulo"
        aria-modal="true"
      >
        {/* Icono de éxito — círculo verde claro con check */}
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: '#EFFFF5' }}
        >
          <CheckCircle2
            className="h-12 w-12 text-emerald-600"
            strokeWidth={2}
          />
        </span>

        <h2
          id="modal-personalizacion-titulo"
          className="text-center text-[20px] font-bold leading-tight text-ink-900"
        >
          ¡Solicitud enviada a {nombreTienda}!
        </h2>

        <p className="text-center text-[15px] leading-relaxed text-ink-500">
          El vendedor evaluará la viabilidad de tu diseño y te enviará una
          propuesta con el costo final. Te notificaremos tanto en la plataforma
          como por correo.
        </p>

        <div className="flex w-full flex-col gap-3 pt-1">
          <button
            onClick={() => navigate(RUTAS.PERSONALIZACIONES)}
            className="h-12 rounded-lg bg-brand-500 text-[15px] font-medium text-white transition-colors hover:bg-brand-600"
          >
            Ver mis personalizaciones
          </button>
          <button
            onClick={() => navigate(RUTAS.INICIO)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================== Page ================================ */

export default function PersonalizacionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { producto, cargando, error } = useProducto(id);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoTrabajo>('estampado');
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  if (cargando) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <TopBar active="Productos" />
        <main className="flex flex-1 items-center justify-center px-12 py-24">
          <span className="text-[18px] text-ink-500">Cargando...</span>
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

  // Guard: solo aplica a productos PERSONALIZABLE
  if (producto.tipoServicio !== 'PERSONALIZABLE') {
    return (
      <div className="min-h-screen bg-surface-muted">
        <TopBar active="Productos" />
        <main className="flex flex-col items-center justify-center gap-4 px-12 py-24 text-center">
          <h1 className="text-3xl font-bold text-ink-900">
            Este producto no es personalizable
          </h1>
          <Link
            to={RUTAS.DETALLE_PRODUCTO(producto.id)}
            className="rounded-lg bg-brand-500 px-6 py-3 text-[15px] font-medium text-white hover:bg-brand-600"
          >
            Volver al producto
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleEnviar = () => {
    // TODO: POST /api/v1/personalizacion — al confirmar, abrir modal de éxito
    setSolicitudEnviada(true);
  };

  const handleCancelar = () => {
    navigate(RUTAS.DETALLE_PRODUCTO(producto.id));
  };

  /** Al cerrar el modal (ESC o click en backdrop) → volver al detalle del producto */
  const handleCerrarModal = () => {
    setSolicitudEnviada(false);
    navigate(RUTAS.DETALLE_PRODUCTO(producto.id));
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Productos" />
      <main className="flex flex-col gap-8 px-12 py-12">
        {/* Volver */}
        <Link
          to={RUTAS.DETALLE_PRODUCTO(producto.id)}
          className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al producto
        </Link>

        {/* Título */}
        <h1 className="text-[36px] font-bold text-ink-900 md:text-[40px]">
          Solicitar Personalización
        </h1>

        {/* 2 columnas */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: Form */}
          <div className="flex flex-col gap-6">
            <ProductSummaryCard producto={producto} />
            <DetallesPersonalizacionCard
              tipoSeleccionado={tipoSeleccionado}
              setTipoSeleccionado={setTipoSeleccionado}
            />
          </div>

          {/* Right: Summary */}
          <ResumenCostos
            producto={producto}
            tipoSeleccionado={tipoSeleccionado}
            onEnviar={handleEnviar}
            onCancelar={handleCancelar}
          />
        </div>
      </main>
      <Footer />

      {/* Modal de confirmación tras enviar la solicitud */}
      {solicitudEnviada && (
        <SolicitudEnviadaModal
          nombreTienda={producto.nombreTienda}
          onClose={handleCerrarModal}
        />
      )}
    </div>
  );
}

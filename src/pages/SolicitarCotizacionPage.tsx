import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, X, CheckCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { RUTAS } from '../constants/rutas';
import { listarTiendas } from '../services/tiendaService';
import { buscarProductos, listarProductosDeTienda, subirImagenS3 } from '../services/catalogoService';
import { cotizacionService } from '../services/cotizacionService';
import { useAuth } from '../hooks/useAuth';
import type { ITienda } from '../types/ITienda';
import type { IProducto } from '../types/IProducto';

/* ── Tipos locales del formulario ────────────────────────────────────── */

type TipoPersonalizacion = 'ESTAMPADO' | 'BORDADO' | 'IMPRESION';

interface PersonalizacionDatos {
  tipo: TipoPersonalizacion;
  modoInfo: 'SUBIR_DISENO' | 'SOLO_TEXTO';
  imagenUrl: string;
  posicionAlto: string;
  posicionAncho: string;
  instrucciones: string;
}

interface ProductoItem {
  uid: string;
  modo: 'CATALOGO' | 'MANUAL';
  busquedaQuery: string;
  resultados: IProducto[];
  buscando: boolean;
  dropdownAbierto: boolean;
  productoSeleccionado: { id: string; titulo: string; imagenUrl: string; precio?: number; idVariante?: number } | null;
  nombreManual: string;
  imagenManualUrl: string;
  subiendoImagen: boolean;
  especificacion: string;
  personalizacion: PersonalizacionDatos | null;
}

const TIPO_TRABAJO_LABELS: Record<TipoPersonalizacion, string> = {
  ESTAMPADO: 'Estampado',
  BORDADO:   'Bordado Industrial',
  IMPRESION: 'Impresión textil',
};

const COTIZACION_DRAFT_KEY = 'gamarra360:cotizacion:draft';

let uidCounter = 0;
function crearProductoVacio(): ProductoItem {
  return {
    uid: String(++uidCounter),
    modo: 'CATALOGO',
    busquedaQuery: '',
    resultados: [],
    buscando: false,
    dropdownAbierto: false,
    productoSeleccionado: null,
    nombreManual: '',
    imagenManualUrl: '',
    subiendoImagen: false,
    especificacion: '',
    personalizacion: null,
  };
}

function personalizacionVacia(): PersonalizacionDatos {
  return { tipo: 'ESTAMPADO', modoInfo: 'SUBIR_DISENO', imagenUrl: '', posicionAlto: '', posicionAncho: '', instrucciones: '' };
}

function buildEspecificacion(p: ProductoItem): string {
  const partes: string[] = [];
  if (p.especificacion.trim()) partes.push(p.especificacion.trim());
  if (p.personalizacion) {
    const pers = p.personalizacion;
    partes.push(`\n[Personalización - ${TIPO_TRABAJO_LABELS[pers.tipo]}]`);
    if (pers.posicionAlto || pers.posicionAncho) {
      partes.push(`Posición: Alto ${pers.posicionAlto || '-'} cm, Ancho ${pers.posicionAncho || '-'} cm`);
    }
    if (pers.imagenUrl) partes.push(`Imagen diseño: ${pers.imagenUrl}`);
    if (pers.instrucciones) partes.push(`Instrucciones: ${pers.instrucciones}`);
  }
  return partes.join('\n');
}

/* ── Componente principal ────────────────────────────────────────────── */

export default function SolicitarCotizacionPage() {
  const navigate = useNavigate();
  const { estaAutenticado } = useAuth();

  // Tienda
  const [todasTiendas, setTodasTiendas]           = useState<ITienda[]>([]);
  const [cargandoTiendas, setCargandoTiendas]       = useState(true);
  const [tipoProductoFiltro, setTipoProductoFiltro] = useState('');
  const [busquedaTienda, setBusquedaTienda]         = useState('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<ITienda | null>(null);
  const [productosTienda, setProductosTienda]       = useState<IProducto[]>([]);

  // Productos
  const [productos, setProductos] = useState<ProductoItem[]>([crearProductoVacio()]);

  // Modal personalización
  const [modalIdx, setModalIdx]           = useState<number | null>(null);
  const [modalDraft, setModalDraft]       = useState<PersonalizacionDatos>(personalizacionVacia());
  const [subiendoDiseno, setSubiendoDiseno] = useState(false);

  // Submit
  const [enviando, setEnviando]   = useState(false);
  const [exito, setExito]         = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  useEffect(() => {
    try {
      const guardado = sessionStorage.getItem(COTIZACION_DRAFT_KEY);
      if (!guardado) return;
      const draft = JSON.parse(guardado) as {
        tiendaSeleccionada?: ITienda | null;
        productos?: ProductoItem[];
      };
      if (draft.tiendaSeleccionada) setTiendaSeleccionada(draft.tiendaSeleccionada);
      if (draft.productos?.length) {
        setProductos(draft.productos.map((producto) => ({
          ...producto,
          resultados: [],
          buscando: false,
          dropdownAbierto: false,
          subiendoImagen: false,
        })));
      }
    } catch {
      sessionStorage.removeItem(COTIZACION_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const productosGuardables = productos.map((producto) => ({
      ...producto,
      resultados: [],
      buscando: false,
      dropdownAbierto: false,
      subiendoImagen: false,
    }));
    sessionStorage.setItem(COTIZACION_DRAFT_KEY, JSON.stringify({
      tiendaSeleccionada,
      productos: productosGuardables,
    }));
  }, [tiendaSeleccionada, productos]);

  const formularioValido = Boolean(
    tiendaSeleccionada &&
    productos.length > 0 &&
    productos.every((producto) => {
      const productoCompleto = producto.modo === 'CATALOGO'
        ? Boolean(producto.productoSeleccionado)
        : Boolean(producto.nombreManual.trim());
      return productoCompleto && Boolean(producto.especificacion.trim());
    }) &&
    !subiendoDiseno
  );

  // Timers de búsqueda por producto
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /* ── Cargar tiendas al montar ────────────────────────────────────── */

  useEffect(() => {
    listarTiendas()
      .then(setTodasTiendas)
      .finally(() => setCargandoTiendas(false));
  }, []);

  /* ── Cargar catálogo de la tienda al seleccionarla ────────────────── */

  useEffect(() => {
    if (!tiendaSeleccionada) {
      setProductosTienda([]);
      return;
    }
    listarProductosDeTienda(tiendaSeleccionada.id)
      .then((lista) => {
        setProductosTienda(lista);
        // Precarga el dropdown del producto si aún no se ha buscado ni seleccionado nada
        setProductos((prev) => prev.map((p) =>
          !p.productoSeleccionado && !p.busquedaQuery.trim()
            ? { ...p, resultados: lista }
            : p
        ));
      })
      .catch(() => setProductosTienda([]));
  }, [tiendaSeleccionada]);

  /* ── Tiendas filtradas derivadas ──────────────────────────────────── */

  const tiposProductoDisponibles = Array.from(
    new Set(todasTiendas.flatMap((t) => t.tiposProducto ?? [])),
  ).sort();

  const tiendasFiltradas = todasTiendas.filter((t) => {
    if (tipoProductoFiltro && !(t.tiposProducto ?? []).includes(tipoProductoFiltro)) return false;
    if (busquedaTienda.trim() && !t.nombre.toLowerCase().includes(busquedaTienda.toLowerCase())) return false;
    return true;
  });

  /* ── Helpers de productos ─────────────────────────────────────────── */

  function actualizarProducto(uid: string, cambios: Partial<ProductoItem>) {
    setProductos((prev) => prev.map((p) => (p.uid === uid ? { ...p, ...cambios } : p)));
  }

  /**
   * Cambia entre las pestañas "Buscar en catálogo" / "Ingresar manualmente".
   * Al volver a CATÁLOGO con una tienda ya elegida, repuebla la lista con el
   * catálogo precargado de la tienda (sin esto, la lista quedaba vacía: bug).
   */
  function cambiarModoProducto(uid: string, modo: 'CATALOGO' | 'MANUAL') {
    setProductos((prev) => prev.map((p) => (p.uid === uid
      ? {
          ...p,
          modo,
          productoSeleccionado: null,
          busquedaQuery: '',
          resultados: modo === 'CATALOGO' && tiendaSeleccionada ? productosTienda : [],
          dropdownAbierto: false,
        }
      : p)));
  }

  function eliminarProducto(uid: string) {
    setProductos((prev) => prev.filter((p) => p.uid !== uid));
  }

  /* ── Búsqueda de productos (debounced) ───────────────────────────── */

  function handleBusquedaProducto(uid: string, query: string) {
    actualizarProducto(uid, { busquedaQuery: query, productoSeleccionado: null });
    clearTimeout(timers.current[uid]);

    // Con tienda ya seleccionada: filtrado instantáneo sobre su catálogo (ya cargado)
    if (tiendaSeleccionada) {
      const q = query.trim().toLowerCase();
      const filtrados = q
        ? productosTienda.filter((p) => p.titulo.toLowerCase().includes(q))
        : productosTienda;
      actualizarProducto(uid, { resultados: filtrados, buscando: false, dropdownAbierto: true });
      return;
    }

    // Sin tienda seleccionada: búsqueda global server-side (como antes)
    if (query.trim().length < 2) {
      actualizarProducto(uid, { resultados: [], dropdownAbierto: false });
      return;
    }
    actualizarProducto(uid, { buscando: true });
    timers.current[uid] = setTimeout(async () => {
      try {
        const res = await buscarProductos(query.trim(), 10);
        actualizarProducto(uid, { resultados: res, buscando: false, dropdownAbierto: true });
      } catch {
        actualizarProducto(uid, { buscando: false });
      }
    }, 300);
  }

  function seleccionarProducto(uid: string, producto: IProducto) {
    const idVariante = producto.variantes?.[0]
      ? Number(producto.variantes[0].id)
      : undefined;
    actualizarProducto(uid, {
      productoSeleccionado: {
        id: producto.id,
        titulo: producto.titulo,
        imagenUrl: producto.imagenes?.[0] ?? '',
        precio: producto.precioFinal ?? producto.precioBase,
        idVariante,
      },
      busquedaQuery: producto.titulo,
      dropdownAbierto: false,
    });
    if (!tiendaSeleccionada) {
      const tienda = todasTiendas.find((t) => String(t.id) === String(producto.idComerciante));
      if (tienda) setTiendaSeleccionada(tienda);
    }
  }

  /* ── Upload imagen producto manual ───────────────────────────────── */

  async function handleImagenManual(uid: string, file: File) {
    actualizarProducto(uid, { subiendoImagen: true });
    try {
      const url = await subirImagenS3(file);
      actualizarProducto(uid, { imagenManualUrl: url });
    } catch {
      /* silencio — el usuario puede reintentar */
    } finally {
      actualizarProducto(uid, { subiendoImagen: false });
    }
  }

  /* ── Upload imagen diseño (personalización) ──────────────────────── */

  async function handleImagenDiseno(file: File) {
    setSubiendoDiseno(true);
    try {
      const url = await subirImagenS3(file);
      setModalDraft((d) => ({ ...d, imagenUrl: url }));
    } catch {
      /* silencio */
    } finally {
      setSubiendoDiseno(false);
    }
  }

  /* ── Modal personalización ────────────────────────────────────────── */

  function abrirModal(idx: number) {
    const existente = productos[idx].personalizacion;
    setModalDraft(existente ? { ...existente } : personalizacionVacia());
    setModalIdx(idx);
  }

  function guardarPersonalizacion() {
    if (modalIdx === null) return;
    actualizarProducto(productos[modalIdx].uid, { personalizacion: { ...modalDraft } });
    setModalIdx(null);
  }

  function eliminarPersonalizacion(uid: string) {
    actualizarProducto(uid, { personalizacion: null });
  }

  /* ── Enviar solicitud ─────────────────────────────────────────────── */

  async function handleSubmit() {
    if (enviando) return;
    if (!estaAutenticado) {
      navigate(RUTAS.LOGIN, { state: { redirectTo: RUTAS.COTIZACIONES } });
      return;
    }
    if (!formularioValido) {
      setErrorEnvio('Completa todos los campos obligatorios antes de enviar.');
      return;
    }
    if (!tiendaSeleccionada) {
      setErrorEnvio('Debes seleccionar una tienda.');
      return;
    }
    const validos = productos.filter(
      (p) => (p.modo === 'CATALOGO' && p.productoSeleccionado) ||
             (p.modo === 'MANUAL' && p.nombreManual.trim()),
    );
    if (validos.length === 0) {
      setErrorEnvio('Debes agregar al menos un producto con sus detalles.');
      return;
    }

    setEnviando(true);
    setErrorEnvio(null);

    try {
      await cotizacionService.crearCotizacion({
        idTienda: Number(tiendaSeleccionada.id),
        productos: validos.map((p) => ({
          tipo: p.modo,
          ...(p.modo === 'CATALOGO' && p.productoSeleccionado
            ? { idVariante: p.productoSeleccionado.idVariante }
            : { nombre: p.nombreManual.trim(), imagenUrl: p.imagenManualUrl || undefined }),
          especificacion: buildEspecificacion(p) || undefined,
          cantidad: 1,
        })),
      });
      sessionStorage.removeItem(COTIZACION_DRAFT_KEY);
      setExito(true);
    } catch {
      setErrorEnvio('No se pudo enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */

  const hayFiltros = !!tipoProductoFiltro || !!busquedaTienda.trim();

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5]">
      <TopBar active="Cotizaciones" />

      <main className="flex-1 px-4 py-10 md:px-12">
        <div className="mx-auto max-w-[900px]">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink-900">Solicitar Cotización</h1>
            <p className="mt-1 text-ink-500">Centraliza tus pedidos con los mejores proveedores de Gamarra.</p>
          </div>

          {/* ── Sección 1: Tienda ──────────────────────────────────── */}
          <div className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">1</span>
              <h2 className="text-lg font-semibold text-ink-900">Tienda</h2>
            </div>

            {/* Tipo de producto */}
            <div className="mb-4">
              <select
                value={tipoProductoFiltro}
                onChange={(e) => { setTipoProductoFiltro(e.target.value); setTiendaSeleccionada(null); }}
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Tipo de producto</option>
                {tiposProductoDisponibles.map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </div>

            {/* Buscar tienda */}
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={busquedaTienda}
                onChange={(e) => { setBusquedaTienda(e.target.value); setTiendaSeleccionada(null); }}
                placeholder="Buscar tienda..."
                className="w-full rounded-lg border border-ink-200 bg-white py-3 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Lista de tiendas */}
            {cargandoTiendas && (
              <div className="py-4 text-center text-sm text-ink-400">Cargando tiendas...</div>
            )}

            {!cargandoTiendas && !tiendaSeleccionada && hayFiltros && tiendasFiltradas.length === 0 && (
              <p className="text-sm text-ink-400">No se encontraron tiendas con esos filtros.</p>
            )}

            {!cargandoTiendas && !tiendaSeleccionada && (hayFiltros ? tiendasFiltradas : todasTiendas.slice(0, 8)).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTiendaSeleccionada(t)}
                className="mb-2 flex w-full items-center justify-between rounded-lg border border-ink-100 bg-white px-4 py-3 text-left transition-colors hover:border-brand-400 hover:bg-surface-muted"
              >
                <div className="flex items-center gap-3">
                  {t.logo ? (
                    <img src={t.logo} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                      {t.nombre.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-ink-900">{t.nombre}</span>
                </div>
                <Link
                  to={RUTAS.DETALLE_TIENDA(t.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  Visitar tienda
                </Link>
              </button>
            ))}

            {/* Tienda seleccionada */}
            {tiendaSeleccionada && (
              <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  {tiendaSeleccionada.logo ? (
                    <img src={tiendaSeleccionada.logo} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-200 text-xs font-bold text-brand-700">
                      {tiendaSeleccionada.nombre.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-ink-900">{tiendaSeleccionada.nombre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={RUTAS.DETALLE_TIENDA(tiendaSeleccionada.id)}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    Visitar tienda
                  </Link>
                  <button
                    type="button"
                    onClick={() => setTiendaSeleccionada(null)}
                    className="text-ink-400 hover:text-ink-700"
                    aria-label="Cambiar tienda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sección 2: Productos ───────────────────────────────── */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">2</span>
              <h2 className="text-lg font-semibold text-ink-900">Detalles del Producto</h2>
            </div>
            <p className="mb-6 text-sm text-ink-500">
              Si deseas personalizar el producto con estampado, bordado industrial o impresión textil,
              asegúrate de agregar la personalización en el enlace correspondiente.
            </p>

            {productos.map((producto, idx) => (
              <ProductoForm
                key={producto.uid}
                producto={producto}
                numero={idx + 1}
                tiendaId={tiendaSeleccionada?.id}
                onCambio={(cambios) => actualizarProducto(producto.uid, cambios)}
                onCambiarModo={(m) => cambiarModoProducto(producto.uid, m)}
                onEliminar={() => eliminarProducto(producto.uid)}
                onBusqueda={(q) => handleBusquedaProducto(producto.uid, q)}
                onSeleccionarProducto={(p) => seleccionarProducto(producto.uid, p)}
                onImagenManual={(file) => handleImagenManual(producto.uid, file)}
                onAbrirPersonalizacion={() => abrirModal(idx)}
                onEliminarPersonalizacion={() => eliminarPersonalizacion(producto.uid)}
                mostrarEliminar={false}
              />
            ))}
          </div>

          {/* Error */}
          {errorEnvio && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorEnvio}
            </div>
          )}

          {/* Botones */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-brand-500 px-6 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={enviando || !formularioValido}
              className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Modal Personalización ─────────────────────────────────── */}
      {modalIdx !== null && (
        <PersonalizacionModal
          draft={modalDraft}
          onCambio={setModalDraft}
          subiendoDiseno={subiendoDiseno}
          onSubirDiseno={handleImagenDiseno}
          numerProducto={modalIdx + 1}
          onCancelar={() => setModalIdx(null)}
          onGuardar={guardarPersonalizacion}
        />
      )}

      {/* ── Modal Éxito ───────────────────────────────────────────── */}
      {exito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h3 className="mb-2 text-xl font-bold text-ink-900">
              ¡Solicitud enviada a {tiendaSeleccionada?.nombre}!
            </h3>
            <p className="mb-6 text-sm text-ink-500">
              El comerciante revisará tu solicitud y te notificará con una propuesta. También puedes seguir el estado desde tus cotizaciones.
            </p>
            <button
              type="button"
              onClick={() => navigate(RUTAS.MIS_COTIZACIONES)}
              className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Ver tus cotizaciones
            </button>
            <button
              type="button"
              onClick={() => navigate(RUTAS.INICIO)}
              className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-componente: formulario de un producto ───────────────────────── */

interface ProductoFormProps {
  producto: ProductoItem;
  numero: number;
  tiendaId?: string;
  onCambio: (cambios: Partial<ProductoItem>) => void;
  onCambiarModo: (modo: 'CATALOGO' | 'MANUAL') => void;
  onEliminar: () => void;
  onBusqueda: (q: string) => void;
  onSeleccionarProducto: (p: IProducto) => void;
  onImagenManual: (file: File) => void;
  onAbrirPersonalizacion: () => void;
  onEliminarPersonalizacion: () => void;
  mostrarEliminar: boolean;
}

function ProductoForm({
  producto, numero, onCambio, onCambiarModo, onEliminar, onBusqueda,
  onSeleccionarProducto, onImagenManual, onAbrirPersonalizacion,
  onEliminarPersonalizacion, mostrarEliminar,
}: ProductoFormProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlImagen, setUrlImagen] = useState('');
  const [tocados, setTocados] = useState({ producto: false, especificacion: false });
  const faltaProducto = producto.modo === 'CATALOGO'
    ? !producto.productoSeleccionado
    : !producto.nombreManual.trim();
  const faltaEspecificacion = !producto.especificacion.trim();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onCambio({ dropdownAbierto: false });
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onCambio]);

  return (
    <div className="mb-4 rounded-xl border border-ink-100 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
            {numero}
          </span>
          <span className="text-sm font-semibold text-ink-800">Producto #{numero}</span>
        </div>
        {mostrarEliminar && (
          <button type="button" onClick={onEliminar} className="text-sm font-medium text-red-500 hover:text-red-700">
            × Quitar
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-ink-100">
        {(['CATALOGO', 'MANUAL'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onCambiarModo(m)}
            className={`px-4 pb-2 text-sm font-medium transition-colors ${
              producto.modo === m
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {m === 'CATALOGO' ? 'Buscar en catálogo' : 'Ingresar manualmente'}
          </button>
        ))}
      </div>

      {/* CATALOGO */}
      {producto.modo === 'CATALOGO' && (
        <div>
          {!producto.productoSeleccionado ? (
            <div ref={dropdownRef} className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={producto.busquedaQuery}
                onChange={(e) => onBusqueda(e.target.value)}
                onFocus={() => producto.resultados.length > 0 && onCambio({ dropdownAbierto: true })}
                onBlur={() => setTocados((prev) => ({ ...prev, producto: true }))}
                placeholder="Buscar producto..."
                className={`w-full rounded-lg border py-3 pl-9 pr-4 text-sm focus:outline-none ${tocados.producto && faltaProducto ? 'border-red-400 focus:border-red-500' : 'border-ink-200 focus:border-brand-500'}`}
              />
              {producto.buscando && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
                </div>
              )}
              {producto.dropdownAbierto && producto.resultados.length > 0 && (
                <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 rounded-xl border border-ink-100 bg-white shadow-lg">
                  {producto.resultados.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onMouseDown={() => onSeleccionarProducto(p)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted"
                      >
                        {p.imagenes[0] && (
                          <img src={p.imagenes[0]} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-900">{p.titulo}</p>
                          <p className="text-xs text-ink-500">{p.nombreTienda}</p>
                        </div>
                        {(p.precioFinal ?? p.precioBase) && (
                          <span className="text-sm font-semibold text-ink-900">
                            S/.{(p.precioFinal ?? p.precioBase)!.toFixed(2)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-ink-100 bg-surface-muted p-3">
              {producto.productoSeleccionado.imagenUrl && (
                <img
                  src={producto.productoSeleccionado.imagenUrl}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-ink-900">{producto.productoSeleccionado.titulo}</p>
              </div>
              {producto.productoSeleccionado.precio != null && (
                <span className="text-sm font-semibold text-ink-700">
                  S/.{producto.productoSeleccionado.precio.toFixed(2)}
                </span>
              )}
              <button
                type="button"
                onClick={() => onCambio({ productoSeleccionado: null, busquedaQuery: '' })}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {tocados.producto && faltaProducto && (
            <p className="-mt-2 mb-3 text-xs text-red-600">Selecciona un producto del catálogo.</p>
          )}
        </div>
      )}

      {/* MANUAL */}
      {producto.modo === 'MANUAL' && (
        <div className="mb-3">
          <input
            type="text"
            value={producto.nombreManual}
            onChange={(e) => onCambio({ nombreManual: e.target.value })}
            onBlur={() => setTocados((prev) => ({ ...prev, producto: true }))}
            placeholder="Nombre del producto"
            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none ${tocados.producto && faltaProducto ? 'border-red-400 focus:border-red-500' : 'border-ink-200 focus:border-brand-500'}`}
          />
          {tocados.producto && faltaProducto && (
            <p className="mb-3 mt-1 text-xs text-red-600">Ingresa el nombre del producto.</p>
          )}
          {/* Upload imagen referencia */}
          <div
            onClick={() => !producto.subiendoImagen && fileInputRef.current?.click()}
            className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 py-6 text-center transition-colors hover:border-brand-400"
          >
            {producto.subiendoImagen ? (
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
                Subiendo imagen...
              </div>
            ) : producto.imagenManualUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img src={producto.imagenManualUrl} alt="" className="max-h-28 rounded-lg object-contain" />
                <p className="text-xs text-ink-400">Haz clic para cambiar</p>
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-brand-400" />
                <p className="text-sm font-medium text-ink-700">Imagen de Referencia del Producto</p>
                <p className="text-xs text-ink-400">Sube tu archivo aquí o haz clic para explorar</p>
                <p className="mt-1 text-xs text-ink-400">Max. 3MB · PNG, JPG, WEBP</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImagenManual(f); }}
          />

          {/* Alternativa: URL de imagen (sin S3) */}
          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-100" />
            <span className="whitespace-nowrap text-xs text-ink-400">o usa una URL de imagen</span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlImagen}
              onChange={(e) => setUrlImagen(e.target.value)}
              placeholder="https://ejemplo.com/imagen-producto.jpg"
              className="flex-1 rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { const u = urlImagen.trim(); if (u) onCambio({ imagenManualUrl: u }); }}
              className="shrink-0 rounded-lg border border-ink-200 px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted"
            >
              Vista previa
            </button>
          </div>
        </div>
      )}

      {/* Especificaciones */}
      <div className="relative mb-3">
        <textarea
          value={producto.especificacion}
          onChange={(e) => onCambio({ especificacion: e.target.value })}
          onBlur={() => setTocados((prev) => ({ ...prev, especificacion: true }))}
          maxLength={2000}
          rows={3}
          placeholder="Especificaciones del producto"
          className={`w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none ${tocados.especificacion && faltaEspecificacion ? 'border-red-400 focus:border-red-500' : 'border-ink-200 focus:border-brand-500'}`}
        />
        <span className="absolute bottom-3 right-3 text-xs text-ink-400">
          {producto.especificacion.length}/2000
        </span>
        <p className="mt-1 text-xs text-ink-400">
          Describe los materiales, calidad, tallas, colores y cantidades que deseas.
        </p>
        {tocados.especificacion && faltaEspecificacion && (
          <p className="mt-1 text-xs text-red-600">Las especificaciones son obligatorias.</p>
        )}
      </div>

      {/* Personalización */}
      {producto.personalizacion ? (
        <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2">
          <span className="text-xs font-medium text-ink-700">
            Personalización: {TIPO_TRABAJO_LABELS[producto.personalizacion.tipo]}
          </span>
          <button type="button" onClick={onAbrirPersonalizacion} className="ml-auto text-xs text-brand-600 hover:underline">
            Editar
          </button>
          <button type="button" onClick={onEliminarPersonalizacion} className="text-xs text-red-500 hover:text-red-700">
            Eliminar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAbrirPersonalizacion}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          + Agregar personalización
        </button>
      )}
    </div>
  );
}

/* ── Sub-componente: modal personalización ───────────────────────────── */

interface PersonalizacionModalProps {
  draft: PersonalizacionDatos;
  onCambio: (d: PersonalizacionDatos) => void;
  subiendoDiseno: boolean;
  onSubirDiseno: (file: File) => void;
  numerProducto: number;
  onCancelar: () => void;
  onGuardar: () => void;
}

function PersonalizacionModal({
  draft, onCambio, subiendoDiseno, onSubirDiseno,
  numerProducto, onCancelar, onGuardar,
}: PersonalizacionModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDiseno, setUrlDiseno] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-semibold text-ink-900">Personalización del Producto #{numerProducto}</h3>
          <button type="button" onClick={onCancelar} className="text-ink-400 hover:text-ink-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tipo de trabajo */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Tipo de trabajo</p>
        <div className="mb-5 flex gap-4">
          {(['ESTAMPADO', 'BORDADO', 'IMPRESION'] as const).map((tipo) => (
            <label key={tipo} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="tipoTrabajo"
                checked={draft.tipo === tipo}
                onChange={() => onCambio({ ...draft, tipo })}
                className="accent-brand-500"
              />
              <span className="text-sm text-ink-700">{TIPO_TRABAJO_LABELS[tipo]}</span>
            </label>
          ))}
        </div>

        {/* Información general */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Información general</p>
        <div className="mb-4 flex border-b border-ink-100">
          {(['SUBIR_DISENO', 'SOLO_TEXTO'] as const).map((modo) => (
            <button
              key={modo}
              type="button"
              onClick={() => onCambio({ ...draft, modoInfo: modo })}
              className={`px-4 pb-2 text-sm font-medium transition-colors ${
                draft.modoInfo === modo
                  ? 'border-b-2 border-brand-500 text-brand-600'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              {modo === 'SUBIR_DISENO' ? 'Subir Diseño' : 'Solo Texto'}
            </button>
          ))}
        </div>

        {draft.modoInfo === 'SUBIR_DISENO' ? (
          <div
            onClick={() => !subiendoDiseno && fileRef.current?.click()}
            className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink-200 py-6 text-center hover:border-brand-400"
          >
            {subiendoDiseno ? (
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
                Subiendo...
              </div>
            ) : draft.imagenUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img src={draft.imagenUrl} alt="" className="max-h-20 rounded-lg object-contain" />
                <p className="text-xs text-ink-400">Haz clic para cambiar</p>
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-brand-400" />
                <p className="text-sm font-medium text-ink-700">Arrastra tu diseño aquí o haz clic para subir</p>
                <p className="text-xs text-ink-400">PNG, JPG, SVG hasta 5MB</p>
              </>
            )}
          </div>
        ) : (
          <textarea
            value={draft.instrucciones}
            onChange={(e) => onCambio({ ...draft, instrucciones: e.target.value })}
            placeholder="Describe el texto o diseño que deseas..."
            rows={3}
            className="mb-4 w-full resize-none rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onSubirDiseno(f); }}
        />

        {/* Alternativa: URL del diseño (sin S3) */}
        {draft.modoInfo === 'SUBIR_DISENO' && (
          <>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-ink-100" />
              <span className="whitespace-nowrap text-xs text-ink-400">o usa una URL de imagen</span>
              <div className="h-px flex-1 bg-ink-100" />
            </div>
            <div className="mb-4 flex gap-2">
              <input
                type="url"
                value={urlDiseno}
                onChange={(e) => setUrlDiseno(e.target.value)}
                placeholder="https://ejemplo.com/diseno.png"
                className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => { const u = urlDiseno.trim(); if (u) onCambio({ ...draft, imagenUrl: u }); }}
                className="shrink-0 rounded-lg border border-ink-200 px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted"
              >
                Vista previa
              </button>
            </div>
          </>
        )}

        {/* Posición */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={draft.posicionAlto}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              const valor = e.target.value;
              if (/^\d*(\.\d{0,2})?$/.test(valor)) {
                onCambio({ ...draft, posicionAlto: valor });
            }
            }}
            placeholder="Alto (cm)"
            className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={draft.posicionAncho}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              const valor = e.target.value;
              if (/^\d*(\.\d{0,2})?$/.test(valor)) {
                onCambio({ ...draft, posicionAncho: valor });
            }
            }}
            placeholder="Ancho (cm)"
            className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {draft.modoInfo === 'SUBIR_DISENO' && (
          <textarea
            value={draft.instrucciones}
            onChange={(e) => onCambio({ ...draft, instrucciones: e.target.value })}
            placeholder="Instrucciones adicionales..."
            rows={2}
            className="mb-4 w-full resize-none rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (draft.posicionAlto && Number(draft.posicionAlto) <= 0) {
                alert('El alto debe ser mayor a 0 cm.');
                return;
              }
              if (draft.posicionAncho && Number(draft.posicionAncho) <= 0) {
                alert('El ancho debe ser mayor a 0 cm.');
                return;
              }
              onGuardar();
            }}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

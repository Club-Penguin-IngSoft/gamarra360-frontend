import { useState, useEffect, useMemo, useRef } from 'react';
import { PackageX } from 'lucide-react';
import type { IProducto } from '../../types/IProducto';
import type { IOferta, IOfertaPayload, TipoDescuentoOferta, IConflictoOferta } from '../../types/IOferta';
import { crearOferta, actualizarOferta } from '../../services/ofertaService';
import { listarProductosDeTienda } from '../../services/catalogoService';
import { obtenerMiTienda } from '../../services/tiendaService';
import ConfirmDialog from './ConfirmDialog';

/* ── Estilos compartidos ─────────────────────────────────────────────────── */

const INPUT_CLS =
  'w-full h-[42px] border border-gray-200 rounded-lg px-3 text-sm bg-white ' +
  'focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all';
const LABEL_CLS = 'block text-xs font-medium text-gray-600 mb-1.5';

/* ── Props ───────────────────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  ofertaEditar: IOferta | null;
  onClose: () => void;
  onSuccess: () => void;
}

/* ── Componente ──────────────────────────────────────────────────────────── */

export default function ModalCrearOferta({ open, ofertaEditar, onClose, onSuccess }: Props) {
  /* Formulario */
  const [titulo, setTitulo] = useState('');
  const [tipoDescuento, setTipoDescuento] = useState<TipoDescuentoOferta>('PORCENTAJE');
  const [valor, setValor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  /* Productos */
  const [productos, setProductos] = useState<IProducto[]>([]);
  const [cargandoProds, setCargandoProds] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  /* Submit */
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Conflicto de ofertas activas superpuestas — lo determina el backend (409) */
  const [conflictos, setConflictos] = useState<IConflictoOferta[] | null>(null);

  /* Fetch de productos (una sola vez) */
  const fetchedRef = useRef(false);

  /* Bloquear scroll del body */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Resetear / pre-rellenar formulario — también limpia guardando al cerrar */
  useEffect(() => {
    // Siempre limpia los estados de carga/error al cambiar open o la oferta editada
    setGuardando(false);
    setError(null);
    setConflictos(null);

    if (!open) return;

    if (ofertaEditar) {
      setTitulo(ofertaEditar.titulo);
      setTipoDescuento(ofertaEditar.tipoDescuento);
      setValor(String(ofertaEditar.valorDescuento));
      setFechaInicio(ofertaEditar.fechaInicio.split('T')[0]);
      setFechaFin(ofertaEditar.fechaFin.split('T')[0]);
      setSeleccionados(new Set(ofertaEditar.idsProductos));
    } else {
      setTitulo('');
      setTipoDescuento('PORCENTAJE');
      setValor('');
      setFechaInicio('');
      setFechaFin('');
      setSeleccionados(new Set());
    }
    setBusqueda('');
    setFiltroCategoria('');
    setFiltroTipo('');
  }, [open, ofertaEditar]);

  /* Cargar productos del comerciante una vez */
  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setCargandoProds(true);
    obtenerMiTienda()
      .then(({ idTienda }) => listarProductosDeTienda(String(idTienda)))
      .then(setProductos)
      .catch(() => { fetchedRef.current = false; })
      .finally(() => setCargandoProds(false));
  }, [open]);

  /* Opciones de filtro derivadas de los productos */
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria))].sort(),
    [productos],
  );
  const tipos = useMemo(
    () => [...new Set(productos.map((p) => p.tipoProducto).filter(Boolean))].sort() as string[],
    [productos],
  );

  /* Productos filtrados */
  const productosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return productos.filter((p) => {
      const coincideBusqueda = p.titulo.toLowerCase().includes(q);
      const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria;
      const coincideTipo = !filtroTipo || p.tipoProducto === filtroTipo;
      return coincideBusqueda && coincideCategoria && coincideTipo;
    });
  }, [productos, busqueda, filtroCategoria, filtroTipo]);

  const idsFiltrados = useMemo(
    () => productosFiltrados.map((p) => Number(p.id)),
    [productosFiltrados],
  );

  // Al crear (no al editar): mientras se cargan los productos aún no sabemos si hay
  // publicados o no, así que se muestra un estado de carga neutro en vez del
  // formulario completo — evita el "flash" de ver el form y que luego desaparezca.
  const cargandoInicial = !ofertaEditar && cargandoProds;
  // Si terminó de cargar y no hay productos, bloquea el flujo desde el inicio en vez
  // de dejar que el comerciante llene todo el formulario para recién enterarse al guardar.
  const sinProductosPublicados = !ofertaEditar && !cargandoProds && productos.length === 0;

  const todosSeleccionados =
    idsFiltrados.length > 0 && idsFiltrados.every((id) => seleccionados.has(id));

  const toggleProducto = (id: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodosFiltrados = () => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosSeleccionados) {
        idsFiltrados.forEach((id) => next.delete(id));
      } else {
        idsFiltrados.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  /** Envía el payload al backend. `forzar` confirma explícitamente reemplazar una oferta activa superpuesta (409 previo). */
  const guardar = async (forzar: boolean) => {
    setGuardando(true);
    setError(null);

    const payload: IOfertaPayload = {
      titulo: titulo.trim(),
      tipoDescuento,
      valorDescuento: Number(valor),
      fechaInicio,
      fechaFin,
      activa: true,
      idsProductos: [...seleccionados],
      forzarSobrescritura: forzar,
    };

    try {
      if (ofertaEditar) {
        await actualizarOferta(ofertaEditar.idOferta, payload);
      } else {
        await crearOferta(payload);
      }
      setConflictos(null);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const respuesta = (err as { response?: { status?: number; data?: { mensaje?: string; conflictos?: IConflictoOferta[] } } })?.response;
      if (respuesta?.status === 409 && respuesta.data?.conflictos?.length) {
        // El backend detectó producto(s) con otra oferta activa vigente — se pide confirmación explícita.
        setConflictos(respuesta.data.conflictos);
      } else {
        setError(respuesta?.data?.mensaje ?? 'Ocurrió un error al guardar. Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = () => {
    if (!titulo.trim()) { setError('El nombre de la promoción es requerido.'); return; }
    const numValor = Number(valor);
    if (!valor || numValor <= 0) { setError('El valor del descuento debe ser mayor a 0.'); return; }
    if (tipoDescuento === 'PORCENTAJE' && numValor > 100) { setError('El porcentaje no puede superar 100.'); return; }
    if (!fechaInicio) { setError('La fecha de inicio es requerida.'); return; }
    if (!fechaFin) { setError('La fecha de fin es requerida.'); return; }
    if (fechaFin <= fechaInicio) { setError('La fecha de fin debe ser posterior a la de inicio.'); return; }
    if (seleccionados.size === 0) { setError('Selecciona al menos un producto.'); return; }

    guardar(false);
  };

  if (!open) return null;

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="relative flex w-full max-w-[700px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between border-b border-gray-200 px-4 py-5 sm:px-7">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900">
              {ofertaEditar ? 'Editar Oferta' : 'Crear Nueva Oferta'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Configura los detalles y selecciona los productos a promocionar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-7 py-6">

          {cargandoInicial ? (
          /* Estado de carga neutro: aún no sabemos si hay productos publicados,
             así que no mostramos el formulario ni el bloqueo todavía. */
          <div className="flex flex-col items-center justify-center text-center py-24 gap-3">
            <span className="w-8 h-8 border-2 border-gray-200 border-t-primario rounded-full animate-spin" />
            <p className="text-[13px] text-gray-400">Cargando…</p>
          </div>
          ) : sinProductosPublicados ? (
          /* Bloquea el flujo desde el inicio: sin productos publicados no tiene
             sentido dejar llenar título/fechas/descuento para recién fallar al guardar. */
          <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
            <span className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <PackageX className="h-7 w-7 text-amber-600" />
            </span>
            <h3 className="text-[15px] font-bold text-gray-900">
              Aún no tienes productos publicados
            </h3>
            <p className="text-[13px] text-gray-500 max-w-sm">
              Para crear una promoción necesitas al menos un producto publicado en tu
              tienda. Publica un producto desde Inventario y vuelve a intentarlo.
            </p>
          </div>
          ) : (
          <>
          {/* ── Sección A: Detalles ─────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                A
              </span>
              <h3 className="text-[15px] font-semibold text-gray-900">Detalles de la Oferta</h3>
            </div>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className={LABEL_CLS}>Nombre de la Promoción</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Cyber Days Textil"
                  className={INPUT_CLS}
                />
              </div>

              {/* Tipo + Valor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Tipo de Descuento</label>
                  <select
                    value={tipoDescuento}
                    onChange={(e) => setTipoDescuento(e.target.value as TipoDescuentoOferta)}
                    className={INPUT_CLS}
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="MONTO_FIJO">Monto Fijo (S/)</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Valor</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      step={tipoDescuento === 'PORCENTAJE' ? '1' : '0.01'}
                      max={tipoDescuento === 'PORCENTAJE' ? '100' : undefined}
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      placeholder="0"
                      className={`${INPUT_CLS} pr-10`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400">
                      {tipoDescuento === 'PORCENTAJE' ? '%' : 'S/'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Fecha de Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    min={fechaInicio || undefined}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Sección B: Selección de Productos ──────────────────────── */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                B
              </span>
              <h3 className="text-[15px] font-semibold text-gray-900">Selección de Productos</h3>
            </div>

            {/* Buscador + filtros */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full h-9 border border-gray-200 rounded-lg pl-8 pr-3 text-[13px] bg-white focus:border-pink-400 focus:outline-none"
                />
              </div>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white focus:border-pink-400 focus:outline-none"
              >
                <option value="">Categoría: Todas</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white focus:border-pink-400 focus:outline-none"
              >
                <option value="">Tipo: Todos</option>
                {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Lista de productos */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Encabezado: seleccionar todos */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={todosSeleccionados}
                  onChange={toggleTodosFiltrados}
                  className="w-4 h-4 cursor-pointer accent-primario flex-shrink-0"
                />
                <button
                  type="button"
                  onClick={toggleTodosFiltrados}
                  className="text-[12px] font-semibold text-primario hover:underline text-left"
                >
                  Seleccionar los {productosFiltrados.length} productos filtrados
                </button>
                <span className="ml-auto text-[12px] font-semibold text-gray-600 whitespace-nowrap">
                  {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Filas de productos */}
              <div className="max-h-72 overflow-y-auto">
                {cargandoProds ? (
                  <div className="py-10 text-center text-[13px] text-gray-400">
                    Cargando productos...
                  </div>
                ) : productosFiltrados.length === 0 ? (
                  <div className="py-10 text-center text-[13px] text-gray-400">
                    {productos.length === 0
                      ? 'No tienes productos publicados aún.'
                      : 'Sin resultados para los filtros aplicados.'}
                  </div>
                ) : (
                  productosFiltrados.map((p) => {
                    const idNum = Number(p.id);
                    const totalStock = (p.variantes ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
                    const activo = seleccionados.has(idNum);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProducto(idNum)}
                        className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          activo ? 'bg-pink-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 flex-shrink-0 accent-primario cursor-pointer"
                        />
                        {p.imagenes[0] ? (
                          <img
                            src={p.imagenes[0]}
                            alt={p.titulo}
                            className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-gray-200 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-gray-900 truncate">
                            {p.titulo}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {p.tipoProducto ?? p.categoria}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="block text-[13px] font-semibold text-gray-900">
                            {p.precioBase != null ? `S/ ${p.precioBase.toFixed(2)}` : '—'}
                          </span>
                          <span
                            className={`text-[11px] font-medium ${
                              totalStock <= 5 ? 'text-red-500' : 'text-gray-400'
                            }`}
                          >
                            {totalStock} unid.
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 px-7 py-4 flex items-center gap-3">
          {error && <p className="text-[12px] text-red-500 flex-1">{error}</p>}
          <div className="flex items-center gap-3 ml-auto">
            {cargandoInicial ? (
              <button
                type="button"
                onClick={onClose}
                className="h-[42px] px-6 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            ) : sinProductosPublicados ? (
              <button
                type="button"
                onClick={onClose}
                className="h-[42px] px-6 rounded-lg bg-primario text-white text-[13px] font-semibold hover:bg-primario-hover transition-colors"
              >
                Entendido, cerrar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[42px] px-6 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={guardando}
                  className="h-[42px] px-6 rounded-lg bg-primario text-white text-[13px] font-semibold hover:bg-primario-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {guardando ? (
                    'Guardando...'
                  ) : (
                    <>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Guardar Promoción
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={conflictos !== null}
        titulo="Producto con oferta activa vigente"
        variante="advertencia"
        confirmando={guardando}
        confirmarLabel="Sí, continuar y reemplazar"
        onConfirmar={() => guardar(true)}
        onCancelar={() => setConflictos(null)}
        mensaje={
          <>
            <p>
              {conflictos && conflictos.length > 1
                ? 'Los siguientes productos ya tienen otra oferta activa vigente en fechas superpuestas:'
                : 'El siguiente producto ya tiene otra oferta activa vigente en fechas superpuestas:'}
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {conflictos?.map((c) => (
                <li key={c.idOferta}>
                  <strong>{c.tituloOferta}</strong>:{' '}
                  {c.productosEnConflicto.map((p) => p.nombre).join(', ')}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Si continúas, esos productos se reasignarán a esta promoción y dejarán de
              aplicar el descuento de la oferta anterior.
            </p>
          </>
        }
      />
    </div>
  );
}

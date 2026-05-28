/**
 * Panel lateral de filtros de productos — drawer desde la izquierda con
 * acordeones. Componente **controlado**: el padre gestiona el estado
 * `filtros` y lo pasa por props.
 *
 * Se usa en:
 *  - CatalogoPage (filtros del catálogo global)
 *  - DetalleTiendaPage (filtros del catálogo de una tienda específica)
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  ChevronDown,
  SlidersHorizontal,
  Store as StoreIcon,
  Truck,
  X,
} from 'lucide-react';
import type { Categoria, TipoServicio } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';
import { FILTROS_VACIOS } from '../types/IFiltro';

/* ---------------------------- Constantes UI ---------------------------- */

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
];

const TIPOS_SERVICIO_UI: { value: TipoServicio; label: string }[] = [
  { value: 'COMPRA_DIRECTA', label: 'Compra directa' },
  { value: 'PERSONALIZABLE', label: 'Personalizable' },
];

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

type SectionKey =
  | 'entrega'
  | 'categoria'
  | 'producto'
  | 'servicio'
  | 'color'
  | 'material'
  | 'talla'
  | 'precio';

/* ----------------------------- Subcomponentes -------------------------- */

function Section({
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

function Pill({
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

function Radio({
  name,
  label,
  icon,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  icon?: ReactNode;
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
      {icon}
      <span>{label}</span>
    </label>
  );
}

function Select({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-ink-100 bg-white px-3 pr-8 text-[14px] text-ink-700 focus:border-brand-500 focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
    </div>
  );
}

/* ============================== FilterPanel ============================ */

interface Props {
  open: boolean;
  filtros: IFiltrosCatalogo;
  onChange: (f: IFiltrosCatalogo) => void;
  onClose: () => void;
}

export default function FilterPanel({ open, filtros, onChange, onClose }: Props) {
  // Estado borrador: se edita internamente y solo se aplica al padre con "Aplicar filtros"
  const [borrador, setBorrador] = useState<IFiltrosCatalogo>(filtros);

  // Cada vez que el panel se abre, sincroniza el borrador con los filtros aplicados
  useEffect(() => {
    if (open) setBorrador(filtros);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    entrega: true,
    categoria: true,
    producto: true,
    servicio: true,
    color: true,
    material: true,
    talla: false,
    precio: false,
  });

  const toggleSection = (k: SectionKey) =>
    setSections((s) => ({ ...s, [k]: !s[k] }));

  const toggleCategoria = (c: Categoria) =>
    setBorrador((b) => ({
      ...b,
      categorias: b.categorias.includes(c)
        ? b.categorias.filter((x) => x !== c)
        : [...b.categorias, c],
    }));

  const toggleTipoProducto = (t: string) =>
    setBorrador((b) => ({
      ...b,
      tiposProducto: b.tiposProducto.includes(t)
        ? b.tiposProducto.filter((x) => x !== t)
        : [...b.tiposProducto, t],
    }));

  const toggleTalla = (t: string) =>
    setBorrador((b) => ({
      ...b,
      tallas: b.tallas.includes(t)
        ? b.tallas.filter((x) => x !== t)
        : [...b.tallas, t],
    }));

  // Solo limpia el borrador, no aplica al padre hasta que el usuario haga clic en Aplicar
  const limpiarTodo = () => setBorrador(FILTROS_VACIOS);

  // Aplica el borrador al padre y cierra el panel
  const aplicarFiltros = () => {
    onChange(borrador);
    onClose();
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
        aria-label="Filtros de productos"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50">
              <SlidersHorizontal className="h-4 w-4 text-brand-500" />
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
          <Section
            title="Tipo de Entrega"
            open={sections.entrega}
            onToggle={() => toggleSection('entrega')}
          >
            <Radio
              name="entrega"
              label="Envío a domicilio"
              icon={<Truck className="h-4 w-4 text-ink-500" />}
              checked={borrador.entrega === 'DOMICILIO'}
              onChange={() => setBorrador((b) => ({ ...b, entrega: 'DOMICILIO' }))}
            />
            <Radio
              name="entrega"
              label="Retiro en tienda"
              icon={<StoreIcon className="h-4 w-4 text-ink-500" />}
              checked={borrador.entrega === 'TIENDA'}
              onChange={() => setBorrador((b) => ({ ...b, entrega: 'TIENDA' }))}
            />
          </Section>

          <Section
            title="Categoría"
            open={sections.categoria}
            onToggle={() => toggleSection('categoria')}
          >
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_UI.map((c) => (
                <Pill
                  key={c.value}
                  label={c.label}
                  active={borrador.categorias.includes(c.value)}
                  onClick={() => toggleCategoria(c.value)}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Tipo de Producto"
            open={sections.producto}
            onToggle={() => toggleSection('producto')}
          >
            <div className="flex flex-wrap gap-2">
              {TIPOS_PRODUCTO.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  active={borrador.tiposProducto.includes(t)}
                  onClick={() => toggleTipoProducto(t)}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Tipo de Servicio"
            open={sections.servicio}
            onToggle={() => toggleSection('servicio')}
          >
            {TIPOS_SERVICIO_UI.map((s) => (
              <Radio
                key={s.value}
                name="servicio"
                label={s.label}
                checked={borrador.tipoServicio === s.value}
                onChange={() =>
                  setBorrador((b) => ({ ...b, tipoServicio: s.value }))
                }
              />
            ))}
          </Section>

          <Section
            title="Color"
            open={sections.color}
            onToggle={() => toggleSection('color')}
          >
            <Select
              placeholder="Todos"
              value={borrador.color ?? ''}
              onChange={(v) =>
                setBorrador((b) => ({ ...b, color: v ? v : null }))
              }
              options={['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde']}
            />
          </Section>

          <Section
            title="Material"
            open={sections.material}
            onToggle={() => toggleSection('material')}
          >
            <Select
              placeholder="Todos"
              value={borrador.material ?? ''}
              onChange={(v) =>
                setBorrador((b) => ({ ...b, material: v ? v : null }))
              }
              options={['Algodón', 'Denim', 'Cuero', 'Poliéster', 'Lana']}
            />
          </Section>

          <Section
            title="Talla"
            open={sections.talla}
            onToggle={() => toggleSection('talla')}
          >
            <div className="flex flex-wrap gap-2">
              {TALLAS.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  active={borrador.tallas.includes(t)}
                  onClick={() => toggleTalla(t)}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Rango de Precio"
            open={sections.precio}
            onToggle={() => toggleSection('precio')}
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={borrador.precioMin ?? ''}
                onChange={(e) =>
                  setBorrador((b) => ({
                    ...b,
                    precioMin: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="h-10 w-full rounded-md border border-ink-100 bg-white px-3 text-[14px] text-ink-700 focus:border-brand-500 focus:outline-none"
              />
              <span className="text-ink-500">—</span>
              <input
                type="number"
                placeholder="Máx"
                value={borrador.precioMax ?? ''}
                onChange={(e) =>
                  setBorrador((b) => ({
                    ...b,
                    precioMax: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="h-10 w-full rounded-md border border-ink-100 bg-white px-3 text-[14px] text-ink-700 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </Section>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col gap-2 border-t border-ink-100 p-6">
          <button
            onClick={aplicarFiltros}
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

/* ----------------------- Helper de filtrado client-side ----------------------- */

/**
 * Aplica los filtros sobre una lista de productos en el cliente.
 * Útil cuando ya tienes la data cargada y no quieres re-fetchear al backend
 * (ej. en DetalleTiendaPage donde solo filtras dentro del catálogo de UNA tienda).
 *
 * Nota: campos como `entrega`, `color`, `material`, `tallas`, `tiposProducto`
 * no se aplican porque los productos mock no tienen esa info. Cuando el backend
 * exista, estos llegarán como query params al endpoint.
 */
export function aplicarFiltrosCliente(
  productos: import('../types/IProducto').IProducto[],
  filtros: IFiltrosCatalogo,
): import('../types/IProducto').IProducto[] {
  return productos.filter((p) => {
    if (
      filtros.categorias.length > 0 &&
      !filtros.categorias.includes(p.categoria)
    )
      return false;
    if (filtros.tipoServicio && p.tipoServicio !== filtros.tipoServicio)
      return false;
    if (filtros.precioMin != null && (p.precioFinal ?? Infinity) < filtros.precioMin)
      return false;
    if (filtros.precioMax != null && (p.precioFinal ?? 0) > filtros.precioMax)
      return false;
    return true;
  });
}

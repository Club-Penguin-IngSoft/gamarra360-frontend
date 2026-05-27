/**
 * Dropdown "Ordenar por" reutilizable.
 *
 * Se usa en:
 *  - CatalogoPage (catálogo global)
 *  - DetalleTiendaPage (catálogo de una tienda)
 *
 * Componente controlado — el padre maneja el valor seleccionado.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  /** Etiqueta sobre el dropdown (por defecto "Ordenar por") */
  label?: string;
  /** Ancho mínimo del dropdown */
  minWidth?: string;
}

export default function SortSelect({
  value,
  onChange,
  options,
  label = 'Ordenar por',
  minWidth = '260px',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex flex-col gap-1"
      style={{ minWidth }}
    >
      <label className="text-[13px] text-ink-500">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center justify-between gap-2 rounded border border-ink-100 bg-white px-3 text-[14px] text-ink-900 hover:border-ink-200"
      >
        <span>{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[72px] z-10 overflow-hidden rounded border border-ink-100 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-[14px] hover:bg-surface-muted ${
                opt === value ? 'text-brand-600' : 'text-ink-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Opciones por defecto que usa todo el catálogo */
export const SORT_OPTIONS_DEFAULT = [
  'Lo más reciente',
  'Menor precio',
  'Mayor precio',
];

/**
 * Stepper de cantidad reutilizable (-/+).
 *
 * Se usa en:
 *  - DetalleProductoPage (compra directa + personalizable)
 *  - PersonalizacionPage
 *  - CartDrawer
 *  - CarritoPage
 *
 * Props:
 *  - `size`: 'sm' (drawer, item compacto) | 'md' (default, formularios)
 *  - `min`: cantidad mínima (por defecto 1)
 *  - `max`: cantidad máxima opcional (ej. para limitar al stock disponible)
 */

import { Minus, Plus } from 'lucide-react';

interface Props {
  cantidad: number;
  onChange: (cantidad: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  /** Label aria opcional para accesibilidad — describe qué se está contando */
  ariaLabel?: string;
}

export default function QuantityStepper({
  cantidad,
  onChange,
  min = 1,
  max,
  size = 'md',
  ariaLabel,
}: Props) {
  const sizes = {
    sm: { button: 'w-8 h-8', text: 'w-8 text-[13px]', icon: 'h-3 w-3', height: 'h-8' },
    md: { button: 'w-11 h-11', text: 'w-14 text-[15px]', icon: 'h-4 w-4', height: 'h-11' },
  } as const;
  const s = sizes[size];

  const disableMinus = cantidad <= min;
  const disablePlus = max !== undefined && cantidad >= max;

  return (
    <div
      className={`flex ${s.height} w-fit items-center rounded-md border border-ink-100 bg-white`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, cantidad - 1))}
        disabled={disableMinus}
        className={`flex h-full ${s.button} items-center justify-center text-ink-700 transition-colors hover:bg-surface-muted disabled:opacity-40`}
        aria-label="Disminuir cantidad"
      >
        <Minus className={s.icon} />
      </button>
      <span
        className={`flex h-full ${s.text} items-center justify-center font-medium text-ink-900`}
      >
        {cantidad}
      </span>
      <button
        type="button"
        onClick={() => onChange(cantidad + 1)}
        disabled={disablePlus}
        className={`flex h-full ${s.button} items-center justify-center text-ink-700 transition-colors hover:bg-surface-muted disabled:opacity-40`}
        aria-label="Aumentar cantidad"
      >
        <Plus className={s.icon} />
      </button>
    </div>
  );
}

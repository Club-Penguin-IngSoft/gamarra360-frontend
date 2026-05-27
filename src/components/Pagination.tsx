/**
 * Paginación numérica reutilizable.
 *
 * Diseño: círculo brand para la página activa, círculos blancos con borde
 * para el resto, "…" para rangos comprimidos, flechas para ir adelante/atrás.
 *
 * Algoritmo de páginas:
 *  - ≤ 5 páginas → 1, 2, 3, 4, 5
 *  - Página actual cerca del inicio → 1, 2, 3, …, N
 *  - Página actual cerca del fin → 1, …, N-2, N-1, N
 *  - Página actual en el medio → 1, …, actual, …, N
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Alinea hacia la derecha en lugar de centrar (uso en toolbars) */
  compact?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  compact = false,
}: Props) {
  const pages: (number | '...')[] = (() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 2)
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page, '...', totalPages];
  })();

  return (
    <div
      className={`flex items-center gap-1 ${compact ? 'justify-end' : 'justify-center'}`}
    >
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`${p}-${i}`}
            className="flex h-10 w-10 items-center justify-center text-[15px] text-ink-500"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`flex h-10 min-w-[40px] items-center justify-center rounded-full px-3 text-[15px] font-medium transition-colors ${
              p === page
                ? 'bg-brand-500 text-white'
                : 'text-ink-700 hover:bg-surface-muted'
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

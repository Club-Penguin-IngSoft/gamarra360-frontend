/**
 * Componente genérico para estados vacíos (sin resultados, lista vacía,
 * filtro sin coincidencias, etc.).
 *
 * Se usa en:
 *  - CarritoPage (carrito vacío)
 *  - TiendasPage (sin resultados de filtro)
 *  - DetalleTiendaPage > CatalogoSection (sin productos en la tienda o sin matches)
 *  - PersonalizacionPage / DetalleProducto error states (variante similar)
 *
 * Soporta acción opcional con texto + icono + handler O un elemento custom.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /**
   * Acción opcional al pie. Puede ser un botón con texto + onClick, o un
   * elemento custom (ej. un <Link>).
   */
  action?: ReactNode;
  /** Si true, ocupa fondo blanco card-like (default). Si false, transparente */
  card?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  card = true,
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 text-center ${
        card ? 'rounded-xl bg-white' : ''
      }`}
    >
      {Icon && <Icon className="h-16 w-16 text-ink-200" strokeWidth={1.5} />}
      <div className="flex flex-col gap-2">
        <h3 className="text-[20px] font-semibold text-ink-900">{title}</h3>
        {description && (
          <p className="max-w-md text-[14px] leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

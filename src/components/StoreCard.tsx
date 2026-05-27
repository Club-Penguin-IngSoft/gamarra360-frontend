/**
 * Card de tienda reutilizable.
 *
 * Se usa en:
 *  - InicioPage > Directorio (variante 'compact' sin galería)
 *  - TiendasPage > grid (variante 'default' con galería)
 *
 * La card incluye logo, nombre, descripción y un link "Visitar tienda →"
 * que navega al detalle de la tienda.
 */

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RUTAS } from '../constants/rutas';
import type { ITienda } from '../types/ITienda';
import { ETIQUETA_GALERIA } from '../types/ITienda';

interface Props {
  tienda: ITienda;
  /**
   * - 'default' (Tiendas grid): logo grande con ring, label de galería, botón al final
   * - 'compact' (Directorio del Home): logo pequeño, sin galería, botón inline
   */
  variant?: 'default' | 'compact';
}

export default function StoreCard({ tienda, variant = 'default' }: Props) {
  if (variant === 'compact') {
    return (
      <article className="flex h-full flex-col rounded-xl border border-ink-50 bg-white p-6">
        <div className="mb-4">
          <div className="h-12 w-12 overflow-hidden rounded-md bg-surface-muted ring-1 ring-ink-100">
            <img
              src={tienda.logo}
              alt={tienda.nombre}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <h3 className="text-[20px] font-semibold text-ink-900">
            {tienda.nombre}
          </h3>

          <p className="mt-2 min-h-[72px] text-[14px] leading-relaxed text-ink-500">
            {tienda.descripcion}
          </p>

          <div className="mt-3">
            <Link
              to={RUTAS.DETALLE_TIENDA(tienda.id)}
              className="inline-flex items-center rounded-lg px-0 py-1 text-[15px] font-medium text-brand-600 hover:text-brand-500"
            >
              Visitar tienda
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // variant === 'default'
  return (
    <article className="flex h-full flex-col gap-6 rounded-xl border border-ink-50 bg-white p-6">
      <div className="flex flex-col gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-xl bg-surface-muted ring-1 ring-ink-100">
          <img
            src={tienda.logo}
            alt={`Logo ${tienda.nombre}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-[20px] font-semibold leading-tight text-ink-900">
            {tienda.nombre}
          </h3>
          <p className="text-[14px] leading-relaxed text-ink-500 line-clamp-3">
            {tienda.descripcion}
          </p>
        </div>

        {tienda.galeria && (
          <span className="text-[12px] uppercase tracking-wider text-ink-400">
            {ETIQUETA_GALERIA[tienda.galeria]}
          </span>
        )}
      </div>

      <div className="mt-auto flex justify-end">
        <Link
          to={RUTAS.DETALLE_TIENDA(tienda.id)}
          className="inline-flex items-center gap-1 text-[15px] font-medium text-brand-600 hover:text-brand-500"
        >
          Visitar tienda
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

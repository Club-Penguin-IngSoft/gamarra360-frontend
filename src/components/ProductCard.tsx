/**
 * Card de producto reutilizable para listados (catálogo, related products,
 * destacados del home, catálogo de tienda).
 *
 * Compuesto por `TagPill` + `PriceDisplay` + título + tienda. La card entera
 * es un `<Link>` que navega al detalle del producto.
 *
 * Variantes:
 *  - 'default' (size lg) → catálogo principal, cards grandes
 *  - 'compact' (size sm) → related products en detalle de producto
 */

import { Link } from 'react-router-dom';
import { Store as StoreIcon } from 'lucide-react';
import { RUTAS } from '../constants/rutas';
import TagPill from './TagPill';
import PriceDisplay from './PriceDisplay';
import type { IProducto } from '../types/IProducto';

interface Props {
  producto: IProducto;
  variant?: 'default' | 'compact';
}

export default function ProductCard({ producto, variant = 'default' }: Props) {
  // Sin precio definido: tanto COTIZACION como PERSONALIZABLE sin precio
  // deben mostrar "Bajo Pedido" con el estilo correcto (gris italic).
  const esCotizacion =
    producto.tipoServicio === 'COTIZACION' ||
    (producto.tipoServicio === 'PERSONALIZABLE' && !producto.precioFinal);

  const styles = {
    default: {
      title: 'text-[18px]',
      store: 'text-[14px]',
      tagSize: 'md' as const,
      priceSize: 'md' as const,
      iconSize: 'h-4 w-4',
    },
    compact: {
      title: 'text-[16px]',
      store: 'text-[13px]',
      tagSize: 'sm' as const,
      priceSize: 'sm' as const,
      iconSize: 'h-3.5 w-3.5',
    },
  } as const;
  const s = styles[variant];

  return (
    <Link
      to={RUTAS.DETALLE_PRODUCTO(producto.id)}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-50 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        <img
          src={producto.imagenes[0]}
          alt={producto.titulo}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          <TagPill producto={producto} size={s.tagSize} fixedWidth />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2 pb-3 pt-3">
        <h3
          className={`font-semibold leading-snug text-ink-800 line-clamp-2 ${s.title}`}
        >
          {producto.titulo}
        </h3>

        <div className={`mt-0.5 flex items-center gap-1 text-ink-500 ${s.store}`}>
          <StoreIcon className={s.iconSize} />
          <span>{producto.nombreTienda}</span>
        </div>

        <div className="mt-auto pt-3">
          <PriceDisplay
            precioBase={producto.precioBase}
            precioFinal={producto.precioFinal}
            esCotizacion={esCotizacion}
            size={s.priceSize}
            layout="between"
          />
        </div>
      </div>
    </Link>
  );
}

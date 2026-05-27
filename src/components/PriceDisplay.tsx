/**
 * Componente de precio con descuento.
 *
 * Renderiza:
 *  - Si es producto COTIZACION → "Bajo Pedido" (italic)
 *  - Si tiene descuento → precio final (bold brand-600) + badge de descuento + precio base tachado
 *  - Si no → solo precio final
 *
 * Variantes de tamaño:
 *  - 'sm' → en product cards de grid (texto 18-20px)
 *  - 'md' → en product cards estándar (22px)
 *  - 'lg' → en página de detalle de producto (32-36px)
 *
 * El badge de descuento usa el SVG `etiqueta-descuento.svg` superpuesto con
 * el porcentaje calculado por `calcularDescuento`.
 */

import discountBadge from '../assets/images/etiqueta-descuento.svg';
import { calcularDescuento, formatearPrecio } from '../utils/formatearPrecio';

interface Props {
  precioBase?: number;
  precioFinal?: number;
  /** Si true, muestra "Bajo Pedido" en italic en lugar del precio */
  esCotizacion?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Multiplicador opcional (cantidad). Si se pasa, los precios mostrados son
   * `base * cantidad` y `final * cantidad`. Útil para item de carrito.
   */
  cantidad?: number;
  /** Alineación del badge de descuento ('between' para card grid, 'inline' para detalle) */
  layout?: 'between' | 'inline';
}

export default function PriceDisplay({
  precioBase,
  precioFinal,
  esCotizacion = false,
  size = 'md',
  cantidad = 1,
  layout = 'inline',
}: Props) {
  const sizes = {
    sm: {
      finalText: 'text-[18px]',
      baseText: 'text-[13px]',
      badge: 'h-6 w-[54px] text-[11px]',
      quote: 'text-[18px]',
    },
    md: {
      finalText: 'text-[22px]',
      baseText: 'text-sm',
      badge: 'h-7 w-[62px] text-[12px]',
      quote: 'text-[22px]',
    },
    lg: {
      finalText: 'text-[32px] md:text-[36px]',
      baseText: 'text-[20px]',
      badge: 'h-9 w-[80px] text-[14px]',
      quote: 'text-[28px]',
    },
  } as const;
  const s = sizes[size];

  // Caso cotización: solo "Bajo Pedido"
  if (esCotizacion) {
    return (
      <span
        className={`italic font-medium leading-none text-ink-500 ${s.quote}`}
      >
        Bajo Pedido
      </span>
    );
  }

  const finalConCantidad =
    precioFinal !== undefined ? precioFinal * cantidad : undefined;
  const baseConCantidad =
    precioBase !== undefined ? precioBase * cantidad : undefined;

  const tieneDescuento =
    precioBase !== undefined &&
    precioFinal !== undefined &&
    precioBase > precioFinal;
  const descuento = calcularDescuento(precioBase, precioFinal);

  const wrapperClass =
    layout === 'between'
      ? 'flex items-center justify-between gap-2'
      : 'flex items-center gap-3';

  return (
    <div className="flex flex-col gap-1">
      <div className={wrapperClass}>
        <span
          className={`font-bold leading-none text-brand-600 ${s.finalText}`}
        >
          {formatearPrecio(finalConCantidad)}
        </span>

        {tieneDescuento && (
          <div className={`relative shrink-0 ${s.badge}`}>
            <img
              src={discountBadge}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
            />
            <span className="absolute inset-0 flex items-center justify-center font-bold leading-none text-white">
              -{descuento}%
            </span>
          </div>
        )}
      </div>

      {tieneDescuento && (
        <span className={`leading-none text-ink-500 line-through ${s.baseText}`}>
          {formatearPrecio(baseConCantidad)}
        </span>
      )}
    </div>
  );
}

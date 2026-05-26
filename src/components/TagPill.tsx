/**
 * Pill de etiqueta de tipo de servicio (COMPRA DIRECTA / PERSONALIZABLE /
 * COTIZACIÓN). Los colores vienen del mapeo central
 * `COLOR_BG_TAG_POR_TIPO_SERVICIO` para mantener consistencia visual
 * en todo el frontend.
 *
 * Variantes de tamaño:
 *  - 'sm' → cards pequeños (related products, store hero)
 *  - 'md' → product cards estándar (catálogo)
 *  - 'lg' → product detail (heading)
 */

import type { IProducto } from '../types/IProducto';
import {
  COLOR_BG_TAG_POR_TIPO_SERVICIO,
  ETIQUETA_POR_TIPO_SERVICIO,
} from '../types/IProducto';

interface Props {
  producto: Pick<IProducto, 'tipoServicio'>;
  size?: 'sm' | 'md' | 'lg';
  /** Si true, ocupa un ancho fijo con etiqueta centrada (uso en cards de grid) */
  fixedWidth?: boolean;
}

export default function TagPill({
  producto,
  size = 'md',
  fixedWidth = false,
}: Props) {
  const claseBg = COLOR_BG_TAG_POR_TIPO_SERVICIO[producto.tipoServicio];
  const etiqueta = ETIQUETA_POR_TIPO_SERVICIO[producto.tipoServicio];

  const sizes = {
    sm: 'h-6 px-2.5 text-[10px]',
    md: 'h-7 px-3 text-[12px]',
    lg: 'px-3 py-1 text-[10px]',
  } as const;

  const widthClass = fixedWidth ? 'w-[140px] justify-center' : 'w-fit';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide whitespace-nowrap text-white ${claseBg} ${sizes[size]} ${widthClass}`}
    >
      {etiqueta}
    </span>
  );
}

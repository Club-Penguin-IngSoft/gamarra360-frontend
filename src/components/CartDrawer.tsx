/**
 * Drawer lateral del carrito.
 *
 * Se monta en `StoreProvider` para que esté disponible en todas las páginas.
 * Se abre automáticamente cuando el usuario hace click en "Añadir al carrito"
 * desde el detalle de producto (lógica en `CarritoContext.agregarAlCarrito`).
 *
 * Diseño basado en Figma nodes 2368:9851 (primer item) y 2540:9317 (varios items)
 * — ambos son el mismo componente con diferente cantidad de items.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  X,
  CheckCircle2,
  Store as StoreIcon,
} from 'lucide-react';
import { useCarrito } from '../hooks/useCarrito';
import QuantityStepper from './QuantityStepper';
import { RUTAS } from '../constants/rutas';
import { formatearPrecio } from '../utils/formatearPrecio';
import type { IItemCarrito } from '../types/ICarrito';

/* --------------------------- Cart Item Row ------------------------------ */

function CartItemRow({ item }: { item: IItemCarrito }) {
  const { actualizarCantidad } = useCarrito();

  const variante = item.producto.variantes?.find((v) => v.id === item.idVariante);
  const talla = variante?.talla;
  const color = variante?.color;

  const tieneDescuento =
    item.producto.precioBase !== undefined &&
    item.producto.precioFinal !== undefined &&
    item.producto.precioBase > item.producto.precioFinal;

  return (
    <div className="flex gap-3 border-b border-ink-100 py-4">
      {/* Image */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-ink-100 bg-surface-muted">
        <img
          src={item.producto.imagenes[0]}
          alt={item.producto.titulo}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right column */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[14px] font-semibold leading-tight text-ink-900 line-clamp-2">
            {item.producto.titulo}
          </h4>
          <div className="flex items-center gap-1 text-[12px] text-ink-500">
            <StoreIcon className="h-3 w-3" />
            <span className="truncate">{item.producto.nombreTienda}</span>
          </div>
        </div>

        {/* Tags TALLA / COLOR */}
        {(talla || color) && (
          <div className="flex flex-wrap gap-1.5">
            {talla && (
              <span className="rounded bg-surface-tag px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-ink-700">
                TALLA: {talla}
              </span>
            )}
            {color && (
              <span className="rounded bg-surface-tag px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-ink-700">
                COLOR: {color.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Bottom row: quantity + price */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <QuantityStepper
            cantidad={item.cantidad}
            onChange={(n) => actualizarCantidad(item.id, n)}
            size="sm"
            ariaLabel={`Cantidad de ${item.producto.titulo}`}
          />

          <div className="flex flex-col items-end leading-tight">
            <span className="text-[16px] font-bold text-brand-600">
              {formatearPrecio(item.precioUnitario * item.cantidad)}
            </span>
            {tieneDescuento && (
              <span className="text-[11px] text-ink-500 line-through">
                {formatearPrecio(item.producto.precioBase! * item.cantidad)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Drawer -------------------------------- */

export default function CartDrawer() {
  const {
    items,
    subtotal,
    cantidadTotal,
    drawerOpen,
    justAdded,
    cerrarDrawer,
  } = useCarrito();

  // Cerrar con ESC
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarDrawer();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen, cerrarDrawer]);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  // Construir el texto del alert de éxito
  const alertText = justAdded
    ? (() => {
        const detalles = [
          justAdded.color,
          justAdded.talla ? `Talla ${justAdded.talla}` : null,
        ]
          .filter(Boolean)
          .join(', ');
        return detalles
          ? `¡${justAdded.titulo} (${detalles}) se agregó a tu carrito!`
          : `¡${justAdded.titulo} se agregó a tu carrito!`;
      })()
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={cerrarDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Tu carrito"
        aria-hidden={!drawerOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FCEDF1' }}
            >
              <ShoppingBag className="h-5 w-5 text-brand-500" />
            </span>
            <div className="flex flex-col leading-tight">
              <h2 className="text-[18px] font-semibold text-ink-900">
                Tu Carrito
              </h2>
              <span className="text-[13px] text-ink-700">
                ({cantidadTotal}{' '}
                {cantidadTotal === 1 ? 'artículo' : 'artículos'})
              </span>
            </div>
          </div>
          <button
            onClick={cerrarDrawer}
            className="rounded-md p-1 text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success alert */}
        {alertText && (
          <div
            className="flex items-start gap-2 border-b border-emerald-100 px-6 py-3"
            style={{ backgroundColor: '#EFFFF5' }}
            role="status"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
            <p className="text-[13px] font-medium leading-snug text-emerald-800">
              {alertText}
            </p>
          </div>
        )}

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-ink-200" />
              <p className="text-[14px] text-ink-500">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-ink-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold tracking-wider text-ink-700">
                SUBTOTAL
              </span>
              <span className="text-[22px] font-bold text-brand-600">
                {formatearPrecio(subtotal)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to={RUTAS.CARRITO}
                onClick={cerrarDrawer}
                className="flex h-12 items-center justify-center rounded-lg bg-brand-500 text-[15px] font-medium text-white transition-colors hover:bg-brand-600"
              >
                Ir al carrito
              </Link>
              <button
                onClick={cerrarDrawer}
                className="flex h-12 items-center justify-center rounded-lg border border-brand-500 bg-white text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

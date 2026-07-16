/**
 * Página del carrito de compras.
 * Accesible desde:
 *  - Icono del carrito en el TopBar
 *  - Botón "Ir al carrito" del CartDrawer
 *
 * Basada en los diseños Figma 2368-10723 (1 item) y 2541-13675 (varios items)
 * — ambos son la misma página con diferente cantidad de items y pluralización
 * del contador.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Store as StoreIcon,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import QuantityStepper from '../components/QuantityStepper';
import EmptyState from '../components/EmptyState';
import { useCarrito } from '../hooks/useCarrito';
import { formatearPrecio } from '../utils/formatearPrecio';
import { RUTAS } from '../constants/rutas';
import type { IItemCarrito } from '../types/ICarrito';
import { useAuth } from '../hooks/useAuth';
/* ----------------------------- Item Card ------------------------------- */

function CartItemCard({ item }: { item: IItemCarrito }) {
  const { actualizarCantidad, quitarDelCarrito } = useCarrito();

  const variante = item.producto.variantes?.find((v) => v.id === item.idVariante);
  const talla = variante?.talla;
  const color = variante?.color;

  // El "precio sin oferta" es el propio de la variante (o el base del producto si la
  // variante no tiene uno propio) — NUNCA el precioBase del producto a secas, porque
  // una variante puede tener su propio precio distinto sin que eso sea un descuento.
  const precioSinOferta = variante?.precioAjustado ?? item.producto.precioBase ?? item.precioUnitario;
  const tieneDescuento = item.producto.oferta != null && precioSinOferta > item.precioUnitario;

  return (
    <article className="flex flex-col gap-4 rounded-xl bg-white p-6 sm:flex-row sm:gap-6">
      {/* Image */}
      <Link
        to={RUTAS.DETALLE_PRODUCTO(item.producto.id)}
        className="block h-32 w-32 shrink-0 overflow-hidden rounded-md border border-ink-100 bg-surface-muted"
      >
        <img
          src={item.producto.imagenes[0]}
          alt={item.producto.titulo}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Right column */}
      <div className="flex flex-1 flex-col gap-3 min-w-0">
        {/* Title + delete */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <Link
              to={RUTAS.DETALLE_PRODUCTO(item.producto.id)}
              className="text-[18px] font-semibold leading-tight text-ink-900 line-clamp-2 hover:text-brand-600"
            >
              {item.producto.titulo}
            </Link>
            <div className="flex items-center gap-1 text-[13px] text-ink-500">
              <StoreIcon className="h-3.5 w-3.5" />
              <span>{item.producto.nombreTienda}</span>
            </div>
          </div>
          <button
            onClick={() => quitarDelCarrito(item.id)}
            className="shrink-0 rounded-md p-1.5 text-ink-500 transition-colors hover:bg-surface-muted hover:text-brand-500"
            aria-label={`Eliminar ${item.producto.titulo} del carrito`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Tags */}
        {(talla || color) && (
          <div className="flex flex-wrap gap-2">
            {talla && (
              <span className="rounded bg-surface-tag px-2 py-1 text-[12px] font-medium tracking-wide text-ink-700">
                TALLA: {talla}
              </span>
            )}
            {color && (
              <span className="rounded bg-surface-tag px-2 py-1 text-[12px] font-medium tracking-wide text-ink-700">
                COLOR: {color.toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Quantity + Price */}
        <div className="mt-auto flex items-end justify-between gap-3">
          <QuantityStepper
            cantidad={item.cantidad}
            onChange={(n) => actualizarCantidad(item.id, n)}
            max={item.producto.variantes?.find(v => v.id === item.idVariante)?.stock}
            ariaLabel={`Cantidad de ${item.producto.titulo}`}
          />

          <div className="flex flex-col items-end leading-tight">
            <span className="text-[20px] font-bold text-brand-600">
              {formatearPrecio(item.precioUnitario * item.cantidad)}
            </span>
            {tieneDescuento && (
              <span className="text-[14px] text-ink-500 line-through">
                {formatearPrecio(precioSinOferta * item.cantidad)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------- Summary Sidebar -------------------------- */

function ResumenCompra() {
  const { items } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Total real = precios efectivos de variante (precioUnitario ya usa precioEfectivo)
  const total = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);

  // Ahorro por ofertas: solo cuenta si el producto tiene una oferta ACTIVA vigente
  // (producto.oferta != null). El precio "sin oferta" es el propio de la variante,
  // no el precioBase del producto — una variante puede tener su propio precio sin
  // que eso sea un descuento.
  const descuentos = items.reduce((acc, i) => {
    if (i.producto.oferta == null) return acc;
    const variante = i.producto.variantes?.find((v) => v.id === i.idVariante);
    const precioSinOferta = variante?.precioAjustado ?? i.producto.precioBase ?? i.precioUnitario;
    return acc + Math.max(0, (precioSinOferta - i.precioUnitario) * i.cantidad);
  }, 0);

  // "Subtotal" mostrado = lo que costaría sin ofertas (total + ahorros = precios base)
  const subtotalSinDescuento = total + descuentos;
  
  function handleContinuar() {
    if (!usuario) {
      navigate(RUTAS.LOGIN);            // no logueado → login
      return;
    }
    navigate(RUTAS.CHECKOUT);           // logueado → checkout
  }
  return (
    <aside className="flex h-fit flex-col gap-6 rounded-xl bg-white p-6 lg:sticky lg:top-24">
      <h2 className="text-[20px] font-semibold text-ink-900">
        Resumen de Compra
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[15px]">
          <span className="text-ink-700">Subtotal</span>
          <span className="text-ink-900">
            {formatearPrecio(subtotalSinDescuento)}
          </span>
        </div>
        {descuentos > 0 && (
          <div className="flex items-center justify-between text-[15px] text-brand-600">
            <span>Descuentos</span>
            <span>- {formatearPrecio(descuentos)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 pt-4">
        <span className="text-[18px] font-semibold text-ink-900">Total</span>
        <span className="text-[24px] font-bold text-brand-600">
          {formatearPrecio(total)}
        </span>
      </div>

      <button
        onClick={handleContinuar}
        className="h-14 rounded-lg bg-brand-500 text-[16px] font-medium text-white transition-colors hover:bg-brand-600"
      >
        Continuar compra
      </button>
    </aside>
  );
}

/* ----------------------------- Empty State ----------------------------- */

function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Tu carrito está vacío"
      description="Agrega productos del catálogo y vuelve aquí para finalizar tu compra."
      action={
        <Link
          to={RUTAS.CATALOGO}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Ir al catálogo
        </Link>
      }
    />
  );
}

/* ---------------------------------- Page ------------------------------- */

export default function CarritoPage() {
  const { items, cantidadTotal } = useCarrito();

  return (
    <div className="min-h-screen bg-surface-muted">
      <TopBar active="Inicio" />
      <main className="px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left: Product list */}
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-[36px] font-bold text-ink-900 md:text-[40px]">
                  Tu Carrito
                </h1>
                <span className="text-[15px] font-medium uppercase tracking-[0.08em] text-ink-500">
                  {cantidadTotal}{' '}
                  {cantidadTotal === 1 ? 'ARTÍCULO' : 'ARTÍCULOS'}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Right: Summary sidebar */}
            <ResumenCompra />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

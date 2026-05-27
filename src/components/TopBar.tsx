import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import accountCircleIcon from '../assets/images/account_circle.svg';
import shoppingCartIcon from '../assets/images/shopping_cart.svg';
import Logo from './Logo';
import { RUTAS } from '../constants/rutas';
import { useCarrito } from '../hooks/useCarrito';
import { listarProductos } from '../services/catalogoService';
import type { IProducto } from '../types/IProducto';

export type NavKey =
  | 'Inicio'
  | 'Productos'
  | 'Tiendas'
  | 'Cotizaciones'
  | 'Vender';

type NavItem = {
  label: NavKey;
  to: string;
};

const navItems: NavItem[] = [
  { label: 'Inicio', to: RUTAS.INICIO },
  { label: 'Productos', to: RUTAS.CATALOGO },
  { label: 'Tiendas', to: RUTAS.TIENDAS },
  { label: 'Cotizaciones', to: RUTAS.COTIZACIONES },
  { label: 'Vender', to: RUTAS.VENDER },
];

export default function TopBar({ active = 'Inicio' }: { active?: NavKey }) {
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // El input se inicializa con el `q` actual de la URL si estamos en /productos
  const [queryInput, setQueryInput] = useState(searchParams.get('q') ?? '');
  const [suggestions, setSuggestions] = useState<IProducto[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const requestIdRef = useRef(0);
  const blurTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const q = queryInput.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestOpen(false);
      setSuggestLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setSuggestLoading(true);
    const timer = window.setTimeout(() => {
      listarProductos({ q, page: 1, size: 5, random: false, seed: null })
        .then((data) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(data.items.slice(0, 5));
          setSuggestOpen(true);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          setSuggestOpen(false);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setSuggestLoading(false);
        });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [queryInput]);

  /**
   * Búsqueda por keyword (CU-08, RF-22/23).
   * Navega a /productos?q=texto. Si el input está vacío, navega a /productos
   * sin query param (catálogo completo).
   */
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = queryInput.trim();
    setSuggestOpen(false);
    if (q.length > 0) {
      navigate(`${RUTAS.CATALOGO}?q=${encodeURIComponent(q)}`);
    } else {
      navigate(RUTAS.CATALOGO);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        {/* left: brand + nav */}
        <div className="flex items-center gap-8 self-stretch">
          <Link to={RUTAS.INICIO} aria-label="Ir al inicio">
            <Logo size="md" />
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => {
              const isActive = item.label === active;

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex flex-col items-center gap-2 px-2 pb-1 pt-2 ${
                    isActive
                      ? 'text-brand-600'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {/* Mismo peso para todos para evitar que el activo "se alce" */}
                  <span className="text-[18px] leading-[22px] font-medium">
                    {item.label}
                  </span>

                  {/* Siempre reservar espacio para la línea inferior */}
                  <span
                    className={`h-[3px] w-full rounded-full ${
                      isActive ? 'bg-brand-500' : 'bg-transparent'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* right: search + icon buttons */}
        <div className="flex items-center gap-5">
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden w-[460px] lg:w-[560px] md:block"
            role="search"
          >
            <button
              type="submit"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 transition-colors hover:text-brand-500"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onFocus={() => {
                if (blurTimeoutRef.current) {
                  window.clearTimeout(blurTimeoutRef.current);
                }
                if (suggestions.length > 0) setSuggestOpen(true);
              }}
              onBlur={() => {
                blurTimeoutRef.current = window.setTimeout(() => {
                  setSuggestOpen(false);
                }, 150);
              }}
              placeholder="Buscar productos o tiendas"
              className="h-11 w-full rounded-full border border-ink-100 bg-white pl-10 pr-4 text-[15px] text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:outline-none"
              aria-label="Buscar productos"
            />

            {suggestOpen && queryInput.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-lg">
                <div className="max-h-[320px] overflow-y-auto py-2">
                  {suggestLoading && (
                    <div className="px-4 py-2 text-[13px] text-ink-500">
                      Buscando...
                    </div>
                  )}
                  {!suggestLoading && suggestions.length === 0 && (
                    <div className="px-4 py-2 text-[13px] text-ink-500">
                      Sin resultados.
                    </div>
                  )}
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSuggestOpen(false);
                        navigate(RUTAS.DETALLE_PRODUCTO(item.id));
                      }}
                      className="flex w-full flex-col px-4 py-2 text-left hover:bg-surface-muted"
                    >
                      <span className="text-[14px] font-medium text-ink-900">
                        {item.titulo}
                      </span>
                      <span className="text-[12px] text-ink-500">
                        {item.nombreTienda}
                      </span>
                    </button>
                  ))}
                </div>
                {queryInput.trim().length >= 2 && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const q = queryInput.trim();
                      setSuggestOpen(false);
                      navigate(`${RUTAS.CATALOGO}?q=${encodeURIComponent(q)}`);
                    }}
                    className="flex w-full items-center justify-center border-t border-ink-100 px-4 py-2 text-[13px] font-medium text-brand-600 hover:bg-brand-50"
                  >
                    Ver todos los resultados
                  </button>
                )}
              </div>
            )}
          </form>

          <Link
            to={RUTAS.CUENTA}
            aria-label="Perfil"
            className="inline-flex items-center justify-center transition-opacity hover:opacity-80"
          >
            <img
              src={accountCircleIcon}
              alt=""
              className="h-8 w-8 object-contain"
            />
          </Link>

          <Link
            to={RUTAS.CARRITO}
            aria-label={`Carrito (${cantidadTotal} ${cantidadTotal === 1 ? 'artículo' : 'artículos'})`}
            className="relative inline-flex items-center justify-center transition-opacity hover:opacity-80"
          >
            <img
              src={shoppingCartIcon}
              alt=""
              className="h-8 w-8 object-contain"
            />
            {cantidadTotal > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {cantidadTotal > 9 ? '9+' : cantidadTotal}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

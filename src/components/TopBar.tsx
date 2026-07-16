import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import accountCircleIcon from '../assets/images/account_circle.svg';
import shoppingCartIcon from '../assets/images/shopping_cart.svg';
import Logo from './Logo';
import MaterialIcon from './MaterialIcon';
import { RUTAS } from '../constants/rutas';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../hooks/useAuth';
import { buscarProductos } from '../services/catalogoService';
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
  { label: 'Inicio',       to: RUTAS.INICIO },
  { label: 'Productos',    to: RUTAS.CATALOGO },
  { label: 'Tiendas',      to: RUTAS.TIENDAS },
  { label: 'Cotizaciones', to: RUTAS.COTIZACIONES },
  { label: 'Vender',       to: RUTAS.VENDER },
];

export default function TopBar({
  active = 'Inicio',
  minimal = false,
}: {
  active?: NavKey;
  minimal?: boolean;
}) {
  const { cantidadTotal, vaciarCarrito } = useCarrito();
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const nombreUsuario = usuario?.nombre || null;

  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<IProducto[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      setAbierto(false);
      return;
    }
    let cancelado = false;
    const timer = setTimeout(() => {
      buscarProductos(query.trim()).then((res) => {
        if (cancelado) return; // respuesta de una búsqueda anterior ya obsoleta
        setResultados(res);
        setAbierto(true);
      });
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  function seleccionarProducto(p: IProducto) {
    setQuery('');
    setAbierto(false);
    navigate(RUTAS.DETALLE_PRODUCTO(p.id));
  }

  function manejarTecla(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setAbierto(false);
      setQuery('');
    }
  }

  function handleCerrarSesion() {
    vaciarCarrito();
    cerrarSesion();
    navigate(RUTAS.INICIO);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white">
      <div className="flex h-20 items-center justify-between gap-3 px-4">

        {/* ── Izquierda: logo + nav ─────────────────────────────────── */}
        <div className="flex min-w-0 items-center gap-4 self-stretch lg:gap-8">
          {!minimal && (
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-ink-700 hover:bg-surface-muted md:hidden"
              aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          <Link to={RUTAS.INICIO} aria-label="Ir al inicio">
            <Logo size="md" />
          </Link>

          {!minimal && (
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
                    <span className="text-[16px] leading-[18px] font-medium">
                      {item.label}
                    </span>
                    <span
                      className={`h-[3px] w-full rounded-full ${
                        isActive ? 'bg-brand-500' : 'bg-transparent'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── Derecha ───────────────────────────────────────────────── */}
        {minimal ? (
          <Link
            to={RUTAS.INICIO}
            className="flex items-center gap-1 text-sm font-medium text-brand-600 transition-opacity hover:opacity-75"
          >
            <MaterialIcon name="arrow_back" style={{ fontSize: '18px' }} />
            Volver al Inicio
          </Link>
        ) : (
          <div className="flex flex-shrink-0 items-center gap-3 sm:gap-5">

            {/* Buscador */}
            <div
              ref={contenedorRef}
              className="relative hidden w-[460px] lg:w-[560px] md:block"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={manejarTecla}
                onFocus={() => { if (resultados.length > 0) setAbierto(true); }}
                placeholder="Buscar productos"
                className="h-11 w-full rounded-full border border-ink-100 bg-white pl-10 pr-4 text-[15px] text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:outline-none"
                autoComplete="off"
              />

              {abierto && resultados.length > 0 && (
                <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lg">
                  {resultados.map((p) => (
                    <li key={p.id}>
                      <button
                        onMouseDown={() => seleccionarProducto(p)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted"
                      >
                        {p.imagenes[0] && (
                          <img
                            src={p.imagenes[0]}
                            alt=""
                            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-ink-900">
                            {p.titulo}
                          </p>
                          <p className="text-[12px] text-ink-500">
                            {p.nombreTienda}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                  <li className="border-t border-ink-100">
                    <button
                      onMouseDown={() => {
                        setAbierto(false);
                        navigate(`${RUTAS.CATALOGO}?q=${encodeURIComponent(query)}`);
                        setQuery('');
                      }}
                      className="flex w-full items-center justify-center gap-2 px-4 py-3 text-[14px] font-medium text-brand-600 transition-colors hover:bg-surface-muted"
                    >
                      <Search className="h-4 w-4" />
                      Ver todos los resultados de "{query}"
                    </button>
                  </li>
                </ul>
              )}

              {abierto && query.trim().length >= 2 && resultados.length === 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-lg">
                  <p className="text-[14px] text-ink-500">
                    No se encontraron productos para "{query}"
                  </p>
                </div>
              )}
            </div>

            {/* Perfil — avatar con nombre si hay sesión, icono si no */}
            {/* Perfil */}
            {nombreUsuario ? (
              <Link
                to={RUTAS.CUENTA}
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {nombreUsuario.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-[14px] font-medium text-ink-800 lg:block">
                  {nombreUsuario}
                </span>
              </Link>
            ) : (
              <Link
                to={RUTAS.LOGIN}
                aria-label="Iniciar sesión"
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <img
                  src={accountCircleIcon}
                  alt="Iniciar sesión"
                  className="h-8 w-8 object-contain"
                />
              </Link>
            )}

            {/* Carrito */}
            <Link
              to={RUTAS.CARRITO}
              aria-label={`Carrito (${cantidadTotal} ${cantidadTotal === 1 ? 'artículo' : 'artículos'})`}
              className="relative inline-flex items-center justify-center transition-opacity hover:opacity-80"
            >
              <img src={shoppingCartIcon} alt="" className="h-8 w-8 object-contain" />
              {cantidadTotal > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                  {cantidadTotal > 9 ? '9+' : cantidadTotal}
                </span>
              )}
            </Link>

            {/* Cerrar sesión — solo visible si hay sesión activa */}
            {nombreUsuario && (
              <button
                onClick={handleCerrarSesion}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="hidden items-center justify-center transition-opacity hover:opacity-80 sm:inline-flex"
              >
                <MaterialIcon
                  name="logout"
                  style={{ fontSize: '22px', color: '#6b7280' }}
                />
              </button>
            )}

          </div>
        )}
      </div>
      {!minimal && mobileNavOpen && (
        <div className="border-t border-ink-100 px-4 pb-4 pt-3 md:hidden">
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${item.label === active ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-surface-muted'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={manejarTecla}
              placeholder="Buscar productos"
              className="h-11 w-full rounded-full border border-ink-100 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}

import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import accountCircleIcon from '../assets/images/account_circle.svg';
import shoppingCartIcon from '../assets/images/shopping_cart.svg';
import Logo from './Logo';
import { RUTAS } from '../constants/rutas';
import { useCarrito } from '../hooks/useCarrito';

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
          <div className="relative hidden w-[460px] lg:w-[560px] md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="text"
              placeholder="Buscar productos o tiendas"
              className="h-11 w-full rounded-full border border-ink-100 bg-white pl-10 pr-4 text-[15px] text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <Link
            to={RUTAS.LOGIN}
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

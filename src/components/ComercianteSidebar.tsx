import { Link, useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import LogoGamarra from './LogoGamarra';
import { RUTAS } from '../constants/rutas';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Inicio', icon: 'dashboard', to: RUTAS.COMERCIANTE_DASHBOARD },
  { label: 'Inventario', icon: 'inventory_2', to: RUTAS.COMERCIANTE_CATALOGO },
  { label: 'Pedidos', icon: 'shopping_bag', to: RUTAS.COMERCIANTE_PEDIDOS },
  { label: 'Promociones', icon: 'local_offer', to: RUTAS.COMERCIANTE_PROMOCIONES },
  { label: 'Personalizaciones', icon: 'palette', to: RUTAS.COMERCIANTE_PERSONALIZACIONES },
  { label: 'Cotizaciones', icon: 'request_quote', to: RUTAS.COMERCIANTE_COTIZACIONES },
  { label: 'Notificaciones', icon: 'notifications', to: RUTAS.COMERCIANTE_NOTIFICACIONES },
];

export default function ComercianteSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion, usuario } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    cerrarSesion();
    navigate(RUTAS.LOGIN, { replace: true });
  };

  return (
    <>
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl bg-primario text-white shadow-lg lg:hidden"
      aria-label="Abrir menú del comerciante"
    >
      <MaterialIcon name="menu" style={{ fontSize: '22px' }} />
    </button>
    {mobileOpen && (
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
      />
    )}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(18rem,85vw)] flex-shrink-0 flex-col overflow-y-auto border-r border-neutro-200 bg-white shadow-lg transition-transform lg:sticky lg:top-0 lg:z-10 lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <button
        type="button"
        onClick={() => setMobileOpen(false)}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-neutro-600 hover:bg-neutro-100 lg:hidden"
        aria-label="Cerrar menú del comerciante"
      >
        <MaterialIcon name="close" style={{ fontSize: '22px' }} />
      </button>
      <div className="border-b border-neutro-100 p-6">
        <Link to="/" className="flex items-center justify-center">
          <LogoGamarra size="md" />
        </Link>
        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-neutro-400">
          Panel Comerciante
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                active
                  ? 'bg-primario text-white shadow-primario'
                  : 'text-neutro-600 hover:bg-neutro-100'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <MaterialIcon name={item.icon} style={{ fontSize: '18px' }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-neutro-100 bg-neutro-50/50 p-4">
        <div className="flex items-center gap-3 px-2 pb-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-primario/10 bg-primario-claro">
            <span className="text-sm font-black text-primario">
              {(usuario?.nombre?.charAt(0) || 'C').toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-neutro-900">{usuario?.nombre || 'Comerciante'}</p>
            <p className="text-xs font-medium text-neutro-500">Comerciante</p>
          </div>
        </div>
        <Link
          to={RUTAS.COMERCIANTE_CUENTA}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
            location.pathname.startsWith(RUTAS.COMERCIANTE_CUENTA)
              ? 'bg-primario text-white shadow-primario'
              : 'text-neutro-600 hover:bg-neutro-100'
          }`}
          onClick={() => setMobileOpen(false)}
        >
          <MaterialIcon name="storefront" style={{ fontSize: '18px' }} />
          Ver Tienda
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
        >
          <MaterialIcon name="logout" style={{ fontSize: '18px' }} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    </>
  );
}

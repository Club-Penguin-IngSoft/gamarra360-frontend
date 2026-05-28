import { Link, useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import LogoGamarra from './LogoGamarra';
import { RUTAS } from '../constants/rutas';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Inicio', icon: 'dashboard', to: RUTAS.COMERCIANTE_DASHBOARD },
  { label: 'Inventario', icon: 'inventory_2', to: RUTAS.COMERCIANTE_CATALOGO },
  { label: 'Pedidos', icon: 'shopping_bag', to: RUTAS.COMERCIANTE_PEDIDOS },
  { label: 'Personalizaciones', icon: 'palette', to: RUTAS.COMERCIANTE_PERSONALIZACIONES },
  { label: 'Cotizaciones', icon: 'request_quote', to: RUTAS.COMERCIANTE_COTIZACIONES },
  { label: 'Notificaciones', icon: 'notifications', to: RUTAS.COMERCIANTE_NOTIFICACIONES },
];

export default function ComercianteSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();

  const handleLogout = () => {
    cerrarSesion();
    navigate(RUTAS.LOGIN, { replace: true });
  };

  return (
    <aside className="fixed top-0 left-0 w-64 min-h-screen bg-gray-900 text-white flex flex-col z-10 shadow-lg">
      <div className="px-6 py-5 border-b border-white/10">
        <LogoGamarra size="sm" className="brightness-0 invert" />
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">
          Panel Comerciante
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MaterialIcon name={item.icon} style={{ fontSize: '18px' }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        <Link
          to={RUTAS.INICIO}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
        >
          <MaterialIcon name="storefront" style={{ fontSize: '18px' }} />
          Ver Tienda
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-red-500/15 hover:text-red-400 transition-colors"
        >
          <MaterialIcon name="logout" style={{ fontSize: '18px' }} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

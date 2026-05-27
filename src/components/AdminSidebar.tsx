import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import LogoGamarra from './LogoGamarra';
import { RUTAS } from '../constants/rutas';

const NAV_ITEMS = [
  { label: 'Inicio', icon: 'dashboard', to: RUTAS.ADMIN_DASHBOARD },
  { label: 'Gestión de Usuarios', icon: 'people', to: RUTAS.ADMIN_USUARIOS },
  { label: 'Aprobación de Comerciantes', icon: 'verified', to: RUTAS.ADMIN_APROBACION_COMERCIANTES },
  { label: 'Notificaciones', icon: 'notifications', to: RUTAS.ADMIN_NOTIFICACIONES },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 w-64 min-h-screen bg-gray-900 text-white flex flex-col z-10 shadow-lg">
      <div className="px-6 py-5 border-b border-white/10">
        <LogoGamarra size="sm" className="brightness-0 invert" />
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">
          Panel Admin
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

      <div className="p-3 border-t border-white/10">
        <Link
          to={RUTAS.INICIO}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
        >
          <MaterialIcon name="storefront" style={{ fontSize: '18px' }} />
          Ver Tienda
        </Link>
      </div>
    </aside>
  );
}

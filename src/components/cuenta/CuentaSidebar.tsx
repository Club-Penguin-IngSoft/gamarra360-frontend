import { Link, useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../MaterialIcon';
import { RUTAS } from '../../constants/rutas';
import { useAuth } from '../../hooks/useAuth';
import { useCarrito } from '../../hooks/useCarrito';

const NAV_ITEMS = [
  { label: 'Información Personal', icon: 'person', to: RUTAS.CUENTA },
  { label: 'Mis Pedidos', icon: 'shopping_bag', to: RUTAS.MIS_PEDIDOS },
  { label: 'Mis Personalizaciones', icon: 'palette', to: RUTAS.PERSONALIZACIONES },
  { label: 'Mis Cotizaciones', icon: 'request_quote', to: RUTAS.COTIZACIONES },
];

export default function CuentaSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();
  const { vaciarCarrito } = useCarrito();

  function handleCerrarSesion() {
    vaciarCarrito();
    cerrarSesion();
    navigate(RUTAS.INICIO);
  }

  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[312px] lg:shrink-0">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const activo = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-1 rounded-lg px-3 py-3 text-label-lg font-medium transition-colors ${
                activo
                  ? 'bg-brand-500 text-white'
                  : 'text-ink-700 hover:bg-surface-muted'
              }`}
            >
              <MaterialIcon name={item.icon} style={{ fontSize: '20px' }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleCerrarSesion}
        className="flex items-center gap-1 rounded-lg px-3 py-3 text-left text-label-lg font-medium text-error transition-colors hover:bg-error-claro"
      >
        <MaterialIcon name="logout" style={{ fontSize: '20px' }} />
        Cerrar sesión
      </button>
    </aside>
  );
}

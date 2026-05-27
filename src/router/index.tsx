/**
 * Definición central de rutas del frontend.
 * Las rutas se construyen a partir de las constantes en `constants/rutas.ts`
 * para evitar strings duplicados.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { RUTAS } from '../constants/rutas';
import InicioPage from '../pages/InicioPage';
import CatalogoPage from '../pages/CatalogoPage';
import DetalleProductoPage from '../pages/DetalleProductoPage';
import CarritoPage from '../pages/CarritoPage';
import TiendasPage from '../pages/TiendasPage';
import DetalleTiendaPage from '../pages/DetalleTiendaPage';
import LoginPage from '../pages/LoginPage';
import PersonalizacionPage from '../pages/PersonalizacionPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsuariosPage from '../pages/admin/AdminUsuariosPage';
import AdminAprobacionesPage from '../pages/admin/AdminAprobacionesPage';
import AdminNotificacionesPage from '../pages/admin/AdminNotificacionesPage';
import ComingSoonPage from '../pages/ComingSoonPage';

/**
 * Definición de rutas. NO incluye BrowserRouter — ese se monta en `main.tsx`
 * para que componentes globales como `CartDrawer` (que viven en StoreProvider)
 * puedan usar <Link> y useNavigate.
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path={RUTAS.INICIO} element={<InicioPage />} />
      <Route path={RUTAS.CATALOGO} element={<CatalogoPage />} />
      <Route
        path={RUTAS.DETALLE_PRODUCTO()}
        element={<DetalleProductoPage />}
      />
      <Route path={RUTAS.TIENDAS} element={<TiendasPage />} />
      <Route
        path={RUTAS.DETALLE_TIENDA()}
        element={<DetalleTiendaPage />}
      />
      <Route
        path={RUTAS.VENDER}
        element={
          <ComingSoonPage
            active="Vender"
            title="Vender en Gamarra 360°"
            description="El portal de registro para comerciantes estará disponible pronto."
          />
        }
      />
      <Route
        path={RUTAS.CUENTA}
        element={
          <ComingSoonPage
            active="Inicio"
            title="Mi cuenta"
            description="Inicia sesión o crea tu cuenta. Muy pronto disponible."
          />
        }
      />
      <Route path={RUTAS.CARRITO} element={<CarritoPage />} />
      <Route
        path={RUTAS.CHECKOUT}
        element={
          <ComingSoonPage
            active="Inicio"
            title="Checkout"
            description="El flujo de pago seguro con Stripe estará disponible en el Sprint 3."
          />
        }
      />
      <Route path={RUTAS.LOGIN} element={<LoginPage />} />
      <Route
        path={RUTAS.PERSONALIZAR()}
        element={<PersonalizacionPage />}
      />
      <Route
        path={RUTAS.PERSONALIZACIONES}
        element={
          <ComingSoonPage
            active="Inicio"
            title="Mis Personalizaciones"
            description="Aquí podrás hacer seguimiento de tus solicitudes de personalización (HU-29). Disponible próximamente."
          />
        }
      />
      <Route path={RUTAS.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
      <Route path={RUTAS.ADMIN_USUARIOS} element={<AdminUsuariosPage />} />
      <Route path={RUTAS.ADMIN_APROBACIONES} element={<AdminAprobacionesPage />} />
      <Route path={RUTAS.ADMIN_NOTIFICACIONES} element={<AdminNotificacionesPage />} />
      <Route path="*" element={<Navigate to={RUTAS.INICIO} replace />} />
    </Routes>
  );
}

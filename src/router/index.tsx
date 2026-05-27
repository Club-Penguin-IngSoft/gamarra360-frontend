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
import RegistroPage from '../pages/RegistroPage';
import VenderPage from '../pages/VenderPage';
import RegistroComerciantePage from '../pages/RegistroComerciantePage';
import PersonalizacionPage from '../pages/PersonalizacionPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import DashboardPage from '../pages/comerciante/DashboardPage';
import GestionInventarioPage from '../pages/comerciante/GestionInventarioPage';
import EditarProductoPage from '../pages/comerciante/EditarProductoPage';
import NuevoProductoPage from '../pages/comerciante/NuevoProductoPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import ComingSoonInternalPage from '../pages/ComingSoonInternalPage';
import AdminSidebar from '../components/AdminSidebar';
import ComercianteSidebar from '../components/ComercianteSidebar';

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
      <Route path={RUTAS.VENDER} element={<VenderPage />} />
      <Route path={RUTAS.REGISTRO_COMERCIANTE} element={<RegistroComerciantePage />} />
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
      <Route path={RUTAS.REGISTRO} element={<RegistroPage />} />
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
      <Route
        path={RUTAS.COTIZACIONES}
        element={
          <ComingSoonPage
            active="Cotizaciones"
            title="Cotizaciones"
            description="Solicita y gestiona cotizaciones con comerciantes. Disponible en el Sprint 2."
          />
        }
      />
      <Route path={RUTAS.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
      <Route
        path={RUTAS.ADMIN_USUARIOS}
        element={
          <ComingSoonInternalPage
            sidebar={<AdminSidebar />}
            title="Gestión de Usuarios"
            description="Administración de usuarios del sistema. Disponible próximamente."
          />
        }
      />
      <Route
        path={RUTAS.ADMIN_APROBACION_COMERCIANTES}
        element={
          <ComingSoonInternalPage
            sidebar={<AdminSidebar />}
            title="Aprobación de Comerciantes"
            description="Revisión y aprobación de solicitudes de comerciantes. Disponible próximamente."
          />
        }
      />
      <Route
        path={RUTAS.ADMIN_NOTIFICACIONES}
        element={
          <ComingSoonInternalPage
            sidebar={<AdminSidebar />}
            title="Notificaciones"
            description="Centro de notificaciones del administrador. Disponible próximamente."
          />
        }
      />
      <Route path={RUTAS.COMERCIANTE_DASHBOARD} element={<DashboardPage />} />
      <Route path={RUTAS.COMERCIANTE_CATALOGO} element={<GestionInventarioPage />} />
      <Route
        path={RUTAS.COMERCIANTE_PEDIDOS}
        element={
          <ComingSoonInternalPage
            sidebar={<ComercianteSidebar />}
            title="Pedidos"
            description="Gestión y seguimiento de pedidos recibidos. Disponible en el Sprint 3."
          />
        }
      />
      <Route path={RUTAS.COMERCIANTE_EDITAR_PRODUCTO()} element={<EditarProductoPage />} />
      <Route path={RUTAS.COMERCIANTE_NUEVO_PRODUCTO} element={<NuevoProductoPage />} />
      <Route
        path={RUTAS.COMERCIANTE_PERSONALIZACIONES}
        element={
          <ComingSoonInternalPage
            sidebar={<ComercianteSidebar />}
            title="Personalizaciones"
            description="Gestión de solicitudes de personalización recibidas. Disponible próximamente."
          />
        }
      />
      <Route
        path={RUTAS.COMERCIANTE_COTIZACIONES}
        element={
          <ComingSoonInternalPage
            sidebar={<ComercianteSidebar />}
            title="Cotizaciones"
            description="Gestión de cotizaciones enviadas por clientes. Disponible próximamente."
          />
        }
      />
      <Route
        path={RUTAS.COMERCIANTE_NOTIFICACIONES}
        element={
          <ComingSoonInternalPage
            sidebar={<ComercianteSidebar />}
            title="Notificaciones"
            description="Centro de notificaciones del comerciante. Disponible próximamente."
          />
        }
      />
      <Route path="*" element={<Navigate to={RUTAS.INICIO} replace />} />
    </Routes>
  );
}

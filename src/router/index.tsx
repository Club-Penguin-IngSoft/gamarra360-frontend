/**
 * Definición central de rutas del frontend.
 * Las rutas se construyen a partir de las constantes en `constants/rutas.ts`
 * para evitar strings duplicados.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { RUTAS } from '../constants/rutas';
import RutaProtegida from './RutaProtegida';
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
import MisPersonalizacionesPage from '../pages/MisPersonalizacionesPage';
import PersonalizacionDetallePage from '../pages/PersonalizacionDetallePage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsuariosPage from '../pages/admin/AdminUsuariosPage';
import AdminAprobacionesPage from '../pages/admin/AdminAprobacionesPage';
import AdminNotificacionesPage from '../pages/admin/AdminNotificacionesPage';
import DashboardPage from '../pages/comerciante/DashboardPage';
import GestionInventarioPage from '../pages/comerciante/GestionInventarioPage';
import EditarProductoPage from '../pages/comerciante/EditarProductoPage';
import NuevoProductoPage from '../pages/comerciante/NuevoProductoPage';

import ComingSoonInternalPage from '../pages/ComingSoonInternalPage';
import ComercianteSidebar from '../components/ComercianteSidebar';
import CheckoutEntregaPage from '../pages/CheckoutEntregaPage';
import PagoPage from '../pages/PagoPage';
import MisPedidosPage from '../pages/MisPedidosPage';
import DetallePedidoPage from '../pages/DetallePedidoPage';
import PedidoDetallePage from '../pages/PedidoDetallePage';
import MiCuentaPage from '../pages/MiCuentaPage';
import StripeCompletado from '../pages/comerciante/StripeCompletado';
import StripeRefresh from '../pages/comerciante/StripeRefresh';
import SolicitarCotizacionPage from '../pages/SolicitarCotizacionPage';
import MisCotizacionesPage from '../pages/MisCotizacionesPage';
import DetalleCotizacionClientePage from '../pages/DetalleCotizacionClientePage';
import CotizacionesComerciantePage from '../pages/comerciante/CotizacionesComerciantePage';
import DetalleCotizacionComerciantePage from '../pages/comerciante/DetalleCotizacionComerciantePage';
import TableroDePedidosPage from '../pages/comerciante/TableroDePedidosPage';
import DetalleDePedidoComerciantePage from '../pages/comerciante/DetalleDePedidoComerciantePage';
import TableroDePersonalizacionesPage from '../pages/comerciante/TableroDePersonalizacionesPage';
import DetalleDePersonalizacionComerciantePage from '../pages/comerciante/DetalleDePersonalizacionComerciantePage';
import MiCuentaComerciantePage from '../pages/comerciante/MiCuentaPage';
import { useAuth } from '../hooks/useAuth';
/**
 * Definición de rutas. NO incluye BrowserRouter — ese se monta en `main.tsx`
 * para que componentes globales como `CartDrawer` (que viven en StoreProvider)
 * puedan usar <Link> y useNavigate.
 */
function SoloClientes({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  if (usuario?.rol === 'COMERCIANTE') {          // logueado como comerciante → su dashboard
    return <Navigate to={RUTAS.COMERCIANTE_DASHBOARD} replace />;
  }
  if (usuario?.rol === 'ADMIN') {                // logueado como admin → su dashboard
    return <Navigate to={RUTAS.ADMIN_DASHBOARD} replace />;
  }
  return <>{children}</>;                        // no logueado o CLIENTE → pasa normal
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path={RUTAS.INICIO} element={<SoloClientes><InicioPage /></SoloClientes>} />
      <Route path={RUTAS.CATALOGO} element={<SoloClientes><CatalogoPage /></SoloClientes>} />
      <Route path={RUTAS.DETALLE_PRODUCTO()} element={<SoloClientes><DetalleProductoPage /></SoloClientes>} />
      <Route path={RUTAS.TIENDAS} element={<SoloClientes><TiendasPage /></SoloClientes>} />
      <Route
        path={RUTAS.DETALLE_TIENDA()}
        element={<SoloClientes><DetalleTiendaPage /></SoloClientes>}
      />
      <Route path={RUTAS.VENDER} element={<VenderPage />} />
      <Route path={RUTAS.REGISTRO_COMERCIANTE} element={<RegistroComerciantePage />} />
      <Route path={RUTAS.CUENTA} element={<SoloClientes><MiCuentaPage /></SoloClientes>} />

      <Route path={RUTAS.CARRITO} element={<SoloClientes><CarritoPage /></SoloClientes>} />
      

      <Route path={RUTAS.CHECKOUT} element={<SoloClientes><CheckoutEntregaPage /></SoloClientes>} />
      

      <Route path={RUTAS.PAGO} element={<SoloClientes><PagoPage /></SoloClientes>} />
      <Route path={RUTAS.MIS_PEDIDOS} element={<SoloClientes><MisPedidosPage /></SoloClientes>} />
      <Route path={RUTAS.DETALLE_PEDIDO()} element={<SoloClientes><DetallePedidoPage /></SoloClientes>} />
      <Route path={RUTAS.PEDIDO_DETALLE()} element={<SoloClientes><PedidoDetallePage /></SoloClientes>} />

      <Route path={RUTAS.LOGIN} element={<LoginPage />} />
      <Route path={RUTAS.REGISTRO} element={<RegistroPage />} />
      <Route
        path={RUTAS.PERSONALIZAR()}
        element={<PersonalizacionPage />}
      />
      <Route path={RUTAS.PERSONALIZACIONES} element={<SoloClientes><MisPersonalizacionesPage /></SoloClientes>} />
      <Route path={RUTAS.PERSONALIZACION_DETALLE()} element={<SoloClientes><PersonalizacionDetallePage /></SoloClientes>} />
      <Route path={RUTAS.COTIZACIONES} element={<SoloClientes><SolicitarCotizacionPage /></SoloClientes>} />
      <Route path={RUTAS.MIS_COTIZACIONES} element={<SoloClientes><MisCotizacionesPage /></SoloClientes>} />
      <Route path={RUTAS.DETALLE_COTIZACION()} element={<SoloClientes><DetalleCotizacionClientePage /></SoloClientes>} />
      <Route element={<RutaProtegida rolesPermitidos={['ADMIN']} />}>
        <Route path={RUTAS.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
        <Route path={RUTAS.ADMIN_USUARIOS} element={<AdminUsuariosPage />} />
        <Route path={RUTAS.ADMIN_APROBACIONES} element={<AdminAprobacionesPage />} />
        <Route path={RUTAS.ADMIN_APROBACION_COMERCIANTES} element={<AdminAprobacionesPage />} />
        <Route path={RUTAS.ADMIN_NOTIFICACIONES} element={<AdminNotificacionesPage />} />
      </Route>
      <Route element={<RutaProtegida rolesPermitidos={['COMERCIANTE']} />}>
        <Route path={RUTAS.COMERCIANTE_DASHBOARD} element={<DashboardPage />} />
        <Route path={RUTAS.COMERCIANTE_CATALOGO} element={<GestionInventarioPage />} />
        <Route path={RUTAS.COMERCIANTE_PEDIDOS} element={<TableroDePedidosPage />} />
        <Route path={RUTAS.COMERCIANTE_PEDIDO_DETALLE()} element={<DetalleDePedidoComerciantePage />} />
        <Route path={RUTAS.COMERCIANTE_EDITAR_PRODUCTO()} element={<EditarProductoPage />} />
        <Route path={RUTAS.COMERCIANTE_NUEVO_PRODUCTO} element={<NuevoProductoPage />} />
        <Route path={RUTAS.COMERCIANTE_PERSONALIZACIONES} element={<TableroDePersonalizacionesPage />} />
        <Route path={RUTAS.COMERCIANTE_PERSONALIZACION_DETALLE()} element={<DetalleDePersonalizacionComerciantePage />} />
        <Route path={RUTAS.COMERCIANTE_COTIZACIONES} element={<CotizacionesComerciantePage />} />
        <Route path={RUTAS.COMERCIANTE_COTIZACION_DETALLE()} element={<DetalleCotizacionComerciantePage />} />
        <Route path={RUTAS.COMERCIANTE_CUENTA} element={<MiCuentaComerciantePage />} />
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
      </Route>
      {/* Stripe retorno — fuera de RutaProtegida */}
      <Route path="/comerciante/stripe/completado" element={<StripeCompletado />} />
      <Route path="/comerciante/stripe/refresh/:id" element={<StripeRefresh />} />
      <Route path="*" element={<Navigate to={RUTAS.INICIO} replace />} />
    </Routes>
  );
}
import { useEffect, useState, useCallback } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import PerfilHeaderCard from '../components/cuenta/PerfilHeaderCard';
import DireccionCard from '../components/cuenta/DireccionCard';
import PedidosRecientesCard from '../components/cuenta/PedidosRecientesCard';
import NotificacionesCard from '../components/cuenta/NotificacionesCard';
import EditarPerfilModal from '../components/cuenta/EditarPerfilModal';
import { useAuth } from '../hooks/useAuth';
import { pedidoService } from '../services/pedidoService';
import { obtenerPerfilCliente } from '../services/clienteService';
import type { IDetalleOrden } from '../types/IPedido';
import type { IPerfilCliente } from '../types/ICliente';

export default function MiCuentaPage() {
  const { usuario } = useAuth();

  /* Perfil del cliente — fuente de verdad para esta página */
  const [perfil, setPerfil]               = useState<IPerfilCliente | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);

  /* Pedido más reciente */
  const [orden, setOrden]                 = useState<IDetalleOrden | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);

  const recargarPerfil = useCallback(() => {
    setCargandoPerfil(true);
    obtenerPerfilCliente()
      .then(setPerfil)
      .catch(() => setPerfil(null))
      .finally(() => setCargandoPerfil(false));
  }, []);

  useEffect(() => {
    recargarPerfil();
  }, [recargarPerfil]);

  useEffect(() => {
    const clienteId = Number(usuario?.id ?? 0);
    if (!clienteId) { setCargandoPedidos(false); return; }
    let activo = true;
    pedidoService
      .obtenerMisOrdenes(clienteId)
      .then(ordenes => ordenes.length > 0 ? pedidoService.obtenerDetalleOrden(ordenes[0].id) : null)
      .then(detalle  => { if (activo) setOrden(detalle); })
      .catch(()      => { if (activo) setOrden(null); })
      .finally(()    => { if (activo) setCargandoPedidos(false); });
    return () => { activo = false; };
  }, [usuario?.id]);

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Inicio" />

      <main className="flex-1 px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-8">
          <h1 className="text-h3 font-bold text-ink-900">Mi Cuenta</h1>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <CuentaSidebar />

            <div className="flex flex-1 flex-col gap-8 lg:max-w-[1000px]">
              <h2 className="text-h5 font-semibold text-ink-900">Información Personal</h2>
              <PerfilHeaderCard
                perfil={perfil}
                cargando={cargandoPerfil}
                onEditarPerfil={() => setModalPerfilAbierto(true)}
              />
              <DireccionCard perfil={perfil} onGuardado={recargarPerfil} />
              <PedidosRecientesCard orden={orden} cargando={cargandoPedidos} />
              {/* key fuerza el remount cuando perfil carga para que useState tome los valores reales */}
              <NotificacionesCard
                key={perfil ? 'notif-loaded' : 'notif-loading'}
                alertasCorreo={perfil?.alertasCorreo ?? false}
                notificacionesPush={perfil?.notificacionesPush ?? false}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {modalPerfilAbierto && (
        <EditarPerfilModal
          perfil={perfil}
          onCerrar={() => setModalPerfilAbierto(false)}
          onGuardado={() => { setModalPerfilAbierto(false); recargarPerfil(); }}
        />
      )}
    </div>
  );
}

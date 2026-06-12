import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import PerfilHeaderCard from '../components/cuenta/PerfilHeaderCard';
import DireccionCard from '../components/cuenta/DireccionCard';
import PedidosRecientesCard from '../components/cuenta/PedidosRecientesCard';
import NotificacionesCard from '../components/cuenta/NotificacionesCard';
import { useAuth } from '../hooks/useAuth';
import { pedidoService } from '../services/pedidoService';
import type { IDetalleOrden } from '../types/IPedido';
import EditarPerfilModal from '../components/cuenta/EditarPerfilModal';
import { RUTAS } from '../constants/rutas';

export default function MiCuentaPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<IDetalleOrden | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);
  
  useEffect(() => {
    const clienteId = Number(usuario?.id ?? 0);
    if (!clienteId) {
      setCargando(false);
      return;
    }

    let activo = true;
    setCargando(true);

    pedidoService
      .obtenerMisOrdenes(clienteId)
      .then((ordenes) => (ordenes.length > 0 ? pedidoService.obtenerDetalleOrden(ordenes[0].id) : null))
      .then((detalle) => {
        if (activo) setOrden(detalle);
      })
      .catch(() => {
        if (activo) setOrden(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
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
              <PerfilHeaderCard usuario={usuario} onEditarPerfil={() => setModalPerfilAbierto(true)} />
              <DireccionCard direccion={usuario?.direccionEntrega ?? null} />
              <PedidosRecientesCard orden={orden} cargando={cargando} />
              <NotificacionesCard />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {modalPerfilAbierto && (
        <EditarPerfilModal usuario={usuario} onCerrar={() => setModalPerfilAbierto(false)} />
      )}
    </div>
  );
}

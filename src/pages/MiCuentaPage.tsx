import { useEffect, useState, useCallback } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import PerfilHeaderCard from '../components/cuenta/PerfilHeaderCard';
import DireccionCard from '../components/cuenta/DireccionCard';
import PedidosRecientesCard from '../components/cuenta/PedidosRecientesCard';
// import NotificacionesCard from '../components/cuenta/NotificacionesCard';
import EditarPerfilModal from '../components/cuenta/EditarPerfilModal';
import { useAuth } from '../hooks/useAuth';
import { pedidoService } from '../services/pedidoService';
import { obtenerPerfilCliente } from '../services/clienteService';
import type { IDetalleOrden } from '../types/IPedido';
import type { IPerfilCliente } from '../types/ICliente';
import apiClient from '../services/apiClient';

export default function MiCuentaPage() {
  const { usuario } = useAuth();

  /* Perfil del cliente — fuente de verdad para esta página */
  const [perfil, setPerfil]               = useState<IPerfilCliente | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);

  /* Pedido más reciente */
  const [orden, setOrden]                 = useState<IDetalleOrden | null>(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [mensajePassword, setMensajePassword] = useState<string | null>(null);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  async function cambiarPassword() {
    if (passwordNueva.length < 8) { setMensajePassword('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (passwordNueva !== passwordConfirmacion) { setMensajePassword('Las contraseñas nuevas no coinciden.'); return; }
    setGuardandoPassword(true);
    setMensajePassword(null);
    try {
      await apiClient.patch('/usuarios/me/password', { passwordActual, passwordNueva });
      setPasswordActual(''); setPasswordNueva(''); setPasswordConfirmacion('');
      setMensajePassword('Contraseña actualizada correctamente.');
    } catch (error: any) {
      setMensajePassword(error.response?.data?.mensaje ?? 'No se pudo actualizar la contraseña.');
    } finally { setGuardandoPassword(false); }
  }

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
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-ink-900">Cambiar contraseña</h3>
                <p className="mt-1 text-sm text-ink-500">Usa una contraseña única de al menos 8 caracteres.</p>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input type="password" autoComplete="current-password" value={passwordActual} onChange={e=>setPasswordActual(e.target.value)} placeholder="Contraseña actual" className="rounded-xl border border-ink-200 px-4 py-3" />
                  <input type="password" autoComplete="new-password" value={passwordNueva} onChange={e=>setPasswordNueva(e.target.value)} placeholder="Nueva contraseña" className="rounded-xl border border-ink-200 px-4 py-3" />
                  <input type="password" autoComplete="new-password" value={passwordConfirmacion} onChange={e=>setPasswordConfirmacion(e.target.value)} placeholder="Confirmar contraseña" className="rounded-xl border border-ink-200 px-4 py-3" />
                </div>
                {mensajePassword && <p className={`mt-3 text-sm ${mensajePassword.includes('correctamente') ? 'text-exito' : 'text-error'}`}>{mensajePassword}</p>}
                <button type="button" onClick={cambiarPassword} disabled={guardandoPassword || !passwordActual || !passwordNueva || !passwordConfirmacion} className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {guardandoPassword ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
              </section>
              <PedidosRecientesCard orden={orden} cargando={cargandoPedidos} />
              {/* Preferencias de notificación ocultas temporalmente.
              <NotificacionesCard
                key={perfil ? 'notif-loaded' : 'notif-loading'}
                alertasCorreo={perfil?.alertasCorreo ?? false}
                notificacionesPush={perfil?.notificacionesPush ?? false}
              />
              */}
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

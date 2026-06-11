import { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import PerfilHeaderCard from '../components/cuenta/PerfilHeaderCard';
import DireccionCard from '../components/cuenta/DireccionCard';
import NotificacionesCard from '../components/cuenta/NotificacionesCard';
import ContrasenaCard from '../components/cuenta/ContrasenaCard';
import EditarPerfilModal from '../components/cuenta/EditarPerfilModal';
import CambiarContrasenaModal from '../components/cuenta/CambiarContrasenaModal';
import EditarDireccionModal from '../components/cuenta/EditarDireccionModal';
import { useAuth } from '../hooks/useAuth';
import { pedidoService } from '../services/pedidoService';
import clientePerfilService from '../services/clientePerfilService';
import type { IClientePerfilResponse } from '../services/clientePerfilService';
import type { IDetalleOrden } from '../types/IPedido';
import type { IUsuario, RolUsuario } from '../types/IUsuario';

type ModalActivo = 'perfil' | 'direccion' | 'contrasena' | null;

function mapPerfilAUsuario(perfil: IClientePerfilResponse): IUsuario {
  const rolNormalizado = perfil.rol === 'VENDEDOR' ? 'COMERCIANTE' : perfil.rol;

  return {
    id: String(perfil.usuarioId),
    nombre: perfil.nombres ?? '',
    apellido: perfil.primerApellido ?? '',
    nombres: perfil.nombres ?? '',
    primerApellido: perfil.primerApellido ?? '',
    segundoApellido: perfil.segundoApellido ?? '',
    nombreCompleto: perfil.nombreCompleto ?? '',
    correo: perfil.email,
    telefono: perfil.telefono ?? '',
    direccionEntrega: perfil.direccionEntrega ?? null,
    rol: rolNormalizado as RolUsuario,
  };
}

export default function MiCuentaPage() {
  const { usuario, actualizarUsuario } = useAuth();
  const [perfilUsuario, setPerfilUsuario] = useState<IUsuario | null>(usuario);
  const [orden, setOrden] = useState<IDetalleOrden | null>(null);
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [mensajePerfil, setMensajePerfil] = useState<string | null>(null);

  useEffect(() => {
    setPerfilUsuario(usuario);
  }, [usuario]);

  useEffect(() => {
    if (!usuario?.id) return;

    let activo = true;

    clientePerfilService
      .obtenerPerfil()
      .then((perfilBackend) => {
        if (!activo) return;

        const usuarioMapeado = mapPerfilAUsuario(perfilBackend);
        setPerfilUsuario(usuarioMapeado);
        actualizarUsuario(usuarioMapeado);
      })
      .catch(() => {
        if (activo) {
          setPerfilUsuario(usuario);
        }
      });

    return () => {
      activo = false;
    };
  }, [usuario?.id, actualizarUsuario]);

  useEffect(() => {
    const clienteId = Number(usuario?.id ?? 0);
    if (!clienteId) {
      setOrden(null);
      return;
    }

    let activo = true;

    pedidoService
      .obtenerMisOrdenes(clienteId)
      .then((ordenes) => (ordenes.length > 0 ? pedidoService.obtenerDetalleOrden(ordenes[0].id) : null))
      .then((detalle) => {
        if (activo) setOrden(detalle);
      })
      .catch(() => {
        if (activo) setOrden(null);
      });

    return () => {
      activo = false;
    };
  }, [usuario?.id]);

  const direccionReciente = useMemo(
    () =>
      orden?.pedidos.find((pedido) => pedido.tipoEntrega === 'DELIVERY' && pedido.direccionEntrega)
        ?.direccionEntrega ?? null,
    [orden],
  );

  const direccionMostrada = perfilUsuario?.direccionEntrega || direccionReciente;

  const guardarPerfil = async (datos: {
    nombres: string;
    primerApellido: string;
    segundoApellido: string;
    telefono: string;
  }) => {
    const perfilActualizado = await clientePerfilService.actualizarPerfil({
      nombres: datos.nombres,
      primerApellido: datos.primerApellido,
      segundoApellido: datos.segundoApellido,
      telefono: datos.telefono,
    });

    const usuarioActualizado = mapPerfilAUsuario(perfilActualizado);
    setPerfilUsuario(usuarioActualizado);
    actualizarUsuario(usuarioActualizado);
    setModalActivo(null);
    setMensajePerfil('Perfil actualizado correctamente.');
  };

  const guardarDireccion = async (direccionEntrega: string) => {
    const perfilActualizado = await clientePerfilService.actualizarDireccion({ direccionEntrega });
    const usuarioActualizado = mapPerfilAUsuario(perfilActualizado);
    setPerfilUsuario(usuarioActualizado);
    actualizarUsuario(usuarioActualizado);
    setModalActivo(null);
    setMensajePerfil('Dirección de entrega actualizada correctamente.');
  };

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
              {mensajePerfil && (
                <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-body-md text-success">
                  {mensajePerfil}
                </div>
              )}
              <PerfilHeaderCard usuario={perfilUsuario} onEditarPerfil={() => setModalActivo('perfil')} />
              <DireccionCard direccion={direccionMostrada} onEditarDireccion={() => setModalActivo('direccion')} />
              <ContrasenaCard onCambiarContrasena={() => setModalActivo('contrasena')} />
              <NotificacionesCard />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {modalActivo === 'perfil' && (
        <EditarPerfilModal usuario={perfilUsuario} onCerrar={() => setModalActivo(null)} onGuardar={guardarPerfil} />
      )}
      {modalActivo === 'direccion' && (
        <EditarDireccionModal
          direccionActual={direccionMostrada}
          onCerrar={() => setModalActivo(null)}
          onGuardar={guardarDireccion}
        />
      )}
      {modalActivo === 'contrasena' && <CambiarContrasenaModal onCerrar={() => setModalActivo(null)} />}
    </div>
  );
}


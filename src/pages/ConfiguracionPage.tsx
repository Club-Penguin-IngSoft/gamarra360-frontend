import { useState } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import PerfilHeaderCard from '../components/cuenta/PerfilHeaderCard';
import DireccionCard from '../components/cuenta/DireccionCard';
import ContrasenaCard from '../components/cuenta/ContrasenaCard';
import EliminarCuentaCard from '../components/cuenta/EliminarCuentaCard';
import EditarPerfilModal from '../components/cuenta/EditarPerfilModal';
import CambiarContrasenaModal from '../components/cuenta/CambiarContrasenaModal';
import EliminarCuentaModal from '../components/cuenta/EliminarCuentaModal';
import { useAuth } from '../hooks/useAuth';

type ModalActivo = 'perfil' | 'contrasena' | 'eliminar' | null;

export default function ConfiguracionPage() {
  const { usuario } = useAuth();
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active="Inicio" />

      <main className="flex-1 px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-8">
          <h1 className="text-h3 font-bold text-ink-900">Configuración</h1>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <CuentaSidebar />

            <div className="flex flex-1 flex-col gap-8 lg:max-w-[1000px]">
              <h2 className="text-h5 font-semibold text-ink-900">Información Personal</h2>
              <PerfilHeaderCard usuario={usuario} onEditarPerfil={() => setModalActivo('perfil')} />
              <DireccionCard direccion={null} />
              <ContrasenaCard onCambiarContrasena={() => setModalActivo('contrasena')} />
              <EliminarCuentaCard onEliminarCuenta={() => setModalActivo('eliminar')} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {modalActivo === 'perfil' && (
        <EditarPerfilModal usuario={usuario} onCerrar={() => setModalActivo(null)} />
      )}
      {modalActivo === 'contrasena' && <CambiarContrasenaModal onCerrar={() => setModalActivo(null)} />}
      {modalActivo === 'eliminar' && <EliminarCuentaModal onCerrar={() => setModalActivo(null)} />}
    </div>
  );
}

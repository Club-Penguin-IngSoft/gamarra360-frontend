import { useState } from 'react';
import ModalBase from './ModalBase';
import { Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  direccionActual: string | null;
  onCerrar: () => void;
}

const inputClase =
  'w-full rounded-input border border-neutro-200 bg-white px-4 py-3 text-body-md text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export default function EditarDireccionModal({ direccionActual, onCerrar }: Props) {
  const { usuario, actualizarUsuario } = useAuth();
  const [direccion, setDireccion] = useState(direccionActual ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!direccion.trim()) {
      setError('Ingresa una dirección.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await apiClient.patch(`/usuarios/${usuario?.id}/perfil`, {
        direccionEntrega: direccion.trim(),
      });
      actualizarUsuario({ direccionEntrega: direccion.trim() });
      onCerrar();
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase
      titulo={direccionActual ? 'Cambiar dirección' : 'Agregar dirección'}
      onCerrar={onCerrar}
      footer={
        <>
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="h-11 flex-1 rounded-lg border border-neutro-200 text-label-lg font-medium text-ink-700 transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 text-label-lg font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {guardando ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar'}
          </button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-label-md font-medium text-ink-700">Dirección</span>
        <input
          className={inputClase}
          placeholder="Ej. Av. Arequipa 3421, Miraflores"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </label>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </ModalBase>
  );
}
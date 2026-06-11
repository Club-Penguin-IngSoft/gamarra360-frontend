import { useState } from 'react';
import ModalBase from './ModalBase';

interface EditarDireccionModalProps {
  direccionActual?: string | null;
  onCerrar: () => void;
  onGuardar: (direccionEntrega: string) => Promise<void>;
}

const inputClase =
  'w-full rounded-input border border-neutro-200 bg-white px-4 py-3 text-body-md text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

const etiquetaClase = 'text-label-md font-medium text-ink-700';

export default function EditarDireccionModal({ direccionActual, onCerrar, onGuardar }: EditarDireccionModalProps) {
  const [direccionEntrega, setDireccionEntrega] = useState(direccionActual ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardarCambios = async () => {
    const direccionLimpia = direccionEntrega.trim();

    if (!direccionLimpia) {
      setError('La dirección de entrega es obligatoria.');
      return;
    }

    if (direccionLimpia.length < 8) {
      setError('Ingresa una dirección más completa.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await onGuardar(direccionLimpia);
    } catch (err) {
      const mensaje =
        (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
        'No se pudo guardar la dirección. Inténtalo nuevamente.';
      setError(mensaje);
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
            className="h-11 flex-1 rounded-lg border border-neutro-200 text-label-lg font-medium text-ink-700 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardarCambios}
            disabled={guardando}
            className="h-11 flex-1 rounded-lg bg-brand-500 text-label-lg font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </>
      }
    >
      {error && <div className="rounded-lg bg-danger/10 px-3 py-2 text-body-sm text-danger">{error}</div>}

      <label className="flex flex-col gap-1.5">
        <span className={etiquetaClase}>Dirección de entrega</span>
        <textarea
          className={`${inputClase} min-h-[96px] resize-none`}
          value={direccionEntrega}
          maxLength={500}
          placeholder="Ej. Av. Universitaria 1801, San Miguel"
          onChange={(e) => setDireccionEntrega(e.target.value)}
        />
      </label>
    </ModalBase>
  );
}

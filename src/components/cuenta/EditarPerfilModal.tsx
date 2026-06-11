import { useState } from 'react';
import type { IUsuario } from '../../types/IUsuario';
import ModalBase from './ModalBase';

interface EditarPerfilModalProps {
  usuario: IUsuario | null;
  onCerrar: () => void;
  onGuardar: (datos: {
    nombres: string;
    primerApellido: string;
    segundoApellido: string;
    telefono: string;
  }) => Promise<void>;
}

const inputClase =
  'w-full rounded-input border border-neutro-200 bg-white px-4 py-3 text-body-md text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

const etiquetaClase = 'text-label-md font-medium text-ink-700';

function normalizarCelular(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 9);
}

export default function EditarPerfilModal({ usuario, onCerrar, onGuardar }: EditarPerfilModalProps) {
  const [nombres, setNombres] = useState(usuario?.nombres ?? usuario?.nombre ?? '');
  const [primerApellido, setPrimerApellido] = useState(usuario?.primerApellido ?? usuario?.apellido ?? '');
  const [segundoApellido, setSegundoApellido] = useState(usuario?.segundoApellido ?? '');
  const [celular, setCelular] = useState(usuario?.telefono ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardarCambios = async () => {
    const nombresLimpios = nombres.trim();
    const primerApellidoLimpio = primerApellido.trim();
    const segundoApellidoLimpio = segundoApellido.trim();
    const celularLimpio = normalizarCelular(celular);

    if (!nombresLimpios || !primerApellidoLimpio) {
      setError('El nombre y el primer apellido son obligatorios.');
      return;
    }

    if (celularLimpio && celularLimpio.length !== 9) {
      setError('El celular debe tener 9 dígitos.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await onGuardar({
        nombres: nombresLimpios,
        primerApellido: primerApellidoLimpio,
        segundoApellido: segundoApellidoLimpio,
        telefono: celularLimpio,
      });
    } catch (err) {
      const mensaje =
        (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
        'No se pudo guardar el perfil. Inténtalo nuevamente.';
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase
      titulo="Editar perfil"
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
        <span className={etiquetaClase}>Nombre(s)</span>
        <input className={inputClase} value={nombres} onChange={(e) => setNombres(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={etiquetaClase}>Primer apellido</span>
        <input className={inputClase} value={primerApellido} onChange={(e) => setPrimerApellido(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={etiquetaClase}>Segundo apellido</span>
        <input className={inputClase} value={segundoApellido} onChange={(e) => setSegundoApellido(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={etiquetaClase}>Celular</span>
        <div className="flex gap-2">
          <span className="flex items-center justify-center rounded-input border border-neutro-200 bg-surface-muted px-4 text-body-md text-ink-700">
            +51
          </span>
          <input
            type="tel"
            className={`${inputClase} flex-1`}
            value={celular}
            maxLength={9}
            onChange={(e) => setCelular(normalizarCelular(e.target.value))}
          />
        </div>
      </label>
    </ModalBase>
  );
}

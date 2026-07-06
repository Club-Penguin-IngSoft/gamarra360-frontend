import { useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import ModalBase from './ModalBase';
import { actualizarDatosPersonales } from '../../services/clienteService';
import { limpiarCelular } from '../../utils/validaciones';
import type { IPerfilCliente } from '../../types/ICliente';

interface Props {
  perfil: IPerfilCliente | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

const INPUT = 'w-full rounded-input border border-neutro-200 bg-white px-4 py-3 text-body-md text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const LABEL = 'text-label-md font-medium text-ink-700';

export default function EditarPerfilModal({ perfil, onCerrar, onGuardado }: Props) {
  const [nombres, setNombres]                 = useState(perfil?.nombres ?? '');
  const [primerApellido, setPrimerApellido]   = useState(perfil?.primerApellido ?? '');
  const [segundoApellido, setSegundoApellido] = useState(perfil?.segundoApellido ?? '');
  // El teléfono se guarda con el prefijo +51 incluido (ver limpiarCelular / registro);
  // aquí se edita solo el número local para no duplicar el prefijo en el input.
  const [celular, setCelular]                 = useState((perfil?.telefono ?? '').replace(/^\+51\s?/, ''));
  const [guardando, setGuardando]             = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !primerApellido.trim()) {
      setError('El nombre y el primer apellido son obligatorios.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await actualizarDatosPersonales({
        nombres: nombres.trim(),
        primerApellido: primerApellido.trim(),
        segundoApellido: segundoApellido.trim() || undefined,
        telefono: limpiarCelular(celular.trim()),
      });
      onGuardado();
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase titulo="Editar perfil" onCerrar={onCerrar}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Nombre(s)</span>
          <input className={INPUT} value={nombres} onChange={e => setNombres(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Primer apellido</span>
          <input className={INPUT} value={primerApellido} onChange={e => setPrimerApellido(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>
            Segundo apellido{' '}
            <span className="font-normal text-ink-400">(opcional)</span>
          </span>
          <input
            className={INPUT}
            placeholder="Opcional"
            value={segundoApellido}
            onChange={e => setSegundoApellido(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Celular</span>
          <input
            type="tel"
            className={INPUT}
            placeholder="999 999 999"
            value={celular}
            onChange={e => setCelular(e.target.value)}
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="h-11 flex-1 rounded-lg border border-neutro-200 text-label-lg font-medium text-ink-700 transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 text-label-lg font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {guardando ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}

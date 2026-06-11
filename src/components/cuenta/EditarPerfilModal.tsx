import { useState } from 'react';
import type { IUsuario } from '../../types/IUsuario';
import ModalBase from './ModalBase';

interface EditarPerfilModalProps {
  usuario: IUsuario | null;
  onCerrar: () => void;
}

const inputClase =
  'w-full rounded-input border border-neutro-200 bg-white px-4 py-3 text-body-md text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

const etiquetaClase = 'text-label-md font-medium text-ink-700';

export default function EditarPerfilModal({ usuario, onCerrar }: EditarPerfilModalProps) {
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [primerApellido, setPrimerApellido] = useState(usuario?.apellido ?? '');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [celular, setCelular] = useState(usuario?.telefono ?? '');

  return (
    <ModalBase
      titulo="Editar perfil"
      onCerrar={onCerrar}
      footer={
        <>
          <button
            type="button"
            onClick={onCerrar}
            className="h-11 flex-1 rounded-lg border border-neutro-200 text-label-lg font-medium text-ink-700 transition-colors hover:bg-surface-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="h-11 flex-1 rounded-lg bg-brand-500 text-label-lg font-medium text-white transition-colors hover:bg-brand-600"
          >
            Guardar
          </button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className={etiquetaClase}>Nombre(s)</span>
        <input className={inputClase} value={nombre} onChange={(e) => setNombre(e.target.value)} />
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
            onChange={(e) => setCelular(e.target.value)}
          />
        </div>
      </label>
    </ModalBase>
  );
}

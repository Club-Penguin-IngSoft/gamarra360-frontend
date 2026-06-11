import { useState } from 'react';
import MaterialIcon from '../MaterialIcon';
import ModalBase from './ModalBase';

interface CambiarContrasenaModalProps {
  onCerrar: () => void;
}

const inputClase =
  'w-full rounded-input border border-neutro-200 bg-white px-4 py-3 pr-11 text-body-md text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

const etiquetaClase = 'text-label-md font-medium text-ink-700';

interface CampoContrasenaProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  ayuda?: string;
}

function CampoContrasena({ etiqueta, valor, onChange, ayuda }: CampoContrasenaProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      <span className={etiquetaClase}>{etiqueta}</span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          className={inputClase}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600"
        >
          <MaterialIcon name={visible ? 'visibility_off' : 'visibility'} style={{ fontSize: '20px' }} />
        </button>
      </div>
      {ayuda && <span className="text-body-xs text-ink-500">{ayuda}</span>}
    </label>
  );
}

export default function CambiarContrasenaModal({ onCerrar }: CambiarContrasenaModalProps) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');

  return (
    <ModalBase
      titulo="Cambiar contraseña"
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
      <CampoContrasena etiqueta="Contraseña actual" valor={actual} onChange={setActual} />
      <CampoContrasena
        etiqueta="Nueva contraseña"
        valor={nueva}
        onChange={setNueva}
        ayuda="Mínimo 8 caracteres, incluyendo 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial."
      />
      <CampoContrasena etiqueta="Confirmar nueva contraseña" valor={confirmar} onChange={setConfirmar} />
    </ModalBase>
  );
}

import ModalBase from './ModalBase';

interface EliminarCuentaModalProps {
  onCerrar: () => void;
}

export default function EliminarCuentaModal({ onCerrar }: EliminarCuentaModalProps) {
  return (
    <ModalBase
      titulo="¿Eliminar tu cuenta?"
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
            className="h-11 flex-1 rounded-lg bg-error text-label-lg font-medium text-white transition-colors hover:bg-error/90"
          >
            Eliminar
          </button>
        </>
      }
    >
      <p className="text-body-xl text-ink-700">¿Estás seguro de que deseas eliminar tu cuenta?</p>
    </ModalBase>
  );
}

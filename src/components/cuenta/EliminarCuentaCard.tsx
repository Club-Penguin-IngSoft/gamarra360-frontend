import MaterialIcon from '../MaterialIcon';

interface EliminarCuentaCardProps {
  onEliminarCuenta: () => void;
}

export default function EliminarCuentaCard({ onEliminarCuenta }: EliminarCuentaCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-error/20 bg-error-claro p-6">
      <h3 className="flex items-center gap-2 text-title1 font-bold text-error-texto">
        <MaterialIcon name="error" style={{ fontSize: '20px' }} />
        Eliminar cuenta
      </h3>
      <p className="text-body-xl text-error-texto">
        Esta acción borrará tu información personal e historial.
      </p>
      <button
        type="button"
        onClick={onEliminarCuenta}
        className="w-fit rounded-lg bg-error px-6 py-3 text-label-lg font-medium text-white transition-colors hover:bg-error/90"
      >
        Eliminar cuenta
      </button>
    </div>
  );
}

import MaterialIcon from '../MaterialIcon';

interface ContrasenaCardProps {
  onCambiarContrasena: () => void;
}

export default function ContrasenaCard({ onCambiarContrasena }: ContrasenaCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-title1 font-bold text-ink-700">
        <MaterialIcon name="lock" style={{ fontSize: '20px' }} />
        Contraseña
      </h3>
      <button
        type="button"
        onClick={onCambiarContrasena}
        className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-4 text-left text-body-xl text-ink-900 transition-colors hover:bg-surface-soft"
      >
        Cambiar contraseña
        <MaterialIcon name="chevron_right" className="text-ink-400" style={{ fontSize: '20px' }} />
      </button>
    </div>
  );
}

interface DireccionCardProps {
  direccion: string | null;
  onEditarDireccion: () => void;
}

export default function DireccionCard({ direccion, onEditarDireccion }: DireccionCardProps) {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-title1 font-bold text-ink-700">Dirección de entrega</h3>
        <button
          type="button"
          onClick={onEditarDireccion}
          className="text-label-md font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          {direccion ? 'Cambiar' : 'Agregar'}
        </button>
      </div>
      <div className="rounded-xl bg-surface-muted p-4 text-body-xl text-ink-900">
        {direccion ?? (
          <span className="text-ink-500">
            Aún no tienes una dirección registrada. Se guardará la próxima vez que elijas envío a domicilio.
          </span>
        )}
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

type Variante = 'peligro' | 'advertencia';

interface Props {
  open: boolean;
  titulo: string;
  mensaje: ReactNode;
  confirmarLabel?: string;
  cancelarLabel?: string;
  variante?: Variante;
  confirmando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ESTILOS_VARIANTE: Record<Variante, { icono: ReactNode; iconBg: string; boton: string }> = {
  peligro: {
    icono: <AlertTriangle className="h-5 w-5 text-red-600" />,
    iconBg: 'bg-red-100',
    boton: 'bg-red-600 hover:bg-red-700',
  },
  advertencia: {
    icono: <HelpCircle className="h-5 w-5 text-amber-600" />,
    iconBg: 'bg-amber-100',
    boton: 'bg-primario hover:bg-primario-hover',
  },
};

/** Diálogo de confirmación genérico del panel comerciante — reemplaza a window.confirm para poder mostrar contexto enriquecido. */
export default function ConfirmDialog({
  open,
  titulo,
  mensaje,
  confirmarLabel = 'Confirmar',
  cancelarLabel = 'Cancelar',
  variante = 'peligro',
  confirmando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  if (!open) return null;
  const estilo = ESTILOS_VARIANTE[variante];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${estilo.iconBg}`}>
            {estilo.icono}
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">{titulo}</h2>
            <div className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{mensaje}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="h-[38px] px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelarLabel}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className={`h-[38px] px-4 rounded-lg text-[13px] font-semibold text-white transition-colors disabled:opacity-50 ${estilo.boton}`}
          >
            {confirmando ? 'Procesando...' : confirmarLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

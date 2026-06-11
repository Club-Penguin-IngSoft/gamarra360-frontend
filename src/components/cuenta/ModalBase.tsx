import type { ReactNode } from 'react';
import MaterialIcon from '../MaterialIcon';

interface ModalBaseProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function ModalBase({ titulo, onCerrar, children, footer, maxWidth = 'max-w-md' }: ModalBaseProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onCerrar} />
      <div className={`relative w-full ${maxWidth} rounded-modal bg-white p-6 shadow-modal`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-h6 font-semibold text-ink-900">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-surface-muted"
          >
            <MaterialIcon name="close" style={{ fontSize: '20px' }} />
          </button>
        </div>

        <div className="flex flex-col gap-4">{children}</div>

        {footer && <div className="mt-6 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}

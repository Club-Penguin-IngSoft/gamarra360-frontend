import { useState } from 'react';
import { MapPin } from 'lucide-react';
import EditarDireccionModal from './EditarDireccionModal';
import type { IPerfilCliente } from '../../types/ICliente';

interface Props {
  perfil: IPerfilCliente | null;
  onGuardado: () => void;
}

export default function DireccionCard({ perfil, onGuardado }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const tieneDireccion = Boolean(perfil?.direccionEntrega);

  return (
    <>
      <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-title1 font-bold text-ink-700">Dirección de entrega</h3>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="text-label-md font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            {tieneDireccion ? 'Cambiar' : 'Agregar'}
          </button>
        </div>

        <div className="rounded-xl bg-surface-muted p-4">
          {tieneDireccion ? (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <div className="flex flex-col gap-0.5">
                <p className="text-body-xl text-ink-900">
                  {perfil!.direccionEntrega}
                  {perfil!.nombreDistrito && `, ${perfil!.nombreDistrito}`}
                  {perfil!.ciudadDistrito && ` - ${perfil!.ciudadDistrito}`}
                </p>
                {perfil!.referencia && (
                  <p className="text-body-md text-ink-500">Ref: {perfil!.referencia}</p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-body-xl text-ink-500">
              Aún no tienes una dirección registrada. Se guardará la próxima vez que elijas envío a domicilio.
            </span>
          )}
        </div>
      </div>

      {modalAbierto && (
        <EditarDireccionModal
          perfil={perfil}
          onCerrar={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); onGuardado(); }}
        />
      )}
    </>
  );
}

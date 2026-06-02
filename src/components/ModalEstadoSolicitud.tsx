import MaterialIcon from './MaterialIcon';
import { COLORES } from '../styles/tokens';

type Props = {
  tipo: 'pendiente' | 'rechazado';
  onClose: () => void;
};

export default function ModalEstadoSolicitud({ tipo, onClose }: Props) {
  const esPendiente = tipo === 'pendiente';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: esPendiente ? '#fefce8' : '#fef2f2' }}
        >
          <MaterialIcon
            name={esPendiente ? 'hourglass_top' : 'cancel'}
            style={{
              fontSize: '40px',
              color: esPendiente ? '#b45309' : '#b91c1c',
            }}
          />
        </div>

        <div>
          <p className="text-xl font-extrabold text-gray-900 mb-2">
            {esPendiente ? 'Solicitud en revisión' : 'Solicitud rechazada'}
          </p>
          <p className="text-sm leading-relaxed text-gray-500">
            {esPendiente
              ? 'Tu solicitud está siendo evaluada por nuestro equipo. Te notificaremos por correo cuando sea aprobada.'
              : 'Tu solicitud de registro como comerciante no fue aprobada. Si crees que es un error, contáctanos.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-sm font-semibold hover:underline mt-1"
          style={{ color: COLORES.primario }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
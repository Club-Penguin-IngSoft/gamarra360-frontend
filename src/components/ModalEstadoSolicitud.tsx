import MaterialIcon from './MaterialIcon';
import { COLORES } from '../styles/tokens';

type Props = {
  tipo: 'pendiente' | 'rechazado' | 'desactivado';
  onClose: () => void;
};

const CONFIG = {
  pendiente: {
    icono: 'hourglass_top',
    colorIcono: '#b45309',
    fondoIcono: '#fefce8',
    titulo: 'Solicitud en revisión',
    mensaje: 'Tu solicitud está siendo evaluada por nuestro equipo. Te notificaremos por correo cuando sea aprobada.',
  },
  rechazado: {
    icono: 'cancel',
    colorIcono: '#b91c1c',
    fondoIcono: '#fef2f2',
    titulo: 'Solicitud rechazada',
    mensaje: 'Tu solicitud de registro como comerciante no fue aprobada. Si crees que es un error, contáctanos.',
  },
  desactivado: {
    icono: 'block',
    colorIcono: '#b91c1c',
    fondoIcono: '#fef2f2',
    titulo: 'Cuenta desactivada',
    mensaje: 'Tu cuenta ha sido desactivada por un administrador. Si crees que es un error, contáctanos para más información.',
  },
};

export default function ModalEstadoSolicitud({ tipo, onClose }: Props) {
  const config = CONFIG[tipo];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: config.fondoIcono }}
        >
          <MaterialIcon
            name={config.icono}
            style={{ fontSize: '40px', color: config.colorIcono }}
          />
        </div>

        <div>
          <p className="text-xl font-extrabold text-gray-900 mb-2">{config.titulo}</p>
          <p className="text-sm leading-relaxed text-gray-500">{config.mensaje}</p>
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
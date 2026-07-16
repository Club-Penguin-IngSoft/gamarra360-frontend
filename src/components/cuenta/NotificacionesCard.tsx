import { useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import { actualizarNotificaciones } from '../../services/clienteService';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        checked ? 'bg-brand-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

interface PreferenciaRowProps {
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PreferenciaRow({ icon, titulo, descripcion, checked, onChange, disabled }: PreferenciaRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-muted p-4">
      <div className="flex items-center gap-4">
        {icon}
        <div className="flex flex-col gap-2">
          <p className="text-title4 font-semibold text-ink-900">{titulo}</p>
          <p className="text-body-sm text-ink-700">{descripcion}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} label={titulo} disabled={disabled} />
    </div>
  );
}

interface Props {
  alertasCorreo: boolean;
  notificacionesPush: boolean;
}

export default function NotificacionesCard({ alertasCorreo: inicialCorreo, notificacionesPush: inicialPush }: Props) {
  const [alertasCorreo, setAlertasCorreo]           = useState(inicialCorreo);
  const [notificacionesPush, setNotificacionesPush] = useState(inicialPush);
  const [guardando, setGuardando]                   = useState(false);
  const [errorGuardado, setErrorGuardado]           = useState<string | null>(null);

  const guardar = async (correo: boolean, push: boolean) => {
    setGuardando(true);
    setErrorGuardado(null);
    try {
      await actualizarNotificaciones({ alertasCorreo: correo, notificacionesPush: push });
    } catch {
      /* Revertir al estado anterior */
      setAlertasCorreo(alertasCorreo);
      setNotificacionesPush(notificacionesPush);
      setErrorGuardado('No se pudo guardar. Verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCorreo = (nuevo: boolean) => {
    setAlertasCorreo(nuevo);
    guardar(nuevo, notificacionesPush);
  };

  const handlePush = (nuevo: boolean) => {
    setNotificacionesPush(nuevo);
    guardar(alertasCorreo, nuevo);
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-title1 font-bold text-ink-700">Preferencias de Notificación</h3>

      <div className="flex flex-col gap-4">
        <PreferenciaRow
          icon={<Mail className={`h-6 w-6 shrink-0 ${alertasCorreo ? 'text-brand-600' : 'text-ink-400'}`} />}
          titulo="Alertas por Correo"
          descripcion="Ofertas, cotizaciones, personalizaciones y estados de pedido."
          checked={alertasCorreo}
          onChange={handleCorreo}
          disabled={guardando}
        />
        <PreferenciaRow
          icon={<Bell className={`h-6 w-6 shrink-0 ${notificacionesPush ? 'text-brand-600' : 'text-ink-400'}`} />}
          titulo="Notificaciones Push"
          descripcion="Alertas inmediatas en tu navegador."
          checked={notificacionesPush}
          onChange={handlePush}
          disabled={guardando}
        />
      </div>

      {errorGuardado && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {errorGuardado}
        </p>
      )}
    </div>
  );
}

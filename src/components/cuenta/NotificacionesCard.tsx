import { useState } from 'react';
import { Bell, Mail } from 'lucide-react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
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
}

function PreferenciaRow({ icon, titulo, descripcion, checked, onChange }: PreferenciaRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-muted p-4">
      <div className="flex items-center gap-4">
        {icon}
        <div className="flex flex-col gap-2">
          <p className="text-title4 font-semibold text-ink-900">{titulo}</p>
          <p className="text-body-sm text-ink-700">{descripcion}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} label={titulo} />
    </div>
  );
}

export default function NotificacionesCard() {
  const [alertasCorreo, setAlertasCorreo] = useState(true);
  const [notificacionesPush, setNotificacionesPush] = useState(false);

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-title1 font-bold text-ink-700">Preferencias de Notificación</h3>
      <div className="flex flex-col gap-4">
        <PreferenciaRow
          icon={<Mail className="h-6 w-6 shrink-0 text-brand-600" />}
          titulo="Alertas por Correo"
          descripcion="Ofertas, cotizaciones, personalizaciones y estados de pedido."
          checked={alertasCorreo}
          onChange={setAlertasCorreo}
        />
        <PreferenciaRow
          icon={<Bell className="h-6 w-6 shrink-0 text-ink-400" />}
          titulo="Notificaciones Push"
          descripcion="Alertas inmediatas en tu navegador."
          checked={notificacionesPush}
          onChange={setNotificacionesPush}
        />
      </div>
    </div>
  );
}

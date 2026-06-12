import type { TabPedidos } from '../../utils/pedidoUi';

const TABS: { id: TabPedidos; label: string }[] = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'EN_PROGRESO', label: 'En Progreso' },
  { id: 'FINALIZADOS', label: 'Finalizados' },
];

interface PedidoTabsProps {
  activa: TabPedidos;
  onChange: (tab: TabPedidos) => void;
}

export default function PedidoTabs({ activa, onChange }: PedidoTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-ink-100 bg-white p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-6 py-3 text-label-lg font-medium transition-colors ${
            activa === tab.id ? 'bg-info text-white' : 'text-ink-700 hover:bg-surface-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

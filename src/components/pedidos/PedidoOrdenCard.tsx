import { formatearPrecio } from '../../utils/formatearPrecio';
import { formatearFecha, generarCodigoPedido, pedidoCoincideConTab, type TabPedidos } from '../../utils/pedidoUi';
import type { IDetalleOrden, IPedidoConDetalles } from '../../types/IPedido';
import PedidoCard from './PedidoCard';

interface PedidoOrdenCardProps {
  orden: IDetalleOrden;
  tab: TabPedidos;
  onCancelar: (pedidoId: number) => void;
  onRepetir: (pedido: IPedidoConDetalles) => void;
  cancelandoId: number | null;
  repitiendoId: number | null;
}

export default function PedidoOrdenCard({
  orden,
  tab,
  onCancelar,
  onRepetir,
  cancelandoId,
  repitiendoId,
}: PedidoOrdenCardProps) {
  const pedidos = orden.pedidos.filter((p) => pedidoCoincideConTab(p.estado, tab));
  if (pedidos.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-title2 font-bold text-ink-900">{generarCodigoPedido(orden.fecha, orden.id)}</span>
          <span className="text-body-md text-ink-500">{formatearFecha(orden.fecha)}</span>
        </div>
        <span className="text-title1 font-bold text-brand-600">{formatearPrecio(orden.total)}</span>
      </div>

      <div className="flex flex-col divide-y divide-ink-100">
        {pedidos.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            ordenId={orden.id}
            onCancelar={onCancelar}
            onRepetir={onRepetir}
            cancelando={cancelandoId === pedido.id}
            repitiendo={repitiendoId === pedido.id}
          />
        ))}
      </div>
    </div>
  );
}

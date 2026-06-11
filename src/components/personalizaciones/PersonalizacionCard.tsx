import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { RUTAS } from '../../constants/rutas';
import { formatearPrecio } from '../../utils/formatearPrecio';
import { formatearFecha, generarCodigoPersonalizacion, getBadgeInfo } from '../../utils/personalizacionUi';
import type { IPersonalizacionResumen } from '../../types/IPersonalizacion';

const BTN_BASE = 'block shrink-0 rounded-lg px-8 py-[18px] text-center text-label-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const BTN_PRIMARY = `${BTN_BASE} bg-brand-500 text-white hover:bg-brand-600`;
const BTN_PRIMARY_LIGHT = `${BTN_BASE} bg-brand-50 text-brand-600 hover:bg-brand-100`;

interface PersonalizacionCardProps {
  personalizacion: IPersonalizacionResumen;
  onPagarAhora: (personalizacion: IPersonalizacionResumen) => void;
}

export default function PersonalizacionCard({ personalizacion: p, onPagarAhora }: PersonalizacionCardProps) {
  const navigate = useNavigate();
  const badge = getBadgeInfo(p.estado, p.pedidoEstado);
  const repetible = p.estado === 'RECHAZADA'
    || (p.estado === 'ACEPTADA' && (p.pedidoEstado === 'ENTREGADO' || p.pedidoEstado === 'CANCELADO'));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink-100 bg-white px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-1 gap-4">
        <div className="h-[100px] w-[79px] shrink-0 overflow-hidden rounded-md border border-ink-100 bg-surface-muted">
          {p.imagenUrl ? (
            <img src={p.imagenUrl} alt={p.nombreProducto ?? ''} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <ShoppingBag className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-ink-100 bg-surface-muted">
                {p.fotoTienda ? (
                  <img src={p.fotoTienda} alt={p.nombreTienda ?? ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-ink-400">
                    {(p.nombreTienda ?? 'T').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-title3 font-semibold text-ink-900">
                {p.nombreTienda ?? `Vendedor #${p.vendedorId}`}
              </span>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-label-md font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-title3 font-medium text-ink-900">{p.nombreProducto ?? 'Producto'}</span>
            <div className="flex flex-wrap items-center gap-2 text-label-md text-ink-500">
              {p.talla && <span>Talla: {p.talla}</span>}
              {p.color && <span>Color: {p.color}</span>}
              {p.sku && <span className="font-mono">SKU: {p.sku}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-body-md text-ink-500">
              {generarCodigoPersonalizacion(p.fechaCreacion, p.id)} · {formatearFecha(p.fechaCreacion)}
            </span>
            <span className="text-title2 font-bold text-brand-600">{formatearPrecio(p.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 lg:w-[200px]">
        <Link to={RUTAS.PERSONALIZACION_DETALLE(p.id)} className={BTN_PRIMARY}>
          Ver detalle
        </Link>
        {p.estado === 'RESPONDIDA' && (
          <button type="button" onClick={() => onPagarAhora(p)} className={BTN_PRIMARY_LIGHT}>
            Pagar ahora
          </button>
        )}
        {repetible && (
          <button
            type="button"
            onClick={() => navigate(RUTAS.PERSONALIZAR(p.detalleProductoId))}
            className={BTN_PRIMARY_LIGHT}
          >
            Repetir solicitud
          </button>
        )}
      </div>
    </div>
  );
}

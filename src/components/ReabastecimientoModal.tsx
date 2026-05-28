import { useState } from 'react';

interface IVariante {
  id: number;
  variante: string;
  sku: string;
  precioBase: number;
  stock: number;
  activo: boolean;
  colorHex: string;
}

interface ReabastecimientoModalProps {
  nombreProducto: string;
  variantes: IVariante[];
  onCerrar: () => void;
  onConfirmar: () => void;
}

export default function ReabastecimientoModal({
  nombreProducto,
  variantes,
  onCerrar,
  onConfirmar,
}: ReabastecimientoModalProps) {
  const [cantidades, setCantidades] = useState<Record<number, number>>(
    Object.fromEntries(variantes.map((v) => [v.id, 0]))
  );

  const handleCantidad = (id: number, val: number) =>
    setCantidades((p) => ({ ...p, [id]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-bold text-gray-900">Reabastecer Producto</h2>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-[13px] text-gray-500 mb-5">
          Ingresa el stock adicional para cada variante de{' '}
          <span className="font-semibold text-gray-900">{nombreProducto}</span>.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Variante', 'SKU', 'Stock Actual', 'Agregar'].map((col, i) => (
                  <th
                    key={col}
                    className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] px-3 py-2 bg-gray-100 border-b border-gray-200 ${
                      i === 0 ? 'rounded-tl' : i === 3 ? 'rounded-tr' : ''
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variantes.map((v) => (
                <tr key={v.id}>
                  <td className="px-3 py-3 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-[20px] h-[20px] rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      {v.variante}
                    </div>
                  </td>
                  <td className="px-3 py-3 border-b border-gray-100 align-middle">
                    <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                      {v.sku}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                    {v.stock}
                  </td>
                  <td className="px-3 py-3 border-b border-gray-100 align-middle">
                    <input
                      type="number"
                      min={0}
                      value={cantidades[v.id] ?? 0}
                      onChange={(e) => handleCantidad(v.id, Number(e.target.value))}
                      className="w-20 h-[34px] border border-gray-300 rounded px-2.5 text-[13px] text-gray-900 text-center bg-white focus:border-primario focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 h-10 border border-gray-300 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 h-10 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

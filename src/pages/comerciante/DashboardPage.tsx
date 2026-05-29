import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import ReabastecimientoModal from '../../components/ReabastecimientoModal';
import { RUTAS } from '../../constants/rutas';
import { obtenerMiTienda } from '../../services/tiendaService';

const MOCK_PEDIDOS = [
  { id: 'A-1021', producto: 'Camisa Oxford Slim', sku: 'S / Negro', precio: 'S/ 320.00', estado: 'ENTREGADO' },
  { id: 'A-1022', producto: 'Polo Oversize Blanco', sku: 'M / Blanco', precio: 'S/ 85.00', estado: 'PENDIENTE' },
  { id: 'A-1023', producto: 'Pantalón Slim Fit', sku: 'L / Azul', precio: 'S/ 220.00', estado: 'EN_PROCESO' },
  { id: 'A-1024', producto: 'Macilla Cuero', sku: 'XL / Café', precio: 'S/ 490.00', estado: 'ENTREGADO' },
];

const MOCK_INVENTARIO_CRITICO = [
  { id: 1, nombre: 'San Isidro One Melon', desc: 'Talla M / Negro', stock: 3, sku: 'CAM-001' },
  { id: 2, nombre: 'San Isidro Palo Bliss', desc: 'Talla S / Blanco', stock: 2, sku: 'POL-002' },
];

const MOCK_VARIANTES = [
  { id: 1, variante: 'Talla M / Negro', sku: 'S/.N.N.N.AA', precioBase: 240.00, stock: 10, activo: true, colorHex: '#1a1a1a' },
  { id: 2, variante: 'Talla L / Blanco', sku: 'S/.N.N.N.BB', precioBase: 240.00, stock: 12, activo: true, colorHex: '#f5f5f5' },
];

const CHART_DATA = [
  { dia: 'Lun', valor: 55 },
  { dia: 'Mar', valor: 75 },
  { dia: 'Mié', valor: 45 },
  { dia: 'Jue', valor: 90 },
  { dia: 'Vie', valor: 65 },
  { dia: 'Sáb', valor: 110 },
  { dia: 'Dom', valor: 40 },
];

const maxValorChart = Math.max(...CHART_DATA.map((d) => d.valor));

const estadoBadgeClasses: Record<string, string> = {
  ENTREGADO: 'bg-[#D1FAE5] text-[#059669]',
  PENDIENTE: 'bg-[#FEF3C7] text-[#D97706]',
  EN_PROCESO: 'bg-[#DBEAFE] text-[#2563EB]',
  CANCELADO: 'bg-[#FEE2E2] text-[#DC2626]',
};

const estadoLabel: Record<string, string> = {
  ENTREGADO: 'Entregado',
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  CANCELADO: 'Cancelado',
};

/* Pantalla: Panel de Control — resumen de actividad del comerciante */
export default function DashboardPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoModal, setProductoModal] = useState('');
  const [nombreTienda, setNombreTienda] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    obtenerMiTienda()
      .then((tienda) => setNombreTienda(tienda.nombreComercial))
      .catch((err) => {
        console.error("Error al obtener datos de la tienda:", err);
        setNombreTienda("Tienda");
      });
  }, []);

  const handleAbrirModal = (nombre: string) => {
    setProductoModal(nombre);
    setModalAbierto(true);
  };

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="ml-64 flex-1 bg-gray-100 min-h-screen p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 mb-1">Panel de Control</h1>
            <p className="text-[13px] text-gray-500">Bienvenido de vuelta, {nombreTienda}</p>
          </div>
          <button
            className="flex items-center gap-1.5 px-[18px] py-2.5 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors whitespace-nowrap"
            onClick={() => navigate(RUTAS.COMERCIANTE_NUEVO_PRODUCTO)}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Publicar Productos
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm flex items-center justify-between">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-500 mb-2">
                Ventas Totales
              </label>
              <span className="text-[28px] font-bold text-gray-900">S/ 12,450</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-primario-claro text-primario flex items-center justify-center">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm flex items-center justify-between">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-500 mb-2">
                Pedidos Pendientes
              </label>
              <span className="text-[28px] font-bold text-gray-900">8</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm flex items-center justify-between">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-500 mb-2">
                En/De Stock
              </label>
              <span className="text-[28px] font-bold text-gray-900">3</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mid row: chart + pedidos recientes */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Venta Semanal */}
          <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-gray-900">Venta Semanal</span>
              <select className="text-[12px] border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white">
                <option>Semana</option>
                <option>Mes</option>
              </select>
            </div>
            <div className="flex items-end gap-2 h-[120px] pt-2">
              {CHART_DATA.map((d, i) => (
                <div
                  key={d.dia}
                  className={`flex-1 rounded-t transition-colors ${
                    i === 5 ? 'bg-primario' : 'bg-primario-claro hover:bg-primario'
                  }`}
                  style={{ height: `${(d.valor / maxValorChart) * 100}%` }}
                  title={`S/ ${d.valor}`}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {CHART_DATA.map((d) => (
                <span key={d.dia} className="flex-1 text-center text-[11px] text-gray-500">
                  {d.dia}
                </span>
              ))}
            </div>
          </div>

          {/* Pedidos Recientes */}
          <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-gray-900">Pedidos Recientes</span>
              <span
                className="text-[12px] text-primario font-medium cursor-pointer hover:underline"
                onClick={() => navigate(RUTAS.COMERCIANTE_PEDIDOS)}
              >
                Ver todos
              </span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] pb-2 border-b border-gray-200">
                    Producto
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] pb-2 border-b border-gray-200">
                    Total
                  </th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] pb-2 border-b border-gray-200">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PEDIDOS.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded bg-gray-200 flex-shrink-0" />
                        <div>
                          <span className="block text-[12px] font-semibold text-gray-900">{p.producto}</span>
                          <span className="text-[11px] text-gray-500">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      {p.precio}
                    </td>
                    <td className="py-2.5 border-b border-gray-100 align-middle">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${estadoBadgeClasses[p.estado]}`}
                      >
                        {estadoLabel[p.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventario Crítico */}
        <div className="bg-white rounded-xl px-[22px] py-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-bold text-gray-900">Acciones de Inventario Crítico</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_INVENTARIO_CRITICO.map((item) => (
              <div key={item.id} className="flex items-center gap-3.5 p-4 border border-gray-100 rounded-xl">
                <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-gray-900 mb-0.5">{item.nombre}</p>
                  <p className="text-[12px] text-red-500 mb-2.5">
                    {item.desc} — Solo {item.stock} unidades
                  </p>
                  <button
                    className="px-3.5 py-1.5 border-[1.5px] border-primario rounded-lg text-[12px] font-semibold text-primario bg-white hover:bg-primario hover:text-white transition-colors"
                    onClick={() => handleAbrirModal(item.nombre)}
                  >
                    Reabastecer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalAbierto && (
        <ReabastecimientoModal
          nombreProducto={productoModal}
          variantes={MOCK_VARIANTES}
          onCerrar={() => setModalAbierto(false)}
          onConfirmar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}

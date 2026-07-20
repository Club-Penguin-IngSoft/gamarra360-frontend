import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import ComercianteSidebar from '../components/ComercianteSidebar';
import { useAuth } from '../hooks/useAuth';
import {
  reporteService,
  type IReporteAdmin,
  type IReporteInventario,
  type IReporteVentas,
} from '../services/reporteService';
import { formatearPrecio } from '../utils/formatearPrecio';
import {
  descargarReporteInventarioPdf,
  descargarReportePlataformaPdf,
  descargarReporteVentasPdf,
} from '../utils/reportePdf';

function fechaMesInicio() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-01`;
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

const botonPdf = 'inline-flex items-center gap-2 rounded-lg border border-primario px-4 py-2 text-sm font-semibold text-primario transition-colors hover:bg-pink-50';

export default function ReportesPage() {
  const { usuario } = useAuth();
  const admin = usuario?.rol === 'ADMIN';
  const [desde, setDesde] = useState(fechaMesInicio());
  const [hasta, setHasta] = useState(hoy());
  const [ventas, setVentas] = useState<IReporteVentas | null>(null);
  const [inventario, setInventario] = useState<IReporteInventario | null>(null);
  const [resumen, setResumen] = useState<IReporteAdmin | null>(null);
  const [tab, setTab] = useState<'VENTAS' | 'INVENTARIO'>('VENTAS');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    setError(null);
    setCargando(true);
    try {
      if (admin) {
        setResumen(await reporteService.admin(desde, hasta));
      } else {
        const [resultadoVentas, resultadoInventario] = await Promise.allSettled([
          reporteService.ventas(desde, hasta),
          reporteService.inventario(),
        ]);
        if (resultadoVentas.status === 'fulfilled') setVentas(resultadoVentas.value);
        if (resultadoInventario.status === 'fulfilled') setInventario(resultadoInventario.value);
        if (resultadoVentas.status === 'rejected' || resultadoInventario.status === 'rejected') {
          const faltantes = [
            resultadoVentas.status === 'rejected' ? 'ventas' : '',
            resultadoInventario.status === 'rejected' ? 'inventario' : '',
          ].filter(Boolean).join(' e ');
          setError(`No se pudo cargar el reporte de ${faltantes}.`);
        }
      }
    } catch {
      setError('No se pudieron generar los reportes.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { void cargar(); }, [admin]);

  const Sidebar = admin ? AdminSidebar : ComercianteSidebar;
  const tarjetas: [string, number][] = admin && resumen
    ? [
        ['Ventas brutas', resumen.ventasBrutas],
        ['Comisiones', resumen.comisiones],
        ['Devoluciones', resumen.devoluciones],
        ['Pedidos pagados', resumen.pedidosPagados],
        ['Pedidos cancelados', resumen.pedidosCancelados],
      ]
    : ventas
      ? [
          ['Ventas', ventas.totalVentas],
          ['Pedidos', ventas.pedidos],
          ['Cancelados', ventas.cancelados],
          ['Devoluciones', ventas.devoluciones],
        ]
      : [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 bg-gray-100 p-6 lg:p-8">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="mt-1 text-sm text-gray-500">Información auditable de ventas, devoluciones e inventario.</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-lg border px-3 py-2" />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-lg border px-3 py-2" />
          <button onClick={() => void cargar()} disabled={cargando} className="rounded-lg bg-primario px-5 py-2 font-semibold text-white disabled:opacity-60">
            {cargando ? 'Generando...' : 'Generar'}
          </button>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {tarjetas.map(([etiqueta, valor]) => {
            const monetario = etiqueta.includes('Venta') || etiqueta.includes('Comision') || etiqueta.includes('Devol');
            return <div key={etiqueta} className="rounded-xl bg-white p-5 shadow-sm"><p className="text-xs uppercase text-gray-500">{etiqueta}</p><p className="mt-2 text-2xl font-bold">{monetario ? formatearPrecio(valor) : valor}</p></div>;
          })}
        </div>

        {admin && resumen && (
          <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-bold">Resumen financiero de plataforma</h2>
            <p className="mt-2 text-sm text-gray-600">Las devoluciones se separan de las ventas y no generan comisión.</p>
            <button onClick={() => descargarReportePlataformaPdf(resumen, desde, hasta)} className={`${botonPdf} mt-4`}>
              <FileDown size={18} /> Descargar reporte PDF
            </button>
          </section>
        )}

        {!admin && (
          <>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setTab('VENTAS')} className={`rounded-lg px-4 py-2 ${tab === 'VENTAS' ? 'bg-primario text-white' : 'bg-white'}`}>Ventas</button>
              <button onClick={() => setTab('INVENTARIO')} className={`rounded-lg px-4 py-2 ${tab === 'INVENTARIO' ? 'bg-primario text-white' : 'bg-white'}`}>Inventario</button>
            </div>

            {tab === 'VENTAS' && ventas && (
              <section className="mt-3 overflow-x-auto rounded-xl bg-white p-5 shadow-sm">
                <button onClick={() => descargarReporteVentasPdf(ventas, desde, hasta)} className={`${botonPdf} mb-4`}>
                  <FileDown size={18} /> Descargar reporte PDF
                </button>
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left"><th className="p-2">Pedido</th><th>Fecha</th><th>Estado</th><th>Entrega</th><th>Total</th></tr></thead>
                  <tbody>{ventas.detalle.map((fila) => <tr key={fila.pedidoId} className="border-b"><td className="p-2">#{fila.pedidoId}</td><td>{new Date(fila.fecha).toLocaleDateString('es-PE')}</td><td>{fila.estado}</td><td>{fila.tipoEntrega}</td><td>{formatearPrecio(fila.total)}</td></tr>)}</tbody>
                </table>
              </section>
            )}

            {tab === 'INVENTARIO' && inventario && (
              <section className="mt-3 overflow-x-auto rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-6 text-sm">
                  <span>Unidades: <b>{inventario.unidades}</b></span>
                  <span>Stock bajo: <b>{inventario.stockBajo}</b></span>
                  <button onClick={() => descargarReporteInventarioPdf(inventario)} className={`${botonPdf} ml-auto`}>
                    <FileDown size={18} /> Descargar reporte PDF
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left"><th>Producto</th><th>SKU</th><th>Variante</th><th>Material / calidad</th><th>Stock</th><th>Mín.</th></tr></thead>
                  <tbody>{inventario.detalle.map((fila) => <tr key={fila.varianteId} className={fila.stock <= fila.stockMinimo ? 'border-b bg-red-50' : 'border-b'}><td className="p-2">{fila.producto}</td><td>{fila.sku}</td><td>{[fila.talla, fila.color].filter(Boolean).join(' · ')}</td><td>{[fila.material, fila.calidad].filter(Boolean).join(' · ')}</td><td>{fila.stock}</td><td>{fila.stockMinimo}</td></tr>)}</tbody>
                </table>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

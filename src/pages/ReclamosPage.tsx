import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import ComercianteSidebar from '../components/ComercianteSidebar';
import CuentaSidebar from '../components/cuenta/CuentaSidebar';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { reclamoService } from '../services/reclamoService';
import { pedidoService } from '../services/pedidoService';
import type { IReclamo, TipoReclamo } from '../types/IReclamo';
import type { IPedidoConDetalles } from '../types/IPedido';

export default function ReclamosPage() {
  const { usuario } = useAuth();
  const [params] = useSearchParams();
  const rol = usuario?.rol ?? 'CLIENTE';
  const [items, setItems] = useState<IReclamo[]>([]);
  const [seleccionado, setSeleccionado] = useState<IReclamo | null>(null);
  const [filtro, setFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState<TipoReclamo>(params.get('pedidoId') ? 'RECLAMO_PEDIDO' : 'LIBRO_PLATAFORMA');
  const [pedidoId, setPedidoId] = useState(params.get('pedidoId') ?? '');
  const [pedidos, setPedidos] = useState<IPedidoConDetalles[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const data = rol === 'ADMIN' ? await reclamoService.listarAdmin() : rol === 'COMERCIANTE' ? await reclamoService.listarVendedor() : await reclamoService.listarCliente();
    setItems(data);
  }
  useEffect(() => { void cargar().catch(() => setError('No se pudieron cargar los reclamos.')); }, [rol]);

  useEffect(() => {
    const clienteId = Number(usuario?.id ?? 0);
    if (rol !== 'CLIENTE' || !clienteId) return;

    let activo = true;
    setCargandoPedidos(true);
    pedidoService.obtenerMisOrdenes(clienteId)
      .then((ordenes) => Promise.allSettled(ordenes.map((orden) => pedidoService.obtenerDetalleOrden(orden.id))))
      .then((resultados) => {
        if (!activo) return;
        setPedidos(resultados
          .filter((resultado): resultado is PromiseFulfilledResult<Awaited<ReturnType<typeof pedidoService.obtenerDetalleOrden>>> => resultado.status === 'fulfilled')
          .flatMap((resultado) => resultado.value.pedidos)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
      })
      .catch(() => { if (activo) setError('No se pudieron cargar tus pedidos.'); })
      .finally(() => { if (activo) setCargandoPedidos(false); });

    return () => { activo = false; };
  }, [rol, usuario?.id]);

  const visibles = useMemo(() => items.filter((r) => {
    if (filtro !== 'TODOS' && r.estado !== filtro && r.tipo !== filtro) return false;
    const q = busqueda.toLowerCase();
    return !q || `${r.asunto} ${r.descripcion} ${r.nombreCliente ?? ''} ${r.pedidoId ?? ''}`.toLowerCase().includes(q);
  }), [items, filtro, busqueda]);

  async function crear() {
    if (!asunto.trim() || !descripcion.trim() || (tipo === 'RECLAMO_PEDIDO' && !pedidoId)) { setError('Completa todos los campos obligatorios.'); return; }
    setGuardando(true); setError(null);
    try {
      const nuevo = await reclamoService.crear({ tipo, pedidoId: pedidoId ? Number(pedidoId) : undefined, asunto, descripcion });
      setItems((v) => [nuevo, ...v]); setSeleccionado(nuevo); setAsunto(''); setDescripcion('');
    } catch { setError('No se pudo registrar. Verifica que el pedido te pertenezca.'); }
    finally { setGuardando(false); }
  }

  async function responder() {
    if (!seleccionado || !respuesta.trim()) return;
    setGuardando(true); setError(null);
    try {
      const actualizado = rol === 'ADMIN' ? await reclamoService.responderAdmin(seleccionado.id, respuesta) : await reclamoService.responderVendedor(seleccionado.id, respuesta);
      setItems((v) => v.map((r) => r.id === actualizado.id ? actualizado : r)); setSeleccionado(actualizado); setRespuesta('');
    } catch { setError('No se pudo guardar la respuesta.'); }
    finally { setGuardando(false); }
  }

  const Sidebar = rol === 'ADMIN' ? AdminSidebar : rol === 'COMERCIANTE' ? ComercianteSidebar : CuentaSidebar;
  const contenido = (
    <main className="min-w-0 flex-1 bg-gray-100 p-5 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">{rol === 'ADMIN' ? 'Libro de Reclamaciones' : 'Reclamos y Libro de Reclamaciones'}</h1>
      <p className="mt-1 text-sm text-gray-500">Consulta, filtra y da seguimiento a cada registro.</p>
      {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {rol === 'CLIENTE' && <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Registrar nuevo caso</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoReclamo)} className="rounded-lg border px-3 py-2"><option value="LIBRO_PLATAFORMA">Libro de Reclamaciones de la plataforma</option><option value="RECLAMO_PEDIDO">Reclamo sobre un pedido</option></select>
          {tipo === 'RECLAMO_PEDIDO' && <select value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} disabled={cargandoPedidos} className="rounded-lg border px-3 py-2 disabled:bg-gray-100"><option value="">{cargandoPedidos ? 'Cargando tus pedidos...' : 'Selecciona un pedido *'}</option>{pedidos.map((pedido) => <option key={pedido.id} value={pedido.id}>Pedido #{pedido.id}</option>)}</select>}
          <input value={asunto} maxLength={200} onChange={(e) => setAsunto(e.target.value)} placeholder="Asunto *" className="rounded-lg border px-3 py-2 sm:col-span-2" />
          <textarea value={descripcion} maxLength={3000} onChange={(e) => setDescripcion(e.target.value)} rows={4} placeholder="Describe lo ocurrido y la solución que solicitas *" className="rounded-lg border px-3 py-2 sm:col-span-2" />
        </div>
        <button onClick={() => void crear()} disabled={guardando} className="mt-3 rounded-lg bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Registrar</button>
      </section>}

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className="min-w-0 flex-1 rounded-lg border px-3 py-2" />
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-lg border px-3 py-2"><option value="TODOS">Todos</option><option value="PENDIENTE">Pendientes</option><option value="RESPONDIDO">Respondidos</option>{rol !== 'COMERCIANTE' && <option value="LIBRO_PLATAFORMA">Libro de plataforma</option>}</select>
        </div>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="p-3">Código</th><th className="p-3">Tipo</th><th className="p-3">Asunto</th>{rol !== 'CLIENTE' && <th className="p-3">Cliente</th>}<th className="p-3">Estado</th><th className="p-3"></th></tr></thead><tbody>{visibles.map((r) => <tr key={r.id} className="border-b"><td className="p-3">REC-{String(r.id).padStart(6,'0')}</td><td className="p-3">{r.tipo === 'LIBRO_PLATAFORMA' ? 'Plataforma' : `Pedido #${r.pedidoId}`}</td><td className="p-3 font-medium">{r.asunto}</td>{rol !== 'CLIENTE' && <td className="p-3">{r.nombreCliente}</td>}<td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${r.estado === 'RESPONDIDO' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.estado}</span></td><td className="p-3"><button onClick={() => setSeleccionado(r)} className="text-primario underline">Ver detalle</button></td></tr>)}</tbody></table>{visibles.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No hay registros.</p>}</div>
      </section>

      {seleccionado && <section className="mt-6 rounded-xl bg-white p-5 shadow-sm"><div className="flex justify-between gap-4"><div><h2 className="font-bold">{seleccionado.asunto}</h2><p className="mt-1 text-xs text-gray-500">REC-{String(seleccionado.id).padStart(6,'0')} · {new Date(seleccionado.fechaCreacion).toLocaleString('es-PE')}</p></div><button onClick={() => setSeleccionado(null)}>✕</button></div><p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{seleccionado.descripcion}</p>{seleccionado.respuesta && <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4"><p className="text-xs font-bold uppercase text-green-700">Respuesta</p><p className="mt-2 whitespace-pre-wrap text-sm">{seleccionado.respuesta}</p></div>}{rol !== 'CLIENTE' && seleccionado.estado === 'PENDIENTE' && ((rol === 'ADMIN' && seleccionado.tipo === 'LIBRO_PLATAFORMA') || rol === 'COMERCIANTE') && <div className="mt-5"><textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} rows={4} maxLength={3000} placeholder="Escribe la respuesta oficial..." className="w-full rounded-lg border p-3 text-sm"/><button onClick={() => void responder()} disabled={!respuesta.trim() || guardando} className="mt-2 rounded-lg bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Responder</button></div>}</section>}
    </main>
  );

  return rol === 'CLIENTE' ? <div><TopBar/><div className="mx-auto flex min-h-[70vh] max-w-7xl gap-6 px-4 py-8"><Sidebar/>{contenido}</div></div> : <div className="flex min-h-screen"><Sidebar/>{contenido}</div>;
}

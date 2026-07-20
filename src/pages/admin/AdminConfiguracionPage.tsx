import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import apiClient from '../../services/apiClient';

interface Categoria { idCategoria: number; nombreCategoria: string }
interface Distrito { idDistrito: number; ciudad: string; nombre: string; costoEnvio: number; activo: boolean }
interface Parametro { clave: string; valor: string; descripcion: string; tipo: string; editable: boolean }

export default function AdminConfiguracionPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [distritoNuevo, setDistritoNuevo] = useState({ ciudad: 'Lima', nombre: '', costoEnvio: 0 });
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const [cat, dist, par] = await Promise.all([
      apiClient.get<Categoria[]>('/categorias'),
      apiClient.get<Distrito[]>('/distritos/admin'),
      apiClient.get<Parametro[]>('/admin/parametros'),
    ]);
    setCategorias([...cat.data].sort((a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria, 'es')));
    setDistritos(dist.data);
    setParametros(par.data);
  }, []);

  useEffect(() => { cargar().catch(() => setMensaje('No se pudo cargar la configuración.')); }, [cargar]);

  async function crearCategoria() {
    if (!nombreCategoria.trim()) return;
    await apiClient.post('/categorias', { nombreCategoria: nombreCategoria.trim() });
    setNombreCategoria('');
    await cargar();
  }

  async function editarCategoria(categoria: Categoria) {
    const nombre = window.prompt('Nuevo nombre de la categoría:', categoria.nombreCategoria)?.trim();
    if (!nombre || nombre === categoria.nombreCategoria) return;
    await apiClient.put(`/categorias/${categoria.idCategoria}`, { nombreCategoria: nombre });
    await cargar();
  }

  async function eliminarCategoria(categoria: Categoria) {
    if (!window.confirm(`¿Eliminar la categoría “${categoria.nombreCategoria}”?`)) return;
    try {
      await apiClient.delete(`/categorias/${categoria.idCategoria}`);
      await cargar();
    } catch (error: any) {
      setMensaje(error.response?.data?.mensaje ?? 'No se puede eliminar una categoría que está en uso.');
    }
  }

  async function crearDistrito() {
    if (!distritoNuevo.ciudad.trim() || !distritoNuevo.nombre.trim() || distritoNuevo.costoEnvio < 0) return;
    await apiClient.post('/distritos', { ...distritoNuevo, activo: true });
    setDistritoNuevo({ ciudad: 'Lima', nombre: '', costoEnvio: 0 });
    await cargar();
  }

  async function guardarDistrito(distrito: Distrito) {
    await apiClient.put(`/distritos/${distrito.idDistrito}`, distrito);
    setMensaje('Costo de delivery actualizado.');
  }

  async function guardarParametro(parametro: Parametro) {
    await apiClient.put(`/admin/parametros/${encodeURIComponent(parametro.clave)}`, { valor: parametro.valor });
    setMensaje('Parámetro actualizado.');
  }

  return (
    <div className="flex min-h-screen bg-neutro-50">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-16 sm:px-6 lg:p-8">
        <h1 className="text-3xl font-black text-neutro-900">Configuración</h1>
        <p className="mt-2 text-neutro-600">Administra catálogos, costos de entrega y reglas generales de la plataforma.</p>
        {mensaje && <div className="mt-5 flex items-center justify-between rounded-xl bg-primario-claro px-4 py-3 text-sm text-primario"><span>{mensaje}</span><button onClick={() => setMensaje(null)}><X size={16}/></button></div>}

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutro-900">Categorías de producto</h2>
          <div className="mt-4 flex gap-2">
            <input value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} placeholder="Nueva categoría" maxLength={80} className="flex-1 rounded-xl border border-neutro-200 px-4 py-2.5" />
            <button onClick={crearCategoria} className="flex items-center gap-2 rounded-xl bg-primario px-4 py-2 text-sm font-bold text-white"><Plus size={16}/>Agregar</button>
          </div>
          <div className="mt-4 divide-y divide-neutro-100">
            {categorias.map((c) => <div key={c.idCategoria} className="flex items-center justify-between py-3"><span className="font-medium">{c.nombreCategoria}</span><div className="flex gap-2"><button onClick={() => editarCategoria(c)} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Editar</button><button onClick={() => eliminarCategoria(c)} className="rounded-lg p-2 text-error"><Trash2 size={16}/></button></div></div>)}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutro-900">Costos de delivery por distrito</h2>
          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
            <input value={distritoNuevo.ciudad} onChange={(e) => setDistritoNuevo(v => ({...v, ciudad:e.target.value}))} placeholder="Ciudad" className="rounded-xl border px-3 py-2" />
            <input value={distritoNuevo.nombre} onChange={(e) => setDistritoNuevo(v => ({...v, nombre:e.target.value}))} placeholder="Distrito" className="rounded-xl border px-3 py-2" />
            <input type="number" min={0} step="0.01" value={distritoNuevo.costoEnvio} onChange={(e) => setDistritoNuevo(v => ({...v, costoEnvio:Number(e.target.value)}))} className="rounded-xl border px-3 py-2" />
            <button onClick={crearDistrito} className="rounded-xl bg-primario px-4 py-2 font-bold text-white">Agregar distrito</button>
          </div>
          <div className="mt-4 space-y-2">
            {distritos.map((d, i) => <div key={d.idDistrito} className="grid grid-cols-1 items-center gap-2 rounded-xl bg-neutro-50 p-3 md:grid-cols-[1fr_1fr_140px_44px]">
              <input value={d.ciudad} onChange={(e) => setDistritos(v => v.map((x,j)=>j===i?{...x,ciudad:e.target.value}:x))} className="rounded-lg border px-3 py-2" />
              <input value={d.nombre} onChange={(e) => setDistritos(v => v.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} className="rounded-lg border px-3 py-2" />
              <input type="number" min={0} step="0.01" value={d.costoEnvio} onChange={(e) => setDistritos(v => v.map((x,j)=>j===i?{...x,costoEnvio:Number(e.target.value)}:x))} className="rounded-lg border px-3 py-2" />
              <button onClick={() => guardarDistrito(d)} className="rounded-lg p-2 text-primario" aria-label="Guardar distrito"><Save size={18}/></button>
            </div>)}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutro-900">Parámetros del sistema</h2>
          <div className="mt-4 space-y-3">
            {parametros.map((p, i) => <div key={p.clave} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-neutro-100 p-4 md:grid-cols-[1fr_180px_44px]">
              <div><p className="text-sm font-bold">{p.clave.replace(/_/g,' ')}</p><p className="text-xs text-neutro-500">{p.descripcion}</p></div>
              <input value={p.valor} disabled={!p.editable} onChange={(e) => setParametros(v => v.map((x,j)=>j===i?{...x,valor:e.target.value}:x))} className="rounded-lg border px-3 py-2 disabled:bg-neutro-100" />
              <button onClick={() => guardarParametro(p)} disabled={!p.editable} className="rounded-lg p-2 text-primario disabled:opacity-30"><Save size={18}/></button>
            </div>)}
          </div>
        </section>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { Search, Download, UserPlus, MoreVertical, X, AlertTriangle } from "lucide-react";
import apiClient from '../../services/apiClient';
//import axios from 'axios';

//const BASE = 'http://localhost:8080/api/v1/admin/usuarios';
//const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ROL_STYLES: Record<string, string> = {
  VENDEDOR: 'bg-primario-claro text-primario',
  ADMIN:    'bg-marino text-white',
  CLIENTE:  'bg-advertencia-claro text-advertencia',
};

const ROLES = ['CLIENTE', 'VENDEDOR', 'ADMIN'];

interface Usuario {
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  rol: string;
  activo: boolean;
  fechaRegistro: string;
}

interface UsuarioDetalle {
  usuarioId: number;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  email: string;
  dni: string;
  telefono: string;
  rol: string;
  activo: boolean;
  fechaRegistro: string;
  actividad: {
    totalPedidos: number;
    totalCotizaciones: number;
    totalSolicitudes: number;
    ultimaConexion: string;
  };
}

export default function AdminUsuariosPage() {
  const [users, setUsers]       = useState<Usuario[]>([]);
  const [total, setTotal]       = useState(0);
  const [q, setQ]               = useState('');
  const [rolFiltro, setRolFiltro]     = useState<string | null>(null);
  const [activoFiltro, setActivoFiltro] = useState<boolean | null>(null);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const [detalle, setDetalle]         = useState<UsuarioDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  const [usuarioDesactivar, setUsuarioDesactivar] = useState<Usuario | null>(null);
  const [motivoDesactivacion, setMotivoDesactivacion] = useState('');
  const [errorDesactivacion, setErrorDesactivacion] = useState<string | null>(null);
  const [desactivando, setDesactivando] = useState(false);
  const [formUsuario, setFormUsuario] = useState({ nombres: '', primerApellido: '', segundoApellido: '', email: '', dni: '', telefono: '', contrasenha: '', rol: 'CLIENTE' });

  const cargar = async (p = 0) => {
    setLoading(true);
    try {
      const params: any = { page: p, size: 10 };
      if (q.trim())          params.q      = q.trim();
      if (rolFiltro)         params.rol    = rolFiltro;
      if (activoFiltro !== null) params.activo = activoFiltro;

      const res = await apiClient.get('/admin/usuarios', { params });
      setUsers(res.data.content);
      setTotal(res.data.totalElements);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(0); }, [rolFiltro, activoFiltro]);

  const handleToggle = async (user: Usuario) => {
    setMenuAbierto(null);
    if (user.activo) {
      setUsuarioDesactivar(user);
      setMotivoDesactivacion('');
      setErrorDesactivacion(null);
      return;
    }
    try {
        await apiClient.patch(`/admin/usuarios/${user.usuarioId}/reactivar`, {});
      await cargar(page);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const cerrarDesactivacion = () => {
    if (desactivando) return;
    setUsuarioDesactivar(null);
    setMotivoDesactivacion('');
    setErrorDesactivacion(null);
  };

  const confirmarDesactivacion = async () => {
    if (!usuarioDesactivar) return;
    const razon = motivoDesactivacion.trim();
    if (razon.length < 10) {
      setErrorDesactivacion('Explica el motivo con al menos 10 caracteres.');
      return;
    }
    setDesactivando(true);
    setErrorDesactivacion(null);
    try {
      await apiClient.patch(`/admin/usuarios/${usuarioDesactivar.usuarioId}/desactivar`, { razon });
      setUsuarioDesactivar(null);
      setMotivoDesactivacion('');
      await cargar(page);
    } catch (e: any) {
      setErrorDesactivacion(e.response?.data?.message || 'No se pudo desactivar la cuenta. Inténtalo nuevamente.');
    } finally {
      setDesactivando(false);
    }
  };

  const verDetalle = async (usuarioId: number) => {
    setCargandoDetalle(true);
    setDetalle(null);
    try {
      const res = await apiClient.get(`/admin/usuarios/${usuarioId}`);
      setDetalle(res.data);
    } catch (e) {
      console.error(e);
      alert('No se pudo cargar el detalle del usuario.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const limpiarFiltros = () => {
    setQ('');
    setRolFiltro(null);
    setActivoFiltro(null);
  };

  const exportar = () => {
    const filas = [['ID', 'Nombre', 'Email', 'Rol', 'Estado'], ...users.map(u => [String(u.usuarioId), u.nombreCompleto, u.email, u.rol, u.activo ? 'ACTIVO' : 'INACTIVO'])];
    const csv = filas.map(f => f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    enlace.download = 'usuarios-gamarra360.csv';
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  };

  const registrarUsuario = async () => {
    if (!formUsuario.nombres.trim() || !formUsuario.primerApellido.trim() || !formUsuario.email.trim() || (!editandoId && formUsuario.contrasenha.length < 8)) return;
    setGuardandoUsuario(true);
    try {
      if (editandoId) {
        const { contrasenha: _contrasenha, rol: _rol, ...datos } = formUsuario;
        await apiClient.put(`/admin/usuarios/${editandoId}`, datos);
      } else {
        await apiClient.post('/admin/usuarios', { ...formUsuario, tipoDocumento: 'DNI' });
      }
      setModalUsuario(false);
      setEditandoId(null);
      setFormUsuario({ nombres: '', primerApellido: '', segundoApellido: '', email: '', dni: '', telefono: '', contrasenha: '', rol: 'CLIENTE' });
      await cargar(0);
    } catch (e: any) {
      alert(e.response?.data?.mensaje ?? 'No se pudo registrar el usuario.');
    } finally { setGuardandoUsuario(false); }
  };

  const abrirEdicion = (usuario: UsuarioDetalle) => {
    setEditandoId(usuario.usuarioId);
    setFormUsuario({
      nombres: usuario.nombres ?? '', primerApellido: usuario.primerApellido ?? '', segundoApellido: usuario.segundoApellido ?? '',
      email: usuario.email ?? '', dni: usuario.dni ?? '', telefono: usuario.telefono ?? '', contrasenha: '', rol: usuario.rol,
    });
    setDetalle(null);
    setModalUsuario(true);
  };

  const avatarLetras = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const AVATAR_COLORS = [
    'bg-exito text-white', 'bg-primario text-white',
    'bg-info text-white',  'bg-neutro-800 text-white',
  ];
  const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">
      <AdminSidebar />

      <main className="min-w-0 flex-1 px-4 py-16 sm:px-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutro-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-neutro-600 font-medium">
              Administra y audita el ecosistema de comerciantes y clientes de Gamarra360.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportar} className="flex items-center gap-2 px-4 py-2 border border-neutro-200 bg-white rounded-xl text-neutro-600 hover:bg-neutro-50 transition-colors font-bold text-sm">
              <Download className="w-4 h-4" />
              Exportar Datos
            </button>
            <button onClick={() => { setEditandoId(null); setFormUsuario({ nombres: '', primerApellido: '', segundoApellido: '', email: '', dni: '', telefono: '', contrasenha: '', rol: 'CLIENTE' }); setModalUsuario(true); }} className="flex items-center gap-2 px-4 py-2 bg-primario text-white rounded-xl hover:bg-primario-hover transition-colors font-bold text-sm shadow-primario">
              <UserPlus className="w-4 h-4" />
              Registrar Cliente o Admin
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">TOTAL DE USUARIOS</p>
            <p className="text-4xl font-black text-neutro-900">{total.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">VENDEDORES</p>
            <p className="text-4xl font-black text-neutro-900">
              {users.filter(u => u.rol === 'VENDEDOR').length}
            </p>
          </div>
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">INACTIVOS</p>
            <p className="text-4xl font-black text-neutro-900 text-error">
              {users.filter(u => !u.activo).length}
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-tarjeta shadow-tarjeta border border-neutro-100 overflow-hidden">

          {/* Buscador */}
          <div className="p-4 border-b border-neutro-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutro-400" />
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && cargar(0)}
                placeholder="Buscar por nombre, email o ID..."
                className="w-full pl-10 pr-4 py-2 text-neutro-700 placeholder-neutro-400 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 flex items-center justify-between bg-neutro-50/50 border-b border-neutro-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-neutro-400 uppercase tracking-wider">Filtrar por:</span>
              <div className="flex items-center gap-2">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRolFiltro(rolFiltro === r ? null : r)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      rolFiltro === r
                        ? 'bg-primario text-white border-primario'
                        : 'bg-white border-neutro-200 text-neutro-700 hover:border-primario'
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <button
                  onClick={() => setActivoFiltro(activoFiltro === true ? null : true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    activoFiltro === true
                      ? 'bg-exito text-white border-exito'
                      : 'bg-white border-neutro-200 text-neutro-700 hover:border-exito'
                  }`}
                >
                  ACTIVOS
                </button>
                <button
                  onClick={() => setActivoFiltro(activoFiltro === false ? null : false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    activoFiltro === false
                      ? 'bg-error text-white border-error'
                      : 'bg-white border-neutro-200 text-neutro-700 hover:border-error'
                  }`}
                >
                  INACTIVOS
                </button>
              </div>
            </div>
            <button onClick={limpiarFiltros} className="text-primario text-xs font-black hover:underline uppercase tracking-tight">
              Limpiar Filtros
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutro-100 bg-neutro-50/30">
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">Identidad del Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">Registro</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-neutro-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-neutro-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutro-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-neutro-400 font-medium">Cargando...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-neutro-400 font-medium">No se encontraron usuarios</td>
                  </tr>
                ) : users.map(user => (
                  <tr
                    key={user.usuarioId}
                    onClick={() => verDetalle(user.usuarioId)}
                    className="hover:bg-neutro-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 border-white shadow-sm ${avatarColor(user.usuarioId)}`}>
                          {avatarLetras(user.nombreCompleto || user.email)}
                        </div>
                        <div>
                          <p className="font-bold text-neutro-900">{user.nombreCompleto || '—'}</p>
                          <p className="text-sm text-neutro-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${ROL_STYLES[user.rol] ?? 'bg-neutro-100 text-neutro-600'}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutro-700 font-medium">
                        {user.fechaRegistro
                          ? new Date(user.fechaRegistro).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm ${user.activo ? 'bg-exito' : 'bg-advertencia'}`}>
                        {user.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setMenuAbierto(menuAbierto === user.usuarioId ? null : user.usuarioId)}
                        className="p-2 hover:bg-neutro-100 rounded-lg text-neutro-400 hover:text-neutro-600 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {menuAbierto === user.usuarioId && (
                        <div className="absolute right-6 top-12 z-20 bg-white border border-neutro-100 rounded-xl shadow-lg overflow-hidden w-40">
                          <button
                            onClick={() => handleToggle(user)}
                            className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors hover:bg-neutro-50 ${user.activo ? 'text-error' : 'text-exito'}`}
                          >
                            {user.activo ? 'Desactivar' : 'Reactivar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && users.length < 10 &&
                  Array.from({ length: 10 - users.length }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td colSpan={5} className="py-[18px]" />
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Footer paginación */}
          <div className="px-6 py-4 flex items-center justify-between bg-neutro-50/30">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-wider">
              Mostrando {page * 10 + 1}–{Math.min((page + 1) * 10, total)} de {total} usuarios
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => cargar(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-neutro-200 text-xs font-bold text-neutro-600 hover:bg-neutro-100 disabled:opacity-30 transition-all"
              >
                Anterior
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-primario text-white text-xs font-black">
                {page + 1}
              </span>
              <button
                onClick={() => cargar(page + 1)}
                disabled={(page + 1) * 10 >= total}
                className="px-3 py-1.5 rounded-lg border border-neutro-200 text-xs font-bold text-neutro-600 hover:bg-neutro-100 disabled:opacity-30 transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de detalle de cuenta */}
      {(cargandoDetalle || detalle) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetalle(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-tarjeta shadow-tarjeta border border-neutro-100 p-6">
            <button
              onClick={() => setDetalle(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-neutro-400 hover:bg-neutro-100 hover:text-neutro-600 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {cargandoDetalle || !detalle ? (
              <p className="text-center py-16 text-neutro-400 font-medium">Cargando...</p>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black border-2 border-white shadow-sm flex-shrink-0 ${avatarColor(detalle.usuarioId)}`}>
                    {avatarLetras(`${detalle.nombres} ${detalle.primerApellido}`)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-lg text-neutro-900 truncate">
                      {[detalle.nombres, detalle.primerApellido, detalle.segundoApellido].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-sm text-neutro-500 font-medium truncate">{detalle.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${ROL_STYLES[detalle.rol] ?? 'bg-neutro-100 text-neutro-600'}`}>
                    {detalle.rol}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm ${detalle.activo ? 'bg-exito' : 'bg-advertencia'}`}>
                    {detalle.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-black text-neutro-400 uppercase tracking-wider mb-1">DNI</p>
                    <p className="font-bold text-neutro-800 text-sm">{detalle.dni || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutro-400 uppercase tracking-wider mb-1">Teléfono</p>
                    <p className="font-bold text-neutro-800 text-sm">{detalle.telefono || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-neutro-400 uppercase tracking-wider mb-1">Registro</p>
                    <p className="font-bold text-neutro-800 text-sm">
                      {detalle.fechaRegistro
                        ? new Date(detalle.fechaRegistro).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutro-100 pt-4">
                  <p className="text-xs font-black text-neutro-400 uppercase tracking-wider mb-3">Actividad</p>
                  <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                    <div className="bg-neutro-50 rounded-xl p-3">
                      <p className="text-xl font-black text-neutro-900">{detalle.actividad?.totalPedidos ?? 0}</p>
                      <p className="text-[10px] font-bold text-neutro-400 uppercase">Pedidos</p>
                    </div>
                    <div className="bg-neutro-50 rounded-xl p-3">
                      <p className="text-xl font-black text-neutro-900">{detalle.actividad?.totalCotizaciones ?? 0}</p>
                      <p className="text-[10px] font-bold text-neutro-400 uppercase">Cotizaciones</p>
                    </div>
                    <div className="bg-neutro-50 rounded-xl p-3">
                      <p className="text-xl font-black text-neutro-900">{detalle.actividad?.totalSolicitudes ?? 0}</p>
                      <p className="text-[10px] font-bold text-neutro-400 uppercase">Solicitudes</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => abrirEdicion(detalle)} className="mt-5 w-full rounded-xl border border-primario px-4 py-2.5 text-sm font-bold text-primario hover:bg-primario-claro">
                  Modificar usuario
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {modalUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/40" onClick={() => setModalUsuario(false)} aria-label="Cerrar" />
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <button onClick={() => setModalUsuario(false)} className="absolute right-4 top-4 text-neutro-400"><X size={20}/></button>
            <h2 className="text-xl font-black text-neutro-900">{editandoId ? 'Modificar usuario' : 'Registrar usuario'}</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={formUsuario.nombres} onChange={e=>setFormUsuario(v=>({...v,nombres:e.target.value}))} placeholder="Nombres *" className="rounded-xl border px-4 py-3" />
              <input value={formUsuario.primerApellido} onChange={e=>setFormUsuario(v=>({...v,primerApellido:e.target.value}))} placeholder="Primer apellido *" className="rounded-xl border px-4 py-3" />
              <input value={formUsuario.segundoApellido} onChange={e=>setFormUsuario(v=>({...v,segundoApellido:e.target.value}))} placeholder="Segundo apellido" className="rounded-xl border px-4 py-3" />
              <input value={formUsuario.dni} onChange={e=>setFormUsuario(v=>({...v,dni:e.target.value.replace(/\D/g,'').slice(0,8)}))} placeholder="DNI" className="rounded-xl border px-4 py-3" />
              <input type="email" value={formUsuario.email} onChange={e=>setFormUsuario(v=>({...v,email:e.target.value}))} placeholder="Correo *" className="rounded-xl border px-4 py-3 sm:col-span-2" />
              <input value={formUsuario.telefono} onChange={e=>setFormUsuario(v=>({...v,telefono:e.target.value.replace(/\D/g,'').slice(0,9)}))} placeholder="Teléfono" className="rounded-xl border px-4 py-3" />
              <select disabled={!!editandoId} value={formUsuario.rol} onChange={e=>setFormUsuario(v=>({...v,rol:e.target.value}))} className="rounded-xl border px-4 py-3 disabled:bg-neutro-100"><option value="CLIENTE">Cliente</option><option value="ADMIN">Administrador</option>{editandoId && <option value="VENDEDOR">Vendedor</option>}</select>
              {!editandoId && <input type="password" minLength={8} value={formUsuario.contrasenha} onChange={e=>setFormUsuario(v=>({...v,contrasenha:e.target.value}))} placeholder="Contraseña (mín. 8) *" className="rounded-xl border px-4 py-3 sm:col-span-2" />}
            </div>
            <button onClick={registrarUsuario} disabled={guardandoUsuario} className="mt-5 w-full rounded-xl bg-primario py-3 font-bold text-white disabled:opacity-50">{guardandoUsuario ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar usuario'}</button>
          </div>
        </div>
      )}
      {usuarioDesactivar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-desactivacion">
          <button className="absolute inset-0 bg-neutro-900/50 backdrop-blur-[1px]" onClick={cerrarDesactivacion} aria-label="Cerrar diálogo" />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-4 border-b border-neutro-100 px-6 py-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-error">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="titulo-desactivacion" className="text-xl font-black text-neutro-900">Desactivar cuenta</h2>
                <p className="mt-1 text-sm text-neutro-500">Esta acción bloqueará el acceso del usuario hasta que un administrador reactive la cuenta.</p>
              </div>
              <button onClick={cerrarDesactivacion} disabled={desactivando} className="rounded-lg p-1.5 text-neutro-400 hover:bg-neutro-100 hover:text-neutro-700 disabled:opacity-40" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-neutro-100 bg-neutro-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-neutro-400">Usuario seleccionado</p>
                <p className="mt-2 font-bold text-neutro-900">{usuarioDesactivar.nombreCompleto}</p>
                <p className="text-sm text-neutro-500">{usuarioDesactivar.email}</p>
              </div>

              <label htmlFor="motivo-desactivacion" className="mt-5 block text-sm font-bold text-neutro-800">
                Motivo de desactivación <span className="text-error">*</span>
              </label>
              <p className="mt-1 text-xs text-neutro-500">Describe brevemente la razón administrativa. Esta información quedará asociada a la acción.</p>
              <textarea
                id="motivo-desactivacion"
                autoFocus
                rows={4}
                maxLength={300}
                value={motivoDesactivacion}
                onChange={(e) => { setMotivoDesactivacion(e.target.value); if (errorDesactivacion) setErrorDesactivacion(null); }}
                placeholder="Ej.: Incumplimiento reiterado de las políticas de la plataforma."
                className={`mt-3 w-full resize-none rounded-xl border px-4 py-3 text-sm text-neutro-800 outline-none transition-colors focus:ring-2 ${errorDesactivacion ? 'border-error focus:ring-red-100' : 'border-neutro-200 focus:border-primario focus:ring-pink-100'}`}
                aria-invalid={Boolean(errorDesactivacion)}
                aria-describedby={errorDesactivacion ? 'error-motivo' : 'ayuda-motivo'}
              />
              <div className="mt-1 flex items-start justify-between gap-4">
                <span id={errorDesactivacion ? 'error-motivo' : 'ayuda-motivo'} className={`text-xs ${errorDesactivacion ? 'font-semibold text-error' : 'text-neutro-400'}`}>
                  {errorDesactivacion ?? 'Mínimo 10 caracteres.'}
                </span>
                <span className="text-xs tabular-nums text-neutro-400">{motivoDesactivacion.length}/300</span>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-neutro-100 bg-neutro-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button onClick={cerrarDesactivacion} disabled={desactivando} className="rounded-xl border border-neutro-200 bg-white px-5 py-2.5 text-sm font-bold text-neutro-700 hover:bg-neutro-100 disabled:opacity-50">
                Mantener activa
              </button>
              <button onClick={() => void confirmarDesactivacion()} disabled={desactivando || motivoDesactivacion.trim().length < 10} className="rounded-xl bg-error px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
                {desactivando ? 'Desactivando...' : 'Confirmar desactivación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

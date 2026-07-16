import { useEffect, useState } from 'react';
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { Search, Download, UserPlus, MoreVertical, X } from "lucide-react";
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
    try {
      if (user.activo) {
        const razon = prompt('Motivo de desactivación:');
        if (!razon) return;
        await apiClient.patch(`/admin/usuarios/${user.usuarioId}/desactivar`, { razon });
      } else {
        await apiClient.patch(`/admin/usuarios/${user.usuarioId}/reactivar`, {});
      }
      cargar(page);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al cambiar estado');
    }
    setMenuAbierto(null);
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
            <button className="flex items-center gap-2 px-4 py-2 border border-neutro-200 bg-white rounded-xl text-neutro-600 hover:bg-neutro-50 transition-colors font-bold text-sm">
              <Download className="w-4 h-4" />
              Exportar Datos
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primario text-white rounded-xl hover:bg-primario-hover transition-colors font-bold text-sm shadow-primario">
              <UserPlus className="w-4 h-4" />
              Registrar Usuario
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

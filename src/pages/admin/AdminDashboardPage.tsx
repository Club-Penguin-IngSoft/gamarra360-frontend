import { useEffect, useState } from 'react';
import { AdminSidebar } from "../../components/admin/AdminSidebar"
import {
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  User as UserIcon,
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import apiClient from "../../services/apiClient"

interface IActividadReciente {
  tipo: 'COMERCIANTE' | 'CLIENTE';
  nombreCompleto: string;
  email: string;
}

interface IDashboardResumen {
  totalUsuarios: number;
  ingresosTotales: number;
  comerciantesPendientes: number;
  comerciantesAprobados: number;
  comerciantesRechazados: number;
  actividadReciente: IActividadReciente[];
}

export default function AdminDashboardPage() {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState<IDashboardResumen | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    apiClient.get<IDashboardResumen>('/admin/usuarios/dashboard')
      .then(({ data }) => setResumen(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const totalVendedores =
    (resumen?.comerciantesAprobados ?? 0) +
    (resumen?.comerciantesPendientes ?? 0) +
    (resumen?.comerciantesRechazados ?? 0);

  const porcentajeVerificados = totalVendedores > 0
    ? Math.round(((resumen?.comerciantesAprobados ?? 0) / totalVendedores) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutro-900 mb-2">
            ¡Hola, {usuario?.nombre || 'Admin'}!
          </h1>
          <p className="text-neutro-600 font-medium">
            Rendimiento del sistema en tiempo real y métricas operativas del ecosistema Gamarra360.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Usuarios Totales */}
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <div className="w-12 h-12 rounded-xl bg-primario-claro flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primario" />
            </div>
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              USUARIOS TOTALES
            </p>
            <p className="text-4xl font-black text-neutro-900">
              {cargando ? '—' : resumen?.totalUsuarios.toLocaleString()}
            </p>
          </div>

          {/* Ingresos Totales */}
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <div className="w-12 h-12 rounded-xl bg-primario-claro flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-primario" />
            </div>
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              INGRESOS TOTALES (10%)
            </p>
            <p className="text-4xl font-black text-neutro-900">
              {cargando ? '—' : `S/ ${resumen?.ingresosTotales.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </p>
          </div>

          {/* Aprobaciones Pendientes */}
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border-l-4 border-l-primario border-y-neutro-100 border-r-neutro-100">
            <div className="w-12 h-12 rounded-xl bg-primario-claro flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primario" />
            </div>
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              COMERCIANTES PENDIENTES
            </p>
            <p className="text-4xl font-black text-neutro-900">
              {cargando ? '—' : resumen?.comerciantesPendientes}
            </p>
          </div>
        </div>

        {/* Activity and Vendor Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-neutro-900">Actividad Reciente</h2>
            </div>

            <div className="space-y-6">
              {cargando ? (
                <p className="text-neutro-400 text-sm">Cargando...</p>
              ) : resumen?.actividadReciente.length === 0 ? (
                <p className="text-neutro-400 text-sm">Sin registros recientes.</p>
              ) : (
                resumen?.actividadReciente.map((a, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-neutro-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      a.tipo === 'COMERCIANTE' ? 'bg-primario-claro' : 'bg-info-claro'
                    }`}>
                      {a.tipo === 'COMERCIANTE'
                        ? <ArrowUpRight className="w-5 h-5 text-primario" />
                        : <UserIcon className="w-5 h-5 text-info" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-neutro-900">
                          {a.tipo === 'COMERCIANTE' ? 'Nuevo Comerciante Registrado' : 'Nuevo Cliente Registrado'}
                        </p>
                      </div>
                      <p className="text-sm text-neutro-600 mt-1">
                        {a.nombreCompleto || a.email} se registró en la plataforma.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vendor Status Panel */}
          <div className="bg-marino rounded-tarjeta p-6 text-white shadow-xl shadow-marino/20">
            <h2 className="text-lg font-black mb-1">Estado de Vendedores</h2>
            <p className="text-white/60 text-sm font-medium mb-6 uppercase tracking-wider">Análisis de la Cola</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-medium">Aprobados</span>
                <span className="font-black text-xl">
                  {cargando ? '—' : resumen?.comerciantesAprobados}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-medium">Pendientes</span>
                <span className="font-black text-xl text-dorado">
                  {cargando ? '—' : resumen?.comerciantesPendientes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-medium">Rechazados</span>
                <span className="font-black text-xl text-red-400">
                  {cargando ? '—' : resumen?.comerciantesRechazados}
                </span>
              </div>
            </div>

            <div className="mt-6 mb-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-dorado rounded-full shadow-[0_0_10px_rgba(245,205,64,0.5)]"
                  style={{ width: `${porcentajeVerificados}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
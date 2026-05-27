import { Sidebar } from "../../components/admin/Sidebar"
import {
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

export default function AdminDashboardPage() {
  const { usuario } = useAuth()

  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">
      <Sidebar />

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
          {/* Usuarios Verificados */}
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <div className="w-12 h-12 rounded-xl bg-primario-claro flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primario" />
            </div>
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              USUARIOS VERIFICADOS
            </p>
            <p className="text-4xl font-black text-neutro-900">24,512</p>
          </div>

          {/* Ventas Totales */}
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <div className="w-12 h-12 rounded-xl bg-primario-claro flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-primario" />
            </div>
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              VENTAS TOTALES
            </p>
            <p className="text-4xl font-black text-neutro-900">S/ 1.2M</p>
          </div>

          {/* Aprobaciones Pendientes */}
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border-l-4 border-l-primario border-y-neutro-100 border-r-neutro-100">
            <div className="w-12 h-12 rounded-xl bg-primario-claro flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primario" />
            </div>
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              APROBACIONES PENDIENTES
            </p>
            <p className="text-4xl font-black text-neutro-900">142</p>
          </div>
        </div>

        {/* Activity and Vendor Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-neutro-900">Actividad Reciente</h2>
              <button className="text-primario text-sm font-bold hover:underline uppercase tracking-tight">
                VER TODOS LOS REGISTROS
              </button>
            </div>

            <div className="space-y-6">
              {/* Activity Item 1 */}
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-neutro-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primario-claro flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-primario" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-neutro-900">Nueva Solicitud de Vendedor</p>
                    <span className="text-sm text-neutro-400 font-medium">hace 2 min</span>
                  </div>
                  <p className="text-sm text-neutro-600 mt-1">
                    Textiles Gamarra S.A. envió documentación para verificación Nivel 2.
                  </p>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-neutro-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-advertencia-claro flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-advertencia" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-neutro-900">Advertencia del Sistema</p>
                    <span className="text-sm text-neutro-400 font-medium">hace 45 min</span>
                  </div>
                  <p className="text-sm text-neutro-600 mt-1">
                    Alta latencia detectada en pasarela de pagos 'Gateway-7'. Auto-escalado iniciado.
                  </p>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-neutro-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-info-claro flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-neutro-900">Actualización Masiva de Inventario</p>
                    <span className="text-sm text-neutro-400 font-medium">hace 2 horas</span>
                  </div>
                  <p className="text-sm text-neutro-600 mt-1">
                    El Vendedor ID #9042 actualizó 1,200 SKUs en la categoría 'Colección Verano'.
                  </p>
                </div>
              </div>

              {/* Activity Item 4 */}
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-neutro-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutro-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-neutro-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-neutro-900">Vendedor Verificado</p>
                    <span className="text-sm text-neutro-400 font-medium">hace 5 horas</span>
                  </div>
                  <p className="text-sm text-neutro-600 mt-1">
                    La Admin 'María Q.' aprobó la verificación de 'Andean Alpaca Designs'.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Status Panel */}
          <div className="bg-marino rounded-tarjeta p-6 text-white shadow-xl shadow-marino/20">
            <h2 className="text-lg font-black mb-1">Estado de Vendedores</h2>
            <p className="text-white/60 text-sm font-medium mb-6 uppercase tracking-wider">Análisis de la Cola</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-medium">Verificados</span>
                <span className="font-black text-xl">1,842</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-medium">Pendientes</span>
                <span className="font-black text-xl text-dorado">142</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-medium">Rechazados</span>
                <span className="font-black text-xl text-red-400">34</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 mb-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-dorado rounded-full shadow-[0_0_10px_rgba(245,205,64,0.5)]" style={{ width: "91%" }} />
              </div>
            </div>

            <button className="w-full py-3 bg-white text-marino font-black rounded-xl hover:bg-white/90 transition-all uppercase text-sm tracking-wide">
              REVISAR COLA
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

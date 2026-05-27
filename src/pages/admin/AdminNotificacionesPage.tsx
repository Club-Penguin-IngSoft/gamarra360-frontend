import { AdminSidebar } from "../../components/admin/AdminSidebar"
import { Bell } from "lucide-react"

export default function AdminNotificacionesPage() {
  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutro-900 mb-2">
            Notificaciones
          </h1>
          <p className="text-neutro-600 font-medium">
            Centro de notificaciones y alertas del sistema.
          </p>
        </div>

        <div className="bg-white rounded-tarjeta p-20 shadow-tarjeta border border-neutro-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-primario-claro flex items-center justify-center mb-6 shadow-inner border border-primario/5">
            <Bell className="w-10 h-10 text-primario animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-neutro-900 mb-2">No hay notificaciones</h2>
          <p className="text-neutro-500 font-medium max-w-sm">
            Te avisaremos cuando ocurran eventos importantes en el ecosistema Gamarra360.
          </p>
          <button className="mt-8 px-8 py-3 bg-primario text-white rounded-xl font-black shadow-primario hover:bg-primario-hover transition-all uppercase text-sm tracking-widest">
            Actualizar Bandeja
          </button>
        </div>
      </main>
    </div>
  )
}

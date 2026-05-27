import { AdminSidebar } from "../../components/admin/AdminSidebar"
import {
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"

const vendors = [
  {
    id: 1,
    name: "Aurora Textiles",
    appliedTime: "Aplicó hace 2 horas",
    image: "🏪",
    imageBg: "bg-primario-claro",
    owner: "Lucía Mendoza",
    docStatus: "TODO CARGADO",
    docStatusBg: "bg-exito text-white",
    hasWarning: false,
  },
  {
    id: 2,
    name: "Urban Denim Co.",
    appliedTime: "Aplicó hace 6 horas",
    image: "🏬",
    imageBg: "bg-advertencia-claro",
    owner: "Carlos Ruiz",
    docStatus: "RUC VENCIDO",
    docStatusBg: "bg-error text-white",
    hasWarning: true,
  },
  {
    id: 3,
    name: "Silk & Soul",
    appliedTime: "Aplicó hace 1 día",
    image: "🏪",
    imageBg: "bg-primario-claro",
    owner: "Elena Sotelo",
    docStatus: "REVISIÓN PENDIENTE",
    docStatusBg: "bg-advertencia text-white",
    hasWarning: true,
  },
  {
    id: 4,
    name: "Gamarra Pride",
    appliedTime: "Aplicó hace 1 día",
    image: "🏬",
    imageBg: "bg-info-claro",
    owner: "Jorge Quispe",
    docStatus: "TODO CARGADO",
    docStatusBg: "bg-exito text-white",
    hasWarning: false,
  },
]

export default function AdminAprobacionesPage() {
  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutro-900 mb-2">
            Aprobación de Vendedores
          </h1>
          <p className="text-neutro-600 font-medium max-w-2xl">
            Revise y verifique los nuevos comerciantes textiles que se unen a Gamarra360. 
            Asegúrese de que toda la documentación legal cumpla con los estándares premium del centro.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              APROBACIONES PENDIENTES
            </p>
            <p className="text-4xl font-black text-neutro-900">24</p>
          </div>

          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              VERIFICADOS HOY
            </p>
            <p className="text-4xl font-black text-neutro-900 text-exito">18</p>
          </div>

          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border-l-4 border-l-primario border-y-neutro-100 border-r-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              DOCUMENTOS FALTANTES
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-neutro-900">06</p>
              <p className="text-sm text-error font-bold uppercase tracking-tight">
                Urgente
              </p>
            </div>
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-tarjeta shadow-tarjeta border border-neutro-100 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-neutro-100 bg-white">
            <h2 className="text-xl font-black text-neutro-900">Cola de Verificación</h2>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs font-black text-neutro-400 hover:text-primario transition-colors uppercase tracking-widest">
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
              <button className="flex items-center gap-2 text-xs font-black text-neutro-400 hover:text-primario transition-colors uppercase tracking-widest">
                <ArrowUpDown className="w-4 h-4" />
                Ordenar
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutro-100 bg-neutro-50/30">
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Nombre de Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Propietario
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Estado de Documentos
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutro-50">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-neutro-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${vendor.imageBg} flex items-center justify-center text-2xl shadow-sm border border-white`}>
                          {vendor.image}
                        </div>
                        <div>
                          <p className="font-bold text-primario">{vendor.name}</p>
                          <p className="text-[10px] text-neutro-400 font-black uppercase tracking-wider">{vendor.appliedTime}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutro-700 font-bold">{vendor.owner}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {vendor.hasWarning && (
                          <AlertTriangle className="w-4 h-4 text-advertencia animate-bounce" />
                        )}
                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm ${vendor.docStatusBg}`}>
                          {vendor.docStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="px-3 py-1.5 text-xs font-bold text-neutro-500 hover:text-neutro-800 hover:bg-neutro-100 rounded-lg transition-all">
                          Ver Docs
                        </button>
                        <button className="px-4 py-1.5 text-xs font-black text-error border border-error/20 rounded-lg hover:bg-error/5 transition-all uppercase tracking-tight">
                          Rechazar
                        </button>
                        <button className="px-4 py-1.5 text-xs font-black text-white bg-primario rounded-lg hover:bg-primario-hover shadow-primario transition-all uppercase tracking-tight">
                          Aprobar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between bg-neutro-50/30">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-wider">
              Mostrando 4 de 24 vendedores
            </p>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-neutro-200 transition-all">
                <ChevronLeft className="w-4 h-4 text-neutro-400" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-primario text-white text-xs font-black shadow-primario">
                1
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-neutro-200 text-xs font-bold text-neutro-600 transition-all">
                2
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-neutro-200 text-xs font-bold text-neutro-600 transition-all">
                3
              </button>
              <span className="px-2 text-neutro-300 font-black">...</span>
              <button className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-neutro-200 text-xs font-bold text-neutro-600 transition-all">
                20
              </button>
              <button className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-neutro-200 transition-all">
                <ChevronRight className="w-4 h-4 text-neutro-400" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

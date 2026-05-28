import { AdminSidebar } from "../../components/admin/AdminSidebar"
import {
  Search,
  Download,
  UserPlus,
  MoreVertical,
} from "lucide-react"

const users = [
  {
    id: 1,
    name: "Alejandro García",
    email: "alejandro.v@gamarra360.pe",
    avatar: "AG",
    avatarBg: "bg-exito text-white",
    role: "VENDEDOR",
    roleBg: "bg-primario-claro text-primario",
    lastActivity: "Hace 2 horas",
    location: "LIMA, PE • ESCRITORIO",
    status: "ACTIVO",
    statusBg: "bg-exito",
  },
  {
    id: 2,
    name: "María Elena Torres",
    email: "m.torres@corporativo.com",
    avatar: "MT",
    avatarBg: "bg-primario text-white",
    role: "ADMIN",
    roleBg: "bg-marino text-white",
    lastActivity: "Activo ahora",
    location: "CUSCO, PE • MÓVIL",
    status: "ACTIVO",
    statusBg: "bg-exito",
  },
  {
    id: 3,
    name: "Julián Mendoza",
    email: "julian.m@client.net",
    avatar: "JM",
    avatarBg: "bg-neutro-800 text-white",
    role: "CLIENTE",
    roleBg: "bg-advertencia-claro text-advertencia",
    lastActivity: "Hace 4 días",
    location: "AREQUIPA, PE • TABLET",
    status: "INACTIVO",
    statusBg: "bg-advertencia",
  },
  {
    id: 4,
    name: "Ricardo Vélez",
    email: "velez.ricardo@shop.pe",
    avatar: "RV",
    avatarBg: "bg-info text-white",
    role: "VENDEDOR",
    roleBg: "bg-primario-claro text-primario",
    lastActivity: "Ayer, 4:15 PM",
    location: "LIMA, PE • ESCRITORIO",
    status: "ACTIVO",
    statusBg: "bg-exito",
  },
]

export default function AdminUsuariosPage() {
  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-neutro-900 mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-neutro-600 font-medium">
              Administra y audita el ecosistema de comerciantes y clientes de Gamarra360.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-neutro-200 bg-white rounded-xl text-neutro-600 hover:bg-neutro-50 transition-colors font-bold text-sm">
              <Download className="w-4 h-4" />
              <span>Exportar Datos</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primario text-white rounded-xl hover:bg-primario-hover transition-colors font-bold text-sm shadow-primario">
              <UserPlus className="w-4 h-4" />
              <span>Registrar Usuario</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              TOTAL DE USUARIOS
            </p>
            <p className="text-4xl font-black text-neutro-900">12,482</p>
          </div>

          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              VENDEDORES ACTIVOS
            </p>
            <p className="text-4xl font-black text-neutro-900">843</p>
          </div>

          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              NUEVOS REGISTROS
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-neutro-900">42</p>
              <p className="text-sm text-primario font-bold flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-primario rounded-full animate-pulse" />
                18 pendientes
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-tarjeta shadow-tarjeta border border-neutro-100 mb-6 overflow-hidden">
          <div className="p-4 border-b border-neutro-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutro-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o ID..."
                className="w-full pl-10 pr-4 py-2 text-neutro-700 placeholder-neutro-400 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 flex items-center justify-between bg-neutro-50/50">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-neutro-400 uppercase tracking-wider">Filtrar por:</span>
              <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 bg-white border border-neutro-200 rounded-lg text-xs font-bold text-neutro-700 hover:border-primario transition-colors">
                  Roles
                </button>
                <button className="px-4 py-1.5 bg-white border border-neutro-200 rounded-lg text-xs font-bold text-neutro-700 hover:border-primario transition-colors">
                  Estados
                </button>
              </div>
            </div>
            <button className="text-primario text-xs font-black hover:underline uppercase tracking-tight">
              Limpiar Filtros
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutro-100 bg-neutro-50/30">
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Identidad del Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Última Actividad
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutro-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutro-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${user.avatarBg} flex items-center justify-center text-sm font-black border-2 border-white shadow-sm`}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-neutro-900">{user.name}</p>
                          <p className="text-sm text-neutro-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${user.roleBg}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutro-900 font-bold">{user.lastActivity}</p>
                      <p className="text-xs text-neutro-400 font-medium">{user.location}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm ${user.statusBg}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-neutro-100 rounded-lg text-neutro-400 hover:text-neutro-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="px-6 py-4 text-xs font-bold text-neutro-400 uppercase tracking-wider bg-neutro-50/30">
            Mostrando 1 - 10 de 12,482 usuarios
          </div>
        </div>
      </main>
    </div>
  )
}

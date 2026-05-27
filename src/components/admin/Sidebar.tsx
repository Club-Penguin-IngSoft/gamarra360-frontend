import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Bell,
  LogOut,
} from "lucide-react"
import LogoGamarra from "../LogoGamarra"
import { useAuth } from "../../hooks/useAuth"
import { RUTAS } from "../../constants/rutas"

const navItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users },
  { href: "/admin/aprobaciones", label: "Aprobación de Comerciantes", icon: CheckSquare },
  { href: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
]

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { cerrarSesion } = useAuth()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-neutro-200 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-neutro-100">
        <Link to="/" className="flex items-center justify-center">
          <LogoGamarra size="md" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-primario text-white shadow-primario"
                  : "text-neutro-600 hover:bg-neutro-100"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-neutro-500"}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutro-100 bg-neutro-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-primario-claro flex items-center justify-center border border-primario/10">
            <span className="text-primario text-sm font-black">DF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-neutro-900">Diego Fiestas</span>
            <span className="text-xs text-neutro-500 font-medium">Administrador</span>
          </div>
        </div>
        <button 
          onClick={cerrarSesion}
          className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

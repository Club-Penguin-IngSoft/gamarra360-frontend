import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Bell,
  LogOut,
  Menu,
  X,
  Settings,
  BookOpen,
  BarChart3,
} from "lucide-react"
import { useState } from "react"
import LogoGamarra from "../LogoGamarra"
import { useAuth } from "../../hooks/useAuth"

const navItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users },
  { href: "/admin/aprobaciones", label: "Aprobación de Comerciantes", icon: CheckSquare },
  { href: "/admin/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  { href: "/admin/reclamos", label: "Libro de Reclamaciones", icon: BookOpen },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
]

export function AdminSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { cerrarSesion } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl bg-primario text-white shadow-lg lg:hidden"
      aria-label="Abrir menú de administración"
    >
      <Menu className="h-5 w-5" />
    </button>
    {mobileOpen && (
      <button
        type="button"
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        aria-label="Cerrar menú"
      />
    )}
    <aside className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-[min(18rem,85vw)] flex-shrink-0 flex-col border-r border-neutro-200 bg-white transition-transform lg:static lg:w-64 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <button
        type="button"
        onClick={() => setMobileOpen(false)}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-neutro-600 hover:bg-neutro-100 lg:hidden"
        aria-label="Cerrar menú de administración"
      >
        <X className="h-5 w-5" />
      </button>
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
              onClick={() => setMobileOpen(false)}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-neutro-50"}`} />
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
    </>
  )
}

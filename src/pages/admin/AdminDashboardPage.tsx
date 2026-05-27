import MaterialIcon from '../../components/MaterialIcon';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboardPage() {
  const { usuario } = useAuth();

  const stats = [
    { label: 'Usuarios Totales', value: '1,284', icon: 'people', color: 'bg-blue-500' },
    { label: 'Tiendas Activas', value: '156', icon: 'store', color: 'bg-primario' },
    { label: 'Pedidos Hoy', value: '42', icon: 'shopping_cart', color: 'bg-green-500' },
    { label: 'Personalizaciones', value: '12', icon: 'auto_fix_high', color: 'bg-yellow-500' },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col bg-gray-100">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutro-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-neutro-900">Resumen del Sistema</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-neutro-500 hover:bg-neutro-100 rounded-full transition-colors relative">
              <MaterialIcon name="notifications" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primario rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-neutro-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-neutro-900">{usuario?.nombre} {usuario?.apellido}</p>
                <p className="text-xs text-neutro-500 capitalize">{usuario?.rol.toLowerCase()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primario-claro flex items-center justify-center text-primario font-bold">
                {usuario?.nombre.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-tarjeta shadow-tarjeta border border-neutro-100 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  <MaterialIcon name={stat.icon} />
                </div>
                <div>
                  <p className="text-sm text-neutro-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-black text-neutro-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table Placeholder */}
          <div className="bg-white rounded-tarjeta shadow-tarjeta border border-neutro-100 overflow-hidden">
            <div className="p-6 border-b border-neutro-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutro-900">Últimas Solicitudes de Personalización</h2>
              <button className="text-sm font-bold text-primario hover:underline">Ver todas</button>
            </div>
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutro-50 rounded-full flex items-center justify-center mx-auto mb-4 text-neutro-300">
                <MaterialIcon name="assignment" style={{ fontSize: '32px' }} />
              </div>
              <p className="text-neutro-500 font-medium">No hay solicitudes recientes que mostrar.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

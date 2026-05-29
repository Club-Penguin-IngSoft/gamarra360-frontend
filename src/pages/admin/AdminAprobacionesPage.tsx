import { useEffect, useState } from 'react';
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from '../../services/apiClient';

interface Solicitud {
  comercianteId: number;
  ruc: string;
  razonSocial: string;
  nombreTienda: string | null;
  emailContacto: string;
}

export default function AdminAprobacionesPage() {
  const [vendors, setVendors]       = useState<Solicitud[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(false);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = async (p = 0) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/vendedores/pendientes', {
        params: { page: p, size: 10 }
      });
      setVendors(res.data.content);
      setTotal(res.data.totalElements);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(0); }, []);

  const handleAprobar = async (id: number) => {
    setProcesando(id);
    try {
      await apiClient.post(`/admin/vendedores/${id}/aprobar`, {});
      cargar(page);
    } catch (e: any) {
      alert(e.response?.data?.mensaje || 'Error al aprobar');
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (id: number) => {
    const razon = prompt('Motivo del rechazo:');
    if (!razon?.trim()) return;
    setProcesando(id);
    try {
      await apiClient.post(`/admin/vendedores/${id}/rechazar`, { razon });
      cargar(page);
    } catch (e: any) {
      alert(e.response?.data?.mensaje || 'Error al rechazar');
    } finally {
      setProcesando(null);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="flex min-h-screen bg-neutro-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutro-900 mb-2">Aprobación de Vendedores</h1>
          <p className="text-neutro-600 font-medium max-w-2xl">
            Revise y verifique los nuevos comerciantes textiles que se unen a Gamarra360.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border border-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              APROBACIONES PENDIENTES
            </p>
            <p className="text-4xl font-black text-neutro-900">{total}</p>
          </div>
          <div className="bg-white rounded-tarjeta p-6 shadow-tarjeta border-l-4 border-l-primario border-y-neutro-100 border-r-neutro-100">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-widest mb-1">
              EN ESTA PÁGINA
            </p>
            <p className="text-4xl font-black text-neutro-900">{vendors.length}</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-tarjeta shadow-tarjeta border border-neutro-100 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-neutro-100 bg-white">
            <h2 className="text-xl font-black text-neutro-900">Cola de Verificación</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutro-100 bg-neutro-50/30">
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Razón Social
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    RUC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Email de Contacto
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-neutro-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutro-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-neutro-400 font-medium">
                      Cargando solicitudes...
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-neutro-400 font-medium">
                      No hay solicitudes pendientes
                    </td>
                  </tr>
                ) : vendors.map((v) => (
                  <tr key={v.comercianteId} className="hover:bg-neutro-50/50 transition-colors">

                    {/* Empresa = nombreTienda */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primario-claro flex items-center justify-center text-2xl shadow-sm border border-white">
                          🏪
                        </div>
                        <p className="font-bold text-primario">{v.nombreTienda || '—'}</p>
                      </div>
                    </td>

                    {/* Razón Social */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutro-700 font-medium">{v.razonSocial}</p>
                    </td>

                    {/* RUC */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutro-700 font-bold">{v.ruc}</p>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutro-700">{v.emailContacto}</p>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRechazar(v.comercianteId)}
                          disabled={procesando === v.comercianteId}
                          className="px-4 py-1.5 text-xs font-black text-error border border-error/20 rounded-lg hover:bg-error/5 transition-all uppercase tracking-tight disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleAprobar(v.comercianteId)}
                          disabled={procesando === v.comercianteId}
                          className="px-4 py-1.5 text-xs font-black text-white bg-primario rounded-lg hover:bg-primario-hover shadow-primario transition-all uppercase tracking-tight disabled:opacity-50"
                        >
                          {procesando === v.comercianteId ? '...' : 'Aprobar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-6 py-4 flex items-center justify-between bg-neutro-50/30">
            <p className="text-xs font-bold text-neutro-400 uppercase tracking-wider">
              Mostrando {vendors.length} de {total} solicitudes
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => cargar(page - 1)}
                disabled={page === 0}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-neutro-200 transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-neutro-400" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + Math.max(0, page - 2)).map(p => (
                <button
                  key={p}
                  onClick={() => cargar(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    p === page
                      ? 'bg-primario text-white shadow-primario'
                      : 'hover:bg-white border border-transparent hover:border-neutro-200 text-neutro-600'
                  }`}
                >
                  {p + 1}
                </button>
              ))}

              <button
                onClick={() => cargar(page + 1)}
                disabled={page + 1 >= totalPages}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-neutro-200 transition-all disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-neutro-400" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
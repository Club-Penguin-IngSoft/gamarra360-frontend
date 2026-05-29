import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import { RUTAS } from '../../constants/rutas';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/apiClient';
import { eliminarProducto } from '../../services/catalogoService';
import { obtenerMiTienda } from '../../services/tiendaService';

interface IProductoBackend {
  idProducto: number;
  nombre: string;
  precioBase?: number;
  activo: boolean;
  nombreCategoria?: string;
  nombreTipoProducto?: string;
  imagenes: { url: string; esPrincipal: boolean }[] | null;
  variantes: { stock?: number }[] | null;
}

interface IProductoFila {
  idProducto: number;
  nombre: string;
  categoria: string;
  precioBase: number;
  unidades: number;
  ganancias: number;
  estado: 'PUBLICADO' | 'AGOTADO' | 'SIN_PUBLICAR' | 'POCA_EXISTENCIA';
  imagenUrl?: string;
}

const STOCK_MINIMO = 5;

function computarEstado(activo: boolean, stock: number): IProductoFila['estado'] {
  if (!activo) return 'SIN_PUBLICAR';
  if (stock === 0) return 'AGOTADO';
  if (stock <= STOCK_MINIMO) return 'POCA_EXISTENCIA';
  return 'PUBLICADO';
}

function adaptarFila(p: IProductoBackend): IProductoFila {
  const totalStock = (p.variantes ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
  const principal = (p.imagenes ?? []).find((i) => i.esPrincipal) ?? p.imagenes?.[0];
  return {
    idProducto: p.idProducto,
    nombre: p.nombre,
    categoria: p.nombreTipoProducto ?? p.nombreCategoria ?? '—',
    precioBase: p.precioBase ?? 0,
    unidades: totalStock,
    ganancias: (p.precioBase ?? 0) * totalStock,
    estado: computarEstado(p.activo, totalStock),
    imagenUrl: principal?.url,
  };
}

const estadoLabel: Record<string, string> = {
  PUBLICADO: 'Publicado',
  AGOTADO: 'Agotado',
  SIN_PUBLICAR: 'Sin publicar',
  POCA_EXISTENCIA: 'Poca existencia',
};

const estadoBadgeClasses: Record<string, string> = {
  PUBLICADO: 'bg-[#D1FAE5] text-[#059669]',
  AGOTADO: 'bg-[#FEE2E2] text-[#DC2626]',
  SIN_PUBLICAR: 'bg-gray-200 text-gray-600',
  POCA_EXISTENCIA: 'bg-[#FEF3C7] text-[#D97706]',
};

const PAGE_SIZE = 10;

export default function GestionInventarioPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [productos, setProductos] = useState<IProductoFila[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pagina, setPagina] = useState(1);

  const cargarProductos = () => {
    if (!usuario) return;
    setCargando(true);
    obtenerMiTienda()
      .then(({ idTienda }) =>
        apiClient.get<any>(`/productos/tienda/${idTienda}`)
      )
      .then(({ data }) => {
        const lista: IProductoBackend[] = Array.isArray(data) ? data : (data.contenido ?? []);
        setProductos(lista.map(adaptarFila));
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarProductos();
  }, [usuario?.id]);

  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter((c) => c !== '—'))].sort(),
    [productos],
  );

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria;
      const coincideEstado = !filtroEstado || p.estado === filtroEstado;
      return coincideBusqueda && coincideCategoria && coincideEstado;
    });
  }, [productos, busqueda, filtroCategoria, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginados = filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      total: productos.length,
      pocaExistencia: productos.filter((p) => p.estado === 'POCA_EXISTENCIA').length,
      agotados: productos.filter((p) => p.estado === 'AGOTADO').length,
      publicados: productos.filter((p) => p.estado === 'PUBLICADO').length,
    }),
    [productos],
  );

  const handleEliminar = async (idProducto: number) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await eliminarProducto(String(idProducto));
      setProductos((prev) => prev.filter((p) => p.idProducto !== idProducto));
    } catch {
      alert('No se pudo eliminar el producto.');
    }
  };

  const numeroPaginas = () => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= 1) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="ml-64 flex-1 bg-gray-100 p-7">
        <p className="text-[12px] text-gray-500 mb-2">
          Inicio &rsaquo; <span className="text-primario font-medium">Inventario</span>
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-bold text-gray-900">Gestión de Catálogo</h1>
          <button
            className="flex items-center gap-1.5 px-[18px] py-2.5 bg-primario text-white rounded-lg text-[13px] font-semibold hover:bg-primario-hover transition-colors"
            onClick={() => navigate(RUTAS.COMERCIANTE_NUEVO_PRODUCTO)}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-5">
          <div className="bg-white rounded-lg px-5 py-3.5 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded bg-primario-claro text-primario flex items-center justify-center">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <div>
              <div className="text-[22px] font-bold text-gray-900">{stats.total.toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Total</div>
            </div>
          </div>

          <div className="bg-white rounded-lg px-5 py-3.5 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <div className="text-[22px] font-bold text-gray-900">{stats.pocaExistencia}</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Poca existencia</div>
            </div>
          </div>

          <div className="bg-white rounded-lg px-5 py-3.5 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <div className="text-[22px] font-bold text-gray-900">{stats.agotados}</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Agotados</div>
            </div>
          </div>

          <div className="bg-white rounded-lg px-5 py-3.5 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div className="text-[22px] font-bold text-gray-900">{stats.publicados}</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-[0.4px]">Publicados</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="w-full h-10 border border-gray-300 rounded-lg pl-9 pr-3.5 text-[13px] text-gray-900 bg-white focus:border-primario focus:outline-none"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            />
          </div>

          <select
            className="h-10 border border-gray-300 rounded-lg px-3 text-[13px] text-gray-900 bg-white min-w-[150px] focus:border-primario focus:outline-none"
            value={filtroCategoria}
            onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1); }}
          >
            <option value="">Todas las Categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="h-10 border border-gray-300 rounded-lg px-3 text-[13px] text-gray-900 bg-white min-w-[150px] focus:border-primario focus:outline-none"
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}
          >
            <option value="">Estado: Todas</option>
            <option value="PUBLICADO">Publicado</option>
            <option value="AGOTADO">Agotado</option>
            <option value="POCA_EXISTENCIA">Poca existencia</option>
            <option value="SIN_PUBLICAR">Sin publicar</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
              Cargando productos...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-[13px] text-gray-400">
              {productos.length === 0 ? 'No tienes productos aún.' : 'Sin resultados para los filtros aplicados.'}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Producto', 'Categoría', 'Precio Base', 'Unidades', 'Ganancias', 'Estado', 'Acciones'].map((col) => (
                    <th
                      key={col}
                      className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.4px] px-4 py-3 bg-gray-100 border-b border-gray-200"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginados.map((p) => (
                  <tr key={p.idProducto} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      <div className="flex items-center gap-3">
                        {p.imagenUrl ? (
                          <img
                            src={p.imagenUrl}
                            alt={p.nombre}
                            className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-gray-200 flex-shrink-0" />
                        )}
                        <div>
                          <span className="block text-[13px] font-semibold text-gray-900 mb-0.5">{p.nombre}</span>
                          <span className="text-[11px] text-gray-500">{p.categoria}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      {p.categoria}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      S/ {p.precioBase.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      {p.unidades}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-gray-900 border-b border-gray-100 align-middle">
                      S/ {p.ganancias.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${estadoBadgeClasses[p.estado]}`}>
                        {estadoLabel[p.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded flex items-center justify-center bg-transparent border border-gray-200 text-gray-500 hover:bg-primario-claro hover:text-primario hover:border-primario transition-colors"
                          title="Editar"
                          onClick={() => navigate(RUTAS.COMERCIANTE_EDITAR_PRODUCTO(p.idProducto))}
                        >
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="w-8 h-8 rounded flex items-center justify-center bg-transparent border border-gray-200 text-gray-500 hover:bg-[#FEE2E2] hover:text-red-600 hover:border-red-500 transition-colors"
                          title="Eliminar"
                          onClick={() => handleEliminar(p.idProducto)}
                        >
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!cargando && filtrados.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-200">
              <span className="text-[12px] text-gray-500">
                Mostrando {(paginaActual - 1) * PAGE_SIZE + 1}–{Math.min(paginaActual * PAGE_SIZE, filtrados.length)} de {filtrados.length} productos
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPagina((p) => p - 1)}
                  className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ‹
                </button>
                {numeroPaginas().map((n) => (
                  <button
                    key={n}
                    onClick={() => setPagina(n)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border transition-colors ${
                      n === paginaActual
                        ? 'bg-primario text-white border-primario'
                        : 'text-gray-600 bg-transparent border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                  className="w-8 h-8 rounded flex items-center justify-center text-[13px] font-medium border border-gray-200 text-gray-600 bg-transparent hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

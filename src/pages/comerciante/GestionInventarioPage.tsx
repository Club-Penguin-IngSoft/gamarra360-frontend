import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './GestionInventarioPage.module.css';

interface IProductoFila {
  idProducto: number;
  nombre: string;
  categoria: string;
  sku: string;
  precioBase: number;
  unidades: number;
  ganancias: number;
  estado: 'PUBLICADO' | 'AGOTADO' | 'SIN_PUBLICAR' | 'POCA_EXISTENCIA';
}

const MOCK_PRODUCTOS: IProductoFila[] = [
  { idProducto: 1, nombre: 'Camisa Oxford Dominic', categoria: 'Camisas', sku: 'CAM-001', precioBase: 150, unidades: 84, ganancias: 12600, estado: 'PUBLICADO' },
  { idProducto: 2, nombre: 'Polo Oversize Blanco', categoria: 'Polos', sku: 'POL-002', precioBase: 74, unidades: 120, ganancias: 8880, estado: 'PUBLICADO' },
  { idProducto: 3, nombre: 'Pantalón Slim Fit Perry', categoria: 'Pantalones', sku: 'PAN-003', precioBase: 159, unidades: 3, ganancias: 477, estado: 'POCA_EXISTENCIA' },
  { idProducto: 4, nombre: 'Macilla Cuero Buesco', categoria: 'Accesorios', sku: 'ACC-004', precioBase: 243, unidades: 0, ganancias: 0, estado: 'AGOTADO' },
];

const estadoLabel: Record<string, string> = {
  PUBLICADO: 'Publicado',
  AGOTADO: 'Agotado',
  SIN_PUBLICAR: 'Sin publicar',
  POCA_EXISTENCIA: 'Poca existencia',
};

const estadoClass: Record<string, string> = {
  PUBLICADO: styles.publicado,
  AGOTADO: styles.agotado,
  SIN_PUBLICAR: styles.sinPublicar,
  POCA_EXISTENCIA: styles.pocaExistencia,
};

/* Pantalla: Gestión de Catálogo — listado y administración de productos del comerciante */
export default function GestionInventarioPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const navigate = useNavigate();

  const productosFiltrados = MOCK_PRODUCTOS.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !filtroCategoria || p.categoria === filtroCategoria;
    const coincideEstado = !filtroEstado || p.estado === filtroEstado;
    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <p className={styles.breadcrumb}>
          Inicio &rsaquo; <span>Inventario</span>
        </p>

        <div className={styles.header}>
          <h1>Gestión de Catálogo</h1>
          <button
            className={styles.btnNuevoProducto}
            onClick={() => navigate('/catalogo/nuevo')}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statChip}>
            <div className={`${styles.statChipIcon} ${styles.pink}`}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <div>
              <div className={styles.statChipValue}>1,284</div>
              <div className={styles.statChipLabel}>Total</div>
            </div>
          </div>

          <div className={styles.statChip}>
            <div className={`${styles.statChipIcon} ${styles.yellow}`}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <div className={styles.statChipValue}>12</div>
              <div className={styles.statChipLabel}>Poca existencia</div>
            </div>
          </div>

          <div className={styles.statChip}>
            <div className={`${styles.statChipIcon} ${styles.red}`}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <div className={styles.statChipValue}>24</div>
              <div className={styles.statChipLabel}>Agotados</div>
            </div>
          </div>

          <div className={styles.statChip}>
            <div className={`${styles.statChipIcon} ${styles.green}`}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div className={styles.statChipValue}>1,248</div>
              <div className={styles.statChipLabel}>Publicados</div>
            </div>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            <option value="Camisas">Camisas</option>
            <option value="Polos">Polos</option>
            <option value="Pantalones">Pantalones</option>
            <option value="Accesorios">Accesorios</option>
          </select>

          <select
            className={styles.filterSelect}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Estado: Todas</option>
            <option value="PUBLICADO">Publicado</option>
            <option value="AGOTADO">Agotado</option>
            <option value="POCA_EXISTENCIA">Poca existencia</option>
            <option value="SIN_PUBLICAR">Sin publicar</option>
          </select>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Base</th>
                <th>Unidades</th>
                <th>Ganancias</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.idProducto}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productThumb} />
                      <div>
                        <span className={styles.productName}>{p.nombre}</span>
                        <span className={styles.productMeta}>{p.categoria} · {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.categoria}</td>
                  <td>S/ {p.precioBase.toFixed(2)}</td>
                  <td>{p.unidades}</td>
                  <td>S/ {p.ganancias.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.badge} ${estadoClass[p.estado]}`}>
                      {estadoLabel[p.estado]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        title="Editar"
                        onClick={() => navigate(`/catalogo/${p.idProducto}/editar`)}
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className={`${styles.actionBtn} ${styles.delete}`} title="Eliminar">
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

          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Mostrando 1 – {productosFiltrados.length} de 1,284 productos
            </span>
            <div className={styles.paginationBtns}>
              <button className={styles.pageBtn}>‹</button>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn}>3</button>
              <button className={styles.pageBtn}>›</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

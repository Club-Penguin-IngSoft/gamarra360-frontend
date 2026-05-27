import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ReabastecimientoModal from '../components/ReabastecimientoModal';
import { RUTAS } from '../constants';
import styles from './DashboardPage.module.css';

const MOCK_PEDIDOS = [
  { id: 'A-1021', producto: 'Camisa Oxford Slim', sku: 'S / Negro', precio: 'S/ 320.00', estado: 'ENTREGADO' },
  { id: 'A-1022', producto: 'Polo Oversize Blanco', sku: 'M / Blanco', precio: 'S/ 85.00', estado: 'PENDIENTE' },
  { id: 'A-1023', producto: 'Pantalón Slim Fit', sku: 'L / Azul', precio: 'S/ 220.00', estado: 'EN_PROCESO' },
  { id: 'A-1024', producto: 'Macilla Cuero', sku: 'XL / Café', precio: 'S/ 490.00', estado: 'ENTREGADO' },
];

const MOCK_INVENTARIO_CRITICO = [
  { id: 1, nombre: 'San Isidro One Melon', desc: 'Talla M / Negro', stock: 3, sku: 'CAM-001' },
  { id: 2, nombre: 'San Isidro Palo Bliss', desc: 'Talla S / Blanco', stock: 2, sku: 'POL-002' },
];

const MOCK_VARIANTES = [
  { id: 1, variante: 'Talla M / Negro', sku: 'S/.N.N.N.AA', precioBase: 240.00, stock: 10, activo: true, colorHex: '#1a1a1a' },
  { id: 2, variante: 'Talla L / Blanco', sku: 'S/.N.N.N.BB', precioBase: 240.00, stock: 12, activo: true, colorHex: '#f5f5f5' },
];

const CHART_DATA = [
  { dia: 'Lun', valor: 55 },
  { dia: 'Mar', valor: 75 },
  { dia: 'Mié', valor: 45 },
  { dia: 'Jue', valor: 90 },
  { dia: 'Vie', valor: 65 },
  { dia: 'Sáb', valor: 110 },
  { dia: 'Dom', valor: 40 },
];

const maxValorChart = Math.max(...CHART_DATA.map((d) => d.valor));

const estadoBadgeClass: Record<string, string> = {
  ENTREGADO: styles.entregado,
  PENDIENTE: styles.pendiente,
  EN_PROCESO: styles.enProceso,
  CANCELADO: styles.cancelado,
};

const estadoLabel: Record<string, string> = {
  ENTREGADO: 'Entregado',
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  CANCELADO: 'Cancelado',
};

/* Pantalla: Panel de Control — resumen de actividad del comerciante */
export default function DashboardPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoModal, setProductoModal] = useState('');

  const navigate = useNavigate();

  const handleAbrirModal = (nombre: string) => {
    setProductoModal(nombre);
    setModalAbierto(true);
  };

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerTexts}>
            <h1>Panel de Control</h1>
            <p>Bienvenido de vuelta, Nombre Apellido S.A.C.</p>
          </div>
          <button
            className={styles.btnPublicar}
            onClick={() => navigate(RUTAS.CATALOGO)}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Publicar Productos
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <label>Ventas Totales</label>
              <span className={styles.statValue}>S/ 12,450</span>
            </div>
            <div className={`${styles.statIcon} ${styles.pink}`}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <label>Pedidos Pendientes</label>
              <span className={styles.statValue}>8</span>
            </div>
            <div className={`${styles.statIcon} ${styles.orange}`}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <label>En/De Stock</label>
              <span className={styles.statValue}>3</span>
            </div>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.midRow}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Venta Semanal</span>
              <div className={styles.chartFilter}>
                <select className={styles.chartSelect}>
                  <option>Semana</option>
                  <option>Mes</option>
                </select>
              </div>
            </div>
            <div className={styles.chartBars}>
              {CHART_DATA.map((d, i) => (
                <div
                  key={d.dia}
                  className={`${styles.bar} ${i === 5 ? styles.barActive : ''}`}
                  style={{ height: `${(d.valor / maxValorChart) * 100}%` }}
                  title={`S/ ${d.valor}`}
                />
              ))}
            </div>
            <div className={styles.chartLabels}>
              {CHART_DATA.map((d) => (
                <span key={d.dia} className={styles.chartLabel}>{d.dia}</span>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Pedidos Recientes</span>
              <span className={styles.cardLink} onClick={() => navigate(RUTAS.PEDIDOS)}>
                Ver todos
              </span>
            </div>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PEDIDOS.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.orderProduct}>
                        <div className={styles.orderThumb} />
                        <div>
                          <span className={styles.orderName}>{p.producto}</span>
                          <span className={styles.orderSku}>{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.precio}</td>
                    <td>
                      <span className={`${styles.badge} ${estadoBadgeClass[p.estado]}`}>
                        {estadoLabel[p.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card} style={{ marginBottom: 0 }}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Acciones de Inventario Crítico</span>
          </div>
          <div className={styles.inventoryRow}>
            {MOCK_INVENTARIO_CRITICO.map((item) => (
              <div key={item.id} className={styles.inventoryCard}>
                <div className={styles.inventoryThumb} />
                <div className={styles.inventoryInfo}>
                  <p className={styles.inventoryName}>{item.nombre}</p>
                  <p className={styles.inventoryStock}>{item.desc} — Solo {item.stock} unidades</p>
                  <button
                    className={styles.btnReabastecer}
                    onClick={() => handleAbrirModal(item.nombre)}
                  >
                    Reabastecer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalAbierto && (
        <ReabastecimientoModal
          nombreProducto={productoModal}
          variantes={MOCK_VARIANTES}
          onCerrar={() => setModalAbierto(false)}
          onConfirmar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './EditarProductoPage.module.css';

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

interface IVarianteEditable {
  id: number;
  variante: string;
  sku: string;
  precioBase: number;
  stock: number;
  activo: boolean;
  colorHex: string;
}

const MOCK_VARIANTES: IVarianteEditable[] = [
  { id: 1, variante: 'Talla M / Negro', sku: 'BLZ-001-M-N', precioBase: 249.90, stock: 40, activo: true, colorHex: '#1a1a1a' },
  { id: 2, variante: 'Talla S / Blanco', sku: 'BLZ-001-S-B', precioBase: 249.90, stock: 62, activo: true, colorHex: '#f5f5f5' },
  { id: 3, variante: 'Talla L / Blanco', sku: 'BLZ-001-L-B', precioBase: 249.90, stock: 55, activo: false, colorHex: '#f5f5f5' },
];

/* Pantalla: Editar Producto — modificación de detalles, precio, stock y variantes */
export default function EditarProductoPage() {
  const [nombreProducto, setNombreProducto] = useState('Blazer Cotton');
  const [descripcion, setDescripcion] = useState(
    'Blazer de corte confeccionado en mezcla de lino Milano. Corte slim fit contemporáneo con bolsillos de chaleco y solapa enrollada en cada extremo. Una línea recta y libre.'
  );
  const [skuInterno, setSkuInterno] = useState('BLZ-001-GEN');
  const [lasTienes, setLasTienes] = useState('Negro, Blanco');
  const [precioBase] = useState(249.90);
  const [totalStock] = useState(157);
  const [publicado, setPublicado] = useState(true);
  const [tieneVariantes, setTieneVariantes] = useState(true);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>(['M', 'S', 'L']);
  const [variantes, setVariantes] = useState<IVarianteEditable[]>(MOCK_VARIANTES);

  const navigate = useNavigate();

  const toggleTalla = (talla: string) => {
    setTallasSeleccionadas((prev) =>
      prev.includes(talla) ? prev.filter((t) => t !== talla) : [...prev, talla]
    );
  };

  const toggleVariante = (id: number) => {
    setVariantes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, activo: !v.activo } : v))
    );
  };

  const handleGuardar = () => {
    // TODO: integrar catalogoService.actualizarProducto() - Kevin
  };

  const handleEliminar = () => {
    // TODO: integrar catalogoService.eliminarProducto() - Kevin
  };

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <p className={styles.breadcrumb}>
          <span onClick={() => navigate('/dashboard')}>Inicio</span>
          {' '}›{' '}
          <span onClick={() => navigate('/catalogo')}>Inventario</span>
        </p>

        <h1 className={styles.pageTitle}>Editar Producto</h1>

        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Detalles del Producto</p>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre del Producto</label>
              <input
                type="text"
                className={styles.formInput}
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Descripción Editorial</label>
              <textarea
                className={styles.formTextarea}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formRow}`}>
              <div>
                <label className={styles.formLabel}>Las Tienes</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={lasTienes}
                  onChange={(e) => setLasTienes(e.target.value)}
                  placeholder="Colores disponibles"
                />
              </div>
              <div>
                <label className={styles.formLabel}>SKU Interno</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={skuInterno}
                  onChange={(e) => setSkuInterno(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Imágenes del Producto</label>
              <div className={styles.imagesGrid}>
                <div className={styles.imageCard}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #d4cfc8 0%, #b8b0a6 100%)' }} />
                </div>
                <div className={styles.imageCard}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #c8c3bc 0%, #a8a09a 100%)' }} />
                </div>
                <div className={styles.imageAddBtn}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Agregar
                </div>
              </div>
            </div>

            <div className={styles.publishRow}>
              <div>
                <p className={styles.publishLabel}>Visibilidad</p>
                <p className={styles.publishSub}>El producto es visible en la tienda</p>
              </div>
              <button
                className={`${styles.toggle} ${publicado ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => setPublicado((prev) => !prev)}
              />
            </div>
          </div>

          <div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Tarjeta del Vendedor</p>

              <div className={styles.priceDisplay}>
                <p className={styles.priceLabel}>Precio Base</p>
                <p className={styles.priceValue}>S/ {precioBase.toFixed(2)}</p>
              </div>

              <div className={styles.stockDisplay}>
                <p className={styles.stockLabel}>Total Stock</p>
                <div>
                  <p className={styles.stockValue}>{totalStock}</p>
                  <span className={styles.stockUnit}>unidades</span>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Publicado</span>
                <button
                  className={`${styles.toggle} ${publicado ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => setPublicado((prev) => !prev)}
                />
              </div>

              <button className={styles.btnGuardar} onClick={handleGuardar}>
                Guardar Cambios
              </button>
              <button className={styles.btnEliminar} onClick={handleEliminar}>
                Eliminar Producto
              </button>
            </div>
          </div>
        </div>

        <div className={styles.variantesCard}>
          <div className={styles.variantesHeader}>
            <p className={styles.variantesTitle}>Gestión de Variantes</p>
            <div className={styles.variantesToggleRow}>
              <span>Este producto tiene variantes</span>
              <button
                className={`${styles.toggle} ${tieneVariantes ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => setTieneVariantes((prev) => !prev)}
              />
            </div>
          </div>

          {tieneVariantes && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tallas</label>
                <div className={styles.sizesRow}>
                  {TALLAS.map((t) => (
                    <button
                      key={t}
                      className={`${styles.sizeChip} ${tallasSeleccionadas.includes(t) ? styles.selected : ''}`}
                      onClick={() => toggleTalla(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <table className={styles.variantTable}>
                <thead>
                  <tr>
                    <th>Las Variantes</th>
                    <th>SKU</th>
                    <th>Precio Base</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {variantes.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div className={styles.variantCell}>
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: v.colorHex }}
                          />
                          {v.variante}
                        </div>
                      </td>
                      <td>{v.sku}</td>
                      <td>
                        <input
                          type="number"
                          className={styles.variantInput}
                          defaultValue={v.precioBase}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className={styles.variantInput}
                          defaultValue={v.stock}
                        />
                      </td>
                      <td>
                        <button
                          className={`${styles.toggle} ${v.activo ? styles.toggleOn : styles.toggleOff}`}
                          onClick={() => toggleVariante(v.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

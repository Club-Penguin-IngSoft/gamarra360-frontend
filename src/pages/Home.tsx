import React, { useEffect, useState } from 'react';
import { getProductos } from '../api/api';
import { Package, ShoppingBag, MessageSquare } from 'lucide-react';

interface Producto {
  id_producto?: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

const Home: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductos();
        setProductos(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#2563eb' }}>Gamarra360</h1>
        <p>Tu plataforma de personalización y cotizaciones</p>
      </header>

      <section style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={cardStyle}>
          <ShoppingBag size={48} color="#2563eb" />
          <h3>Tienda</h3>
          <p>Explora nuestro catálogo</p>
        </div>
        <div style={cardStyle}>
          <Package size={48} color="#2563eb" />
          <h3>Personalizaciones</h3>
          <p>Crea tu propio estilo</p>
        </div>
        <div style={cardStyle}>
          <MessageSquare size={48} color="#2563eb" />
          <h3>Cotizaciones</h3>
          <p>Pide un presupuesto</p>
        </div>
      </section>

      <section>
        <h2>Productos Destacados</h2>
        {loading ? (
          <p>Cargando productos...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>No se pudo conectar con el servidor. ¿Está el backend encendido?</p>
        ) : productos.length === 0 ? (
          <p>No hay productos disponibles por el momento.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {productos.map((prod, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <h4>{prod.nombre}</h4>
                <p>{prod.descripcion}</p>
                <p><strong>S/ {prod.precio}</strong></p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  padding: '20px',
  borderRadius: '12px',
  textAlign: 'center',
  width: '200px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default Home;

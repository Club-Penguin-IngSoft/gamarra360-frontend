import type { ILoginResponse } from '../types/IAuth';
import type { IClientePerfil } from '../services/clienteService';
import type { IPedido } from '../types/IPedido';

export const MOCK_EMAIL = 'cliente@gmail.com';
export const MOCK_PASSWORD = '#Cliente123';
export const MOCK_USUARIO_ID = '999999';

// Token con prefijo "mock." para que apiClient lo omita en el header Authorization.
// Los 3 segmentos base64 permiten que atob() no falle si TopBar intenta decodificarlo.
export const MOCK_LOGIN_RESPONSE: ILoginResponse = {
  token:
    'mock.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbGllbnRlQGdtYWlsLmNvbSIsInVzdWFyaW9JZCI6OTk5OTk5LCJyb2wiOiJDTElFTlRFIn0.MOCK_SIGNATURE_NOT_VALID',
  tipo: 'Bearer',
  usuarioId: 999999,
  email: MOCK_EMAIL,
  nombres: 'Juan Pérez López',
  rol: 'CLIENTE',
  needsRegistration: false,
};

export const MOCK_PERFIL: IClientePerfil = {
  usuarioId: 999999,
  nombre: 'Juan',
  apellido: 'Pérez López',
  direccion: 'Av. Arequipa 3421, San Isidro, Lima, Lima',
};

export const MOCK_PEDIDOS: IPedido[] = [
  {
    id: 'PED-20260524-000128',
    numeroPedido: 'PED-20260524-000128',
    idCliente: MOCK_USUARIO_ID,
    idComerciante: 'tienda-001',
    nombreComercio: 'Estilo Killa',
    estado: 'EN_PROCESO',
    tipoEntrega: 'ENVIO_DOMICILIO',
    total: 480.0,
    fechaCreacion: '2026-05-24T10:30:00',
    detalles: [
      {
        id: 'det-001',
        idProducto: 'prod-001',
        tituloProducto: 'Blusa Oxford Azul',
        cantidad: 2,
        precioUnitario: 240.0,
        imagenUrl: 'https://picsum.photos/seed/blusa-oxford/300/400',
      },
    ],
  },
  {
    id: 'PED-20260524-000129',
    numeroPedido: 'PED-20260524-000129',
    idCliente: MOCK_USUARIO_ID,
    idComerciante: 'tienda-002',
    nombreComercio: 'Textiles del Sur',
    estado: 'RECIBIDO',
    tipoEntrega: 'RECOJO_TIENDA',
    total: 363.8,
    fechaCreacion: '2026-05-24T09:15:00',
    detalles: [
      {
        id: 'det-002',
        idProducto: 'prod-002',
        tituloProducto: 'Chaqueta Cuero Negro',
        cantidad: 1,
        precioUnitario: 210.0,
        imagenUrl: 'https://picsum.photos/seed/chaqueta-negro/300/400',
      },
      {
        id: 'det-003',
        idProducto: 'prod-003',
        tituloProducto: 'Chaqueta Cuero Marrón',
        cantidad: 1,
        precioUnitario: 153.8,
        imagenUrl: 'https://picsum.photos/seed/chaqueta-marron/300/400',
      },
    ],
  },
  {
    id: 'PED-20260520-000150',
    numeroPedido: 'PED-20260520-000150',
    idCliente: MOCK_USUARIO_ID,
    idComerciante: 'tienda-003',
    nombreComercio: 'Urban Chic',
    estado: 'ENVIADO',
    tipoEntrega: 'ENVIO_DOMICILIO',
    total: 43.2,
    fechaCreacion: '2026-05-20T14:00:00',
    detalles: [
      {
        id: 'det-004',
        idProducto: 'prod-004',
        tituloProducto: 'Blusa Casual Terracota',
        cantidad: 1,
        precioUnitario: 43.2,
        imagenUrl: 'https://picsum.photos/seed/blusa-terracota/300/400',
      },
    ],
  },
  {
    id: 'PED-20260516-001016',
    numeroPedido: 'PED-20260516-001016',
    idCliente: MOCK_USUARIO_ID,
    idComerciante: 'tienda-001',
    nombreComercio: 'Estilo Killa',
    estado: 'LISTO_ENTREGA',
    tipoEntrega: 'RECOJO_TIENDA',
    total: 125.0,
    fechaCreacion: '2026-05-16T11:30:00',
    detalles: [
      {
        id: 'det-005',
        idProducto: 'prod-005',
        tituloProducto: 'Vestido Floral Verano',
        cantidad: 1,
        precioUnitario: 65.0,
        imagenUrl: 'https://picsum.photos/seed/vestido-floral/300/400',
      },
      {
        id: 'det-006',
        idProducto: 'prod-006',
        tituloProducto: 'Falda Midi Negra',
        cantidad: 1,
        precioUnitario: 60.0,
        imagenUrl: 'https://picsum.photos/seed/falda-negra/300/400',
      },
    ],
  },
  {
    id: 'PED-20260415-000102',
    numeroPedido: 'PED-20260415-000102',
    idCliente: MOCK_USUARIO_ID,
    idComerciante: 'tienda-004',
    nombreComercio: 'Moda Plus',
    estado: 'ENTREGADO',
    tipoEntrega: 'ENVIO_DOMICILIO',
    total: 149.9,
    fechaCreacion: '2026-04-15T09:00:00',
    detalles: [
      {
        id: 'det-007',
        idProducto: 'prod-007',
        tituloProducto: 'Pantalón Slim Fit',
        cantidad: 1,
        precioUnitario: 75.0,
        imagenUrl: 'https://picsum.photos/seed/pantalon-slim/300/400',
      },
      {
        id: 'det-008',
        idProducto: 'prod-008',
        tituloProducto: 'Polo Oversize Verde',
        cantidad: 1,
        precioUnitario: 74.9,
        imagenUrl: 'https://picsum.photos/seed/polo-verde/300/400',
      },
    ],
  },
  {
    id: 'PED-20260404-000098',
    numeroPedido: 'PED-20260404-000098',
    idCliente: MOCK_USUARIO_ID,
    idComerciante: 'tienda-005',
    nombreComercio: 'Fashion Trends',
    estado: 'CANCELADO',
    tipoEntrega: 'RECOJO_TIENDA',
    total: 75.7,
    fechaCreacion: '2026-04-04T16:20:00',
    detalles: [
      {
        id: 'det-009',
        idProducto: 'prod-009',
        tituloProducto: 'Chaleco Ejecutivo Gris',
        cantidad: 1,
        precioUnitario: 75.7,
        imagenUrl: 'https://picsum.photos/seed/chaleco-gris/300/400',
      },
    ],
  },
];

import apiClient from './apiClient';

export interface IReporteVentas {
  totalVentas: number; pedidos: number; cancelados: number; devoluciones: number;
  detalle: { pedidoId: number; fecha: string; estado: string; tipoEntrega: string; total: number }[];
}
export interface IReporteInventario {
  unidades: number; stockBajo: number;
  detalle: { productoId: number; varianteId: number; producto: string; sku: string; talla: string|null; color: string|null; material: string|null; calidad: string|null; stock: number; stockMinimo: number; activo: boolean }[];
}
export interface IReporteAdmin { ventasBrutas: number; comisiones: number; devoluciones: number; pedidosPagados: number; pedidosCancelados: number }

export const reporteService = {
  ventas: async (desde: string, hasta: string) => (await apiClient.get<IReporteVentas>('/reportes/vendedor/ventas', { params: { desde, hasta } })).data,
  inventario: async () => (await apiClient.get<IReporteInventario>('/reportes/vendedor/inventario')).data,
  admin: async (desde: string, hasta: string) => (await apiClient.get<IReporteAdmin>('/reportes/admin', { params: { desde, hasta } })).data,
};

// src/services/pagoService.ts
import apiClient from './apiClient';

interface CrearIntentResponse {
  pagoId: number;
  clientSecret: string;
  montoCentimos: number;
  currency: string;
}

export const pagoService = {
  async crearIntent(carritoPendienteId: number): Promise<CrearIntentResponse> {
    const { data } = await apiClient.post<CrearIntentResponse>(
      '/pagos/crear-intent',
      { carritoPendienteId },
      { timeout: 20000 }
    );
    return data;
  },

  async prepararCarrito(
    clienteId: number,
    total: number,
    grupos: unknown[]
  ): Promise<{ carritoPendienteId: number; subtotalItems: number; costoEntregaTotal: number; total: number }> {
    const { data } = await apiClient.post<{
      carritoPendienteId: number;
      subtotalItems: number;
      costoEntregaTotal: number;
      total: number;
    }>('/pagos/preparar', { clienteId, total, grupos });
    return data;
  },

  async buscarOrdenPorPaymentIntent(paymentIntentId: string): Promise<number | null> {
    try {
      const { data } = await apiClient.get<number>(
        `/ordenes-pago/buscar-por-intent/${paymentIntentId}`
      );
      return data;
    } catch {
      return null;
    }
  },
};
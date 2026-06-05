// src/services/pagoService.ts
import apiClient from './apiClient';

interface CrearIntentResponse {
  pagoId: number;
  clientSecret: string;
  montoCentimos: number;
  currency: string;
}

export const pagoService = {
  async crearIntent(ordenPagoId: number): Promise<CrearIntentResponse> {
    const { data } = await apiClient.post<CrearIntentResponse>(
      '/pagos/crear-intent',
      { ordenPagoId }
    );
    return data;
  },
};
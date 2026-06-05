import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from './useAuth';

export function useStripeStatus() {
  const { usuario } = useAuth();
  const [stripeCompletado, setStripeCompletado] = useState<boolean | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario?.id) return;
    apiClient
      .get(`/comerciantes/${usuario.id}/stripe/status`)
      .then(({ data }) => setStripeCompletado(data.yaCompletado))
      .catch(() => setStripeCompletado(null))
      .finally(() => setCargando(false));
  }, [usuario?.id]);

  return { stripeCompletado, cargando };
}
import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from './useAuth';

export function useStripeBalance() {
  const { usuario } = useAuth();
  const [balance, setBalance] = useState<{
    disponible: number;
    pendiente: number;
    moneda: string;
  } | null>(null);

  useEffect(() => {
    if (!usuario?.id) return;
    apiClient
      .get(`/comerciantes/${usuario.id}/stripe/balance`)
      .then(({ data }) => setBalance(data))
      .catch(() => setBalance(null));
  }, [usuario?.id]);

  return balance;
}
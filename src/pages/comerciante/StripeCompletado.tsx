import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function StripeCompletado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirmando, setConfirmando] = useState(true);

  useEffect(() => {
    const account = searchParams.get('account');

    const confirmar = async () => {
      try {
        if (account) {
          await apiClient.get('/comerciantes/stripe/completado', {
            params: { account },
          });
        }
      } catch (err) {
        console.error('Error confirmando onboarding Stripe:', err);
      } finally {
        setConfirmando(false);
      }
    };

    confirmar();

    const t = setTimeout(() => navigate('/comerciante/dashboard'), 3000);
    return () => clearTimeout(t);
  }, [navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold text-green-600">¡Cuenta Stripe conectada!</h1>
      <p className="text-gray-500">
        {confirmando ? 'Confirmando…' : 'Redirigiendo a tu panel en unos segundos…'}
      </p>
    </div>
  );
}

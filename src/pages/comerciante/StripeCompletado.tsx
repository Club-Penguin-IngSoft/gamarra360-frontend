import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StripeCompletado() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/comerciante/dashboard'), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold text-green-600">¡Cuenta Stripe conectada!</h1>
      <p className="text-gray-500">Redirigiendo a tu panel en unos segundos…</p>
    </div>
  );
}
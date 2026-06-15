import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function StripeRefresh() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const regen = async () => {
      try {
        const { data } = await apiClient.post(
          `/comerciantes/${id}/stripe/onboarding`
        );
        if (data.onboardingUrl) window.location.href = data.onboardingUrl;
      } catch (err) {
        console.error('Error regenerando link Stripe:', err);
      }
    };
    regen();
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Redirigiendo a Stripe…</p>
    </div>
  );
}
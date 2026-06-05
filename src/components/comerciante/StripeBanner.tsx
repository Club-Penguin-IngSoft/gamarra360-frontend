import { useState } from 'react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  yaCompletado: boolean | null;
}

export default function StripeBanner({ yaCompletado }: Props) {
  const { usuario } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (yaCompletado === true) return null;

  const handleConectar = async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await apiClient.post(
        `/comerciantes/${usuario?.id}/stripe/onboarding`
      );
      if (data.yaCompletado) {
        alert('Tu cuenta Stripe ya está conectada y verificada.');
        return;
      }
      window.location.href = data.onboardingUrl; // redirige a Stripe
    } catch (err) {
      console.error('Error conectando con Stripe:', err);
      setError('No se pudo conectar con Stripe. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col mb-6">
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
            stroke="#D97706" strokeWidth={2} className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] text-amber-800 font-medium">
            Conecta tu cuenta Stripe para empezar a recibir pagos de tus ventas.
          </p>
        </div>
        <button
          onClick={handleConectar}
          disabled={cargando}
          className="flex-shrink-0 ml-4 px-4 py-2 bg-[#635BFF] text-white text-[12px] font-semibold rounded-lg hover:bg-[#4F46E5] disabled:opacity-60 transition-colors"
        >
          {cargando ? 'Conectando...' : 'Conectar Stripe'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
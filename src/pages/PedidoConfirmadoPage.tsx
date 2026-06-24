import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { pagoService } from '../services/pagoService';
import { RUTAS } from '../constants/rutas';

export default function PedidoConfirmadoPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');

    if (!paymentIntentId || redirectStatus !== 'succeeded') {
      setError(true);
      return;
    }

    let intentos = 0;
    const maxIntentos = 8; // el webhook puede tardar unos segundos

    const intentarResolver = async () => {
      const ordenId = await pagoService.buscarOrdenPorPaymentIntent(paymentIntentId);
      if (ordenId) {
        navigate(`${RUTAS.DETALLE_PEDIDO(ordenId)}?redirect_status=succeeded`, { replace: true });
        return;
      }
      intentos++;
      if (intentos < maxIntentos) {
        setTimeout(intentarResolver, 1500);
      } else {
        setError(true);
      }
    };

    intentarResolver();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-[16px] text-ink-700">
          Tu pago se está procesando. Revisa "Mis Pedidos" en unos momentos.
        </p>
        <button
          onClick={() => navigate(RUTAS.MIS_PEDIDOS)}
          className="rounded-lg bg-[#c83a71] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#a62b5a]"
        >
          Ver mis pedidos
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      <p className="text-[14px] text-ink-500">Confirmando tu pago...</p>
    </div>
  );
}
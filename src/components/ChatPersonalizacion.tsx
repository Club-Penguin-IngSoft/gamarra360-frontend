import { useEffect, useState } from 'react';
import { personalizacionService } from '../services/personalizacionService';
import type { IMensajePersonalizacion } from '../types/IPersonalizacion';

export default function ChatPersonalizacion({ personalizacionId, soy }: { personalizacionId: number; soy: 'CLIENTE' | 'VENDEDOR' }) {
  const [mensajes, setMensajes] = useState<IMensajePersonalizacion[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    personalizacionService.listarMensajes(personalizacionId).then(setMensajes).catch(() => setError('No se pudo cargar la conversación.'));
  }, [personalizacionId]);

  async function enviar() {
    const mensaje = texto.trim();
    if (!mensaje || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const nuevo = await personalizacionService.enviarMensaje(personalizacionId, mensaje);
      setMensajes((actuales) => [...actuales, nuevo]);
      setTexto('');
    } catch {
      setError('No se pudo enviar el mensaje.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[15px] font-bold text-gray-900">Conversación</h2>
      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-3">
        {mensajes.length === 0 && <p className="py-4 text-center text-[12px] text-gray-500">Aún no hay mensajes.</p>}
        {mensajes.map((m) => {
          const propio = m.remitente === soy;
          return (
            <div key={m.id} className={`flex ${propio ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 ${propio ? 'bg-primario text-white' : 'border border-gray-200 bg-white text-gray-800'}`}>
                <p className="whitespace-pre-wrap break-words text-[13px]">{m.mensaje}</p>
                <p className={`mt-1 text-[10px] ${propio ? 'text-white/70' : 'text-gray-400'}`}>{new Date(m.fecha).toLocaleString('es-PE')}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1500} rows={2} placeholder="Escribe un mensaje..." className="min-w-0 flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-[13px] focus:border-primario focus:outline-none" />
        <button type="button" onClick={() => void enviar()} disabled={!texto.trim() || enviando} className="self-stretch rounded-lg bg-primario px-4 text-[12px] font-semibold text-white disabled:opacity-50">Enviar</button>
      </div>
      {error && <p className="mt-2 text-[12px] text-error">{error}</p>}
    </section>
  );
}

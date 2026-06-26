import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import ModalBase from './ModalBase';
import { actualizarDireccion } from '../../services/clienteService';
import { pedidoService } from '../../services/pedidoService';
import type { IPerfilCliente } from '../../types/ICliente';
import type { IDistritoEnvio } from '../../types/IPedido';

interface Props {
  perfil: IPerfilCliente | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

const SELECT = 'w-full appearance-none rounded-input border border-neutro-200 bg-white px-4 py-3 text-body-md text-ink-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-surface-muted disabled:cursor-not-allowed';
const INPUT  = 'w-full rounded-input border border-neutro-200 bg-white px-4 py-3 text-body-md text-ink-900 placeholder-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const LABEL  = 'text-label-md font-medium text-ink-700';

const Chevron = () => (
  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function EditarDireccionModal({ perfil, onCerrar, onGuardado }: Props) {
  /* Distritos del backend */
  const [distritos, setDistritos]   = useState<IDistritoEnvio[]>([]);
  const [cargando, setCargando]     = useState(true);

  /* Formulario — pre-poblado desde el perfil */
  const [ciudadSel, setCiudadSel]   = useState(perfil?.ciudadDistrito ?? '');
  const [idDistrito, setIdDistrito] = useState<number | null>(perfil?.idDistrito ?? null);
  const [calle, setCalle]           = useState(perfil?.direccionEntrega ?? '');
  const [referencia, setReferencia] = useState(perfil?.referencia ?? '');

  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    pedidoService.listarDistritos()
      .then(setDistritos)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  /* Listas derivadas */
  const ciudades = useMemo(
    () => [...new Set(distritos.map(d => d.ciudad))].sort(),
    [distritos],
  );
  const distritosDeciudad = useMemo(
    () => distritos.filter(d => d.ciudad === ciudadSel),
    [distritos, ciudadSel],
  );

  const handleCiudadChange = (ciudad: string) => {
    setCiudadSel(ciudad);
    setIdDistrito(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!calle.trim()) { setError('La dirección es obligatoria.');  return; }
    if (!idDistrito)   { setError('Selecciona un distrito.');        return; }
    setGuardando(true);
    setError(null);
    try {
      await actualizarDireccion({
        direccionEntrega: calle.trim(),
        referencia:       referencia.trim() || undefined,
        idDistrito,
      });
      onGuardado();
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase
      titulo={perfil?.direccionEntrega ? 'Cambiar dirección' : 'Agregar dirección'}
      onCerrar={onCerrar}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Ciudad */}
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Ciudad</span>
          <div className="relative">
            <select
              value={ciudadSel}
              onChange={e => handleCiudadChange(e.target.value)}
              disabled={cargando}
              className={SELECT}
              style={{ color: ciudadSel ? '#212529' : '#adb5bd' }}
            >
              <option value="">{cargando ? 'Cargando…' : 'Selecciona una ciudad'}</option>
              {ciudades.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Chevron />
          </div>
        </label>

        {/* Distrito */}
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Distrito</span>
          <div className="relative">
            <select
              value={idDistrito ?? ''}
              onChange={e => setIdDistrito(e.target.value ? Number(e.target.value) : null)}
              disabled={cargando || !ciudadSel}
              className={SELECT}
              style={{ color: idDistrito ? '#212529' : '#adb5bd' }}
            >
              <option value="">
                {!ciudadSel ? 'Selecciona primero una ciudad' : 'Selecciona un distrito'}
              </option>
              {distritosDeciudad.map(d => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
            <Chevron />
          </div>
        </label>

        {/* Calle */}
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Dirección (Calle y Nro)</span>
          <input
            className={INPUT}
            placeholder="Ej. Av. Arequipa 3421"
            value={calle}
            onChange={e => setCalle(e.target.value)}
          />
        </label>

        {/* Referencia */}
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>
            Referencia{' '}
            <span className="font-normal text-ink-400">(opcional)</span>
          </span>
          <input
            className={INPUT}
            placeholder="Ej. frente al parque"
            value={referencia}
            onChange={e => setReferencia(e.target.value)}
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="h-11 flex-1 rounded-lg border border-neutro-200 text-label-lg font-medium text-ink-700 transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando || cargando}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 text-label-lg font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {guardando ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}

import { useAuth } from '../../hooks/useAuth';
import type { IPerfilCliente } from '../../types/ICliente';
import type { RolUsuario } from '../../types/IUsuario';

const ETIQUETA_ROL: Record<RolUsuario, string> = {
  CLIENTE: 'COMPRADOR',
  COMERCIANTE: 'VENDEDOR',
  ADMIN: 'ADMINISTRADOR',
};

interface Props {
  perfil: IPerfilCliente | null;
  cargando: boolean;
  onEditarPerfil: () => void;
}

export default function PerfilHeaderCard({ perfil, cargando, onEditarPerfil }: Props) {
  const { usuario } = useAuth();

  /* Nombre: primero del perfil enriquecido, luego del token JWT como fallback */
  const nombreCompleto = perfil?.nombres
    ? `${perfil.nombres} ${perfil.primerApellido}${perfil.segundoApellido ? ' ' + perfil.segundoApellido : ''}`
    : [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Usuario';

  const etiquetaRol = usuario ? ETIQUETA_ROL[usuario.rol] : ETIQUETA_ROL.CLIENTE;

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 rounded bg-surface-muted" />
        <div className="h-4 w-32 rounded bg-surface-muted" />
        <div className="h-4 w-40 rounded bg-surface-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-6 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-h6 font-semibold text-ink-900">{nombreCompleto}</h2>
          {perfil?.telefono && (
            <p className="text-body-xl text-ink-700">
              +51 {perfil.telefono.replace(/^\+51\s?/, '')}
            </p>
          )}
          <p className="text-body-xl text-ink-700">{perfil?.email ?? usuario?.correo}</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-info px-4 py-1.5 text-label-xs font-medium text-white">
          {etiquetaRol}
        </span>
      </div>
      <button
        type="button"
        onClick={onEditarPerfil}
        className="shrink-0 rounded-lg bg-brand-500 px-8 py-[18px] text-label-xl font-medium text-white transition-colors hover:bg-brand-600"
      >
        Editar perfil
      </button>
    </div>
  );
}

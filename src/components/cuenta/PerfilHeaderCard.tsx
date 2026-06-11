import type { IUsuario, RolUsuario } from '../../types/IUsuario';

const ETIQUETA_ROL: Record<RolUsuario, string> = {
  CLIENTE: 'COMPRADOR',
  COMERCIANTE: 'VENDEDOR',
  ADMIN: 'ADMINISTRADOR',
};

interface PerfilHeaderCardProps {
  usuario: IUsuario | null;
  onEditarPerfil: () => void;
}

function construirNombreCompleto(usuario: IUsuario | null) {
  if (!usuario) return '';

  return (
    usuario.nombreCompleto ||
    [usuario.nombres ?? usuario.nombre, usuario.primerApellido ?? usuario.apellido, usuario.segundoApellido]
      .filter(Boolean)
      .join(' ')
  );
}

function formatearCelular(telefono?: string) {
  if (!telefono) return null;
  return telefono.startsWith('+') ? telefono : `+51 ${telefono}`;
}

export default function PerfilHeaderCard({ usuario, onEditarPerfil }: PerfilHeaderCardProps) {
  const nombreCompleto = construirNombreCompleto(usuario);
  const etiquetaRol = usuario ? ETIQUETA_ROL[usuario.rol] : ETIQUETA_ROL.CLIENTE;
  const telefono = formatearCelular(usuario?.telefono);

  return (
    <div className="flex flex-col items-start gap-6 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-h6 font-semibold text-ink-900">{nombreCompleto || 'Usuario'}</h2>
          {telefono && <p className="text-body-xl text-ink-700">{telefono}</p>}
          <p className="text-body-xl text-ink-700">{usuario?.correo}</p>
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

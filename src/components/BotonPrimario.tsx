import React from 'react';

interface BotonPrimarioProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  cargando?: boolean;
  className?: string;
}

const BotonPrimario = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  cargando = false,
  className = '',
}: BotonPrimarioProps) => {
  const inactivo = disabled || cargando;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inactivo}
      className={`
        w-full py-3 rounded-input text-sm font-semibold text-white
        transition-all duration-200
        ${inactivo
          ? 'bg-neutro-300 cursor-not-allowed shadow-none'
          : 'bg-primario hover:bg-primario-hover shadow-primario cursor-pointer'
        }
        ${className}
      `}
    >
      {cargando ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default BotonPrimario;

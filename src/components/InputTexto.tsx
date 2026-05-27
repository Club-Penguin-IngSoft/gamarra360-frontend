import React from 'react';

interface InputTextoProps {
  tipo: 'email' | 'password' | 'text' | 'tel' | 'number';
  nombre: string;
  placeholder: string;
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  sufijo?: React.ReactNode;
  disabled?: boolean;
}

const InputTexto = ({
  tipo,
  nombre,
  placeholder,
  valor,
  onChange,
  autoComplete,
  sufijo,
  disabled = false,
}: InputTextoProps) => (
  <div className="relative">
    <input
      type={tipo}
      name={nombre}
      placeholder={placeholder}
      value={valor}
      onChange={onChange}
      autoComplete={autoComplete}
      disabled={disabled}
      className="
        w-full px-4 py-3 text-sm
        rounded-input border border-neutro-200
        text-neutro-900 placeholder-neutro-400 bg-white
        focus:outline-none focus:border-primario focus:ring-2 focus:ring-primario-claro
        disabled:bg-neutro-50 disabled:text-neutro-400 disabled:cursor-not-allowed
        transition-all duration-150
      "
      style={{ paddingRight: sufijo ? '2.75rem' : undefined }}
    />
    {sufijo && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">{sufijo}</div>
    )}
  </div>
);

export default InputTexto;

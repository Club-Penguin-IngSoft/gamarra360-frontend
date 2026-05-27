import React from 'react';

interface InputProps {
  type: 'email' | 'password' | 'text' | 'tel' | 'number';
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  suffix?: React.ReactNode;
  disabled?: boolean;
}

const Input = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  autoComplete,
  suffix,
  disabled = false,
}: InputProps) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
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
      style={{ paddingRight: suffix ? '2.75rem' : undefined }}
    />
    {suffix && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
    )}
  </div>
);

export default Input;

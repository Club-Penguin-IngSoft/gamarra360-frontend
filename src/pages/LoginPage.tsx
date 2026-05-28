import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';
import LogoGamarra from '../components/LogoGamarra';
import InputTexto from '../components/InputTexto';
import BotonPrimario from '../components/BotonPrimario';
import BotonGoogle from '../components/BotonGoogle';
import useLogin from '../hooks/useLogin';
import { RUTAS } from '../constants/rutas';
import { ILoginRequest } from '../types/IAuth';
import { COLORES } from '../styles/tokens';

const LoginPage = () => {
  const [form, setForm] = useState<ILoginRequest>({ email: '', contrasena: '' });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const { iniciarSesion, cargando, error } = useLogin();

  const formularioValido =
    form.email.trim() !== '' && form.contrasena.trim() !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formularioValido && !cargando) {
      iniciarSesion(form);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* ── Barra de navegación superior ────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutro-200 h-14 flex items-center px-6 justify-between">
        <LogoGamarra size="sm" />
        <Link
          to={RUTAS.INICIO}
          className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-75"
          style={{ color: COLORES.primario }}
        >
          <MaterialIcon name="arrow_back" style={{ fontSize: '18px' }} />
          Volver al Inicio
        </Link>
      </header>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <div className="flex flex-1 pt-14">

        {/* ── Panel izquierdo — imagen hero ─────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-end relative overflow-hidden"
          style={{ width: '58%' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/login-bg.jpg')" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.25) 100%)',
            }}
          />
          <div className="relative z-10 p-12 pb-14">
            <span
              className="inline-block px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-5"
              style={{ backgroundColor: COLORES.primario }}
            >
              DISTRITO TEXTIL
            </span>
            <h1 className="text-white font-extrabold leading-tight mb-4" style={{ fontSize: '3rem' }}>
              Donde la moda<br />cobra vida
            </h1>
            <p className="text-white/75 text-base max-w-sm leading-relaxed">
              Únete a la red de comerciantes más vibrante de Latinoamérica.
              Gestiona tu stock, conecta con clientes y escala tu marca.
            </p>
          </div>
        </div>

        {/* ── Panel derecho — formulario ─────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-8 py-10 bg-white">
          <div className="w-full max-w-sm">

            <LogoGamarra size="md" className="mb-8" />

            <h2 className="text-3xl font-extrabold text-neutro-900 mb-1">
              Bienvenido de nuevo
            </h2>
            <p className="text-neutro-400 text-sm mb-8">
              Ingresa tus credenciales para acceder.
            </p>

            {error && (
              <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-error-claro border border-error/20 text-error text-sm">
                <MaterialIcon name="error_outline" style={{ fontSize: '18px', marginTop: '1px' }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <InputTexto
                tipo="email"
                nombre="email"
                placeholder="Correo electrónico"
                valor={form.email}
                onChange={handleChange}
                autoComplete="email"
              />

              <InputTexto
                tipo={mostrarPassword ? 'text' : 'password'}
                nombre="contrasena"
                placeholder="Contraseña"
                valor={form.contrasena}
                onChange={handleChange}
                autoComplete="current-password"
                sufijo={
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    className="text-neutro-400 hover:text-neutro-500 transition-colors"
                    tabIndex={-1}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <MaterialIcon
                      name={mostrarPassword ? 'visibility_off' : 'visibility'}
                      style={{ fontSize: '20px' }}
                    />
                  </button>
                }
              />

              <BotonPrimario
                type="submit"
                disabled={!formularioValido}
                cargando={cargando}
              >
                Ingresar
              </BotonPrimario>
            </form>

            <p className="text-center text-sm text-neutro-500 mt-5">
              ¿Olvidaste tu contraseña?{' '}
              <button
                type="button"
                className="font-semibold hover:underline"
                style={{ color: COLORES.primario }}
              >
                Haz clic aquí
              </button>
            </p>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-neutro-400" />
              <span className="text-xs text-neutro-500 uppercase tracking-widest font-medium whitespace-nowrap">
                O continúa con
              </span>
              <div className="flex-1 h-px bg-neutro-400" />
            </div>

            <BotonGoogle />

            <p className="text-center text-sm text-neutro-400 mt-6">
              ¿No tienes una cuenta?{' '}
              <Link
                to={RUTAS.REGISTRO}
                className="font-semibold hover:underline"
                style={{ color: COLORES.primario }}
              >
                Regístrate ahora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

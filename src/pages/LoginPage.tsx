/**
 * Pantalla de inicio de sesión.
 * Diseño basado en Figma node 2576-15682.
 *
 * Se accede cuando un usuario no autenticado intenta entrar a flujos protegidos
 * (ej. "Solicitar personalización"). Soporta el query param `?returnTo=...` para
 * redirigir al usuario de vuelta luego del login exitoso.
 *
 * Por ahora la autenticación es mockeada — cualquier credencial válida crea
 * un usuario en memoria. Se reemplazará por POST /api/v1/autenticacion/login
 * cuando el backend Spring Boot esté disponible.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { RUTAS } from '../constants/rutas';
import { useAuth } from '../hooks/useAuth';
import { validarEmail } from '../utils/validarEmail';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { iniciarSesion } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const returnTo = searchParams.get('returnTo') ?? RUTAS.INICIO;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    if (!validarEmail(correo)) {
      setErrorForm('Ingresa un correo válido.');
      return;
    }
    if (contrasena.length < 6) {
      setErrorForm('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // MOCK: en producción se llamará a apiClient.post('/autenticacion/login')
    iniciarSesion({
      token: 'mock-jwt-' + Date.now(),
      usuario: {
        id: 'u-' + Date.now(),
        nombre: correo.split('@')[0],
        apellido: '',
        correo,
        rol: 'CLIENTE',
      },
    });

    navigate(returnTo, { replace: true });
  };

  const puedeEnviar = correo.length > 0 && contrasena.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      {/* Top bar especial: solo logo + volver al inicio */}
      <header className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-4">
        <Link to={RUTAS.INICIO} aria-label="Ir al inicio">
          <Logo size="md" />
        </Link>
        <Link
          to={RUTAS.INICIO}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Left: Editorial image */}
        <aside
          className="relative hidden min-h-[400px] flex-1 overflow-hidden bg-ink-800 lg:flex"
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          {/* Gradient overlay para legibilidad */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(0deg, rgba(45, 47, 49, 1) 0%, rgba(45, 47, 49, 0) 50%, rgba(45, 47, 49, 0) 100%)',
            }}
          />
          <div className="relative z-10 mt-auto flex flex-col gap-6 p-16">
            <span className="inline-flex w-fit items-center rounded-full bg-brand-500 px-5 py-2 text-[13px] font-medium tracking-wide text-white">
              DISTRITO TEXTIL
            </span>
            <h2 className="text-[48px] font-bold leading-tight text-white xl:text-[64px]">
              Donde la moda cobra vida
            </h2>
            <p className="max-w-md text-[18px] leading-relaxed text-white/90">
              Únete a la red de comerciantes más vibrante de Latinoamérica.
              Gestiona tu stock, conecta con clientes y escala tu marca.
            </p>
          </div>
        </aside>

        {/* Right: Login form */}
        <section className="flex flex-1 items-center justify-center bg-white p-8 lg:p-20">
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-8">
            {/* Header branding */}
            <div className="flex flex-col gap-6">
              <Logo size="lg" />
              <div className="flex flex-col gap-2">
                <h1 className="text-[32px] font-bold leading-tight text-ink-900">
                  Bienvenido de nuevo
                </h1>
                <p className="text-[15px] text-ink-700">
                  Ingresa tus credenciales para acceder.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="correo"
                  className="text-[13px] font-medium text-ink-700"
                >
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="h-12 rounded border border-ink-100 bg-white px-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contrasena"
                  className="text-[13px] font-medium text-ink-700"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="contrasena"
                    type={mostrarContrasena ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded border border-ink-100 bg-white px-3 pr-11 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-500 hover:text-ink-900"
                    aria-label={
                      mostrarContrasena
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {mostrarContrasena ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorForm && (
                <p className="text-[13px] text-brand-600">{errorForm}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!puedeEnviar}
              className={`h-14 rounded-lg text-[16px] font-medium text-white transition-colors ${
                puedeEnviar
                  ? 'bg-brand-500 hover:bg-brand-600'
                  : 'cursor-not-allowed bg-ink-100 text-ink-500'
              }`}
            >
              Ingresar
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1 text-[15px]">
              <span className="text-ink-700">¿Olvidaste tu contraseña?</span>
              <button
                type="button"
                className="font-medium text-brand-600 hover:text-brand-500"
              >
                Haz clic aquí
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-ink-100" />
              <span className="text-[13px] tracking-wider text-ink-400">
                O CONTINÚA CON
              </span>
              <span className="h-px flex-1 bg-ink-100" />
            </div>

            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-ink-100 bg-white text-[15px] font-medium text-ink-900 transition-colors hover:bg-surface-muted"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1 text-[15px]">
              <span className="text-ink-700">¿No tienes una cuenta?</span>
              <Link
                to={RUTAS.REGISTRO}
                className="font-medium text-brand-600 hover:text-brand-500"
              >
                Regístrate ahora
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

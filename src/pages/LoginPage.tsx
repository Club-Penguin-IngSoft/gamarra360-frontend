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
import TopBar from '../components/TopBar';
import LogoGamarra from '../components/LogoGamarra';
import MaterialIcon from '../components/MaterialIcon';
import Input from '../components/Input';
import Button from '../components/Button';
import GoogleButton from '../components/GoogleButton';
import { RUTAS } from '../constants/rutas';
import { useAuth } from '../hooks/useAuth';
import { validarEmail } from '../utils/validarEmail';
import { COLORES } from '../styles/tokens';

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
    const esAdmin = correo === 'admin@gamarra360.com';
    const esComerciante = correo === 'comerciante@gamarra360.com';

    iniciarSesion({
      token: 'mock-jwt-' + Date.now(),
      usuario: {
        id: esAdmin ? 'admin-1' : esComerciante ? 'comerciante-1' : 'u-' + Date.now(),
        nombre: esAdmin ? 'Administrador' : esComerciante ? 'Comerciante' : correo.split('@')[0],
        apellido: esAdmin ? 'Gamarra 360' : esComerciante ? 'Demo' : '',
        correo,
        rol: esAdmin ? 'ADMIN' : esComerciante ? 'COMERCIANTE' : 'CLIENTE',
      },
    });

    navigate(esAdmin ? RUTAS.ADMIN_DASHBOARD : esComerciante ? RUTAS.COMERCIANTE_DASHBOARD : returnTo, { replace: true });
  };

  const puedeEnviar = correo.length > 0 && contrasena.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-neutro-50 font-sans">
      <TopBar minimal />

      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Left: Editorial image */}
        <aside
          className="relative hidden min-h-[400px] flex-[1.4] overflow-hidden lg:flex"
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.25) 100%)',
            }}
          />
          <div className="relative z-10 mt-auto flex flex-col gap-5 p-16">
            <span
              className="inline-block w-fit px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: COLORES.primario }}
            >
              DISTRITO TEXTIL
            </span>
            <h2 className="text-white font-extrabold leading-tight" style={{ fontSize: '3rem' }}>
              Donde la moda<br />cobra vida
            </h2>
            <p className="max-w-sm text-white/75 text-base leading-relaxed">
              Únete a la red de comerciantes más vibrante de Latinoamérica.
              Gestiona tu stock, conecta con clientes y escala tu marca.
            </p>
          </div>
        </aside>

        {/* Right: Login form */}
        <section className="flex flex-1 items-center justify-center bg-white px-8 py-10">
          <div className="flex w-full max-w-sm flex-col">
            <LogoGamarra size="md" className="mb-8 self-start" />

            <h1 className="text-3xl font-extrabold text-neutro-900 mb-1">
              Bienvenido de nuevo
            </h1>
            <p className="text-neutro-500 text-sm mb-8">
              Ingresa tus credenciales para acceder.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
              />

              <Input
                type={mostrarContrasena ? 'text' : 'password'}
                name="contrasena"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena((v) => !v)}
                    className="text-neutro-400 hover:text-neutro-500 transition-colors"
                    tabIndex={-1}
                    aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <MaterialIcon
                      name={mostrarContrasena ? 'visibility_off' : 'visibility'}
                      style={{ fontSize: '20px' }}
                    />
                  </button>
                }
              />

              {errorForm && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-error-claro border border-error/20 text-error text-sm">
                  <MaterialIcon name="error_outline" style={{ fontSize: '18px', marginTop: '1px' }} />
                  <span>{errorForm}</span>
                </div>
              )}

              <Button type="submit" disabled={!puedeEnviar}>
                Ingresar
              </Button>
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

            <GoogleButton />

            <div className="text-center text-sm text-neutro-500 mt-6">
              ¿No tienes una cuenta?{' '}
              <Link
                to={RUTAS.REGISTRO}
                className="font-semibold hover:underline"
                style={{ color: COLORES.primario }}
              >
                Regístrate ahora
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

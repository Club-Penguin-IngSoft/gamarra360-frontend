import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MaterialIcon from '../components/MaterialIcon';
import LogoGamarra from '../components/LogoGamarra';
import InputTexto from '../components/InputTexto';
import BotonPrimario from '../components/BotonPrimario';
import BotonGoogle from '../components/BotonGoogle';
import useLogin from '../hooks/useLogin';
import { RUTAS } from '../constants/rutas';
import { API_BASE_URL } from '../constants';
import { ILoginRequest } from '../types/IAuth';
import { COLORES } from '../styles/tokens';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [form, setForm] = useState<ILoginRequest>({ email: '', contrasenha: '' });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();
  const { iniciarSesion, cargando, error } = useLogin();
  const [estadoModal, setEstadoModal] = useState<'PENDIENTE' | 'RECHAZADO' | null>(null);

  // GOOGLE LOGIN
  const loginGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        console.log("GOOGLE TOKEN: ", tokenResponse);

        const response = await axios.post(
          `${API_BASE_URL}/auth/google`,
          { accessToken: tokenResponse.access_token }
        );
        console.log("RESPUESTA BACKEND:", response.data);
        //usuario no existe
        if (response.data.needsRegistration) {
          console.log("Usuario no registrado, redirigiendo a registro con email:", response.data.email);
          navigate(RUTAS.REGISTRO, {
            state: {
              email: response.data.email
            }
          });
          return;
        }
        // Verificar estado de solicitud para comerciantes
        if (response.data.estadoSolicitud === 'PENDIENTE') {
          setEstadoModal('PENDIENTE');
          return;
        }
        if (response.data.estadoSolicitud === 'RECHAZADO') {
          setEstadoModal('RECHAZADO');
          return;
        }

        // Acceso normal
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("nombreUsuario", response.data.nombres || response.data.email);
        
        // Redirigir según el rol
        const rol = response.data.rol;
        if (rol === 'ADMIN') {
          navigate(RUTAS.ADMIN_DASHBOARD);
        } else if (rol === 'VENDEDOR' || rol === 'COMERCIANTE') {
          navigate(RUTAS.COMERCIANTE_DASHBOARD);
        } else {
          navigate(RUTAS.INICIO);
        }
      } catch (error) {
        console.error("ERROR COMPLETO:", error);
      }
    },
    onError: () => {
      console.log('Google Login Failed');
    },
  });

  const formularioValido =
    form.email.trim() !== '' && form.contrasenha.trim() !== '';

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
      {/* ── Modales de estado comerciante ───────────────────────────────── */}
      {estadoModal === 'PENDIENTE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
              <MaterialIcon name="hourglass_top" style={{ fontSize: '40px', color: '#b45309' }} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">Solicitud en revisión</p>
            <p className="text-sm leading-relaxed text-gray-500">
              Tu solicitud de registro como comerciante está siendo evaluada.
              Te notificaremos por correo una vez aprobado tu acceso.
            </p>
            <button
              onClick={() => setEstadoModal(null)}
              className="text-sm font-semibold hover:underline"
              style={{ color: COLORES.primario }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {estadoModal === 'RECHAZADO' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <MaterialIcon name="cancel" style={{ fontSize: '40px', color: '#dc2626' }} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">Solicitud rechazada</p>
            <p className="text-sm leading-relaxed text-gray-500">
              Tu solicitud como comerciante fue rechazada. Si crees que es un error,
              puedes contactarnos o volver a registrarte.
            </p>
            <button
              onClick={() => setEstadoModal(null)}
              className="text-sm font-semibold hover:underline"
              style={{ color: COLORES.primario }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
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
                nombre="contrasenha"
                placeholder="Contraseña"
                valor={form.contrasenha}
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

            <BotonGoogle onClick={() => loginGoogle()} />

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

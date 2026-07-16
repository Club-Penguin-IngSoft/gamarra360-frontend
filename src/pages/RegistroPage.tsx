import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import LogoGamarra from '../components/LogoGamarra';
import MaterialIcon from '../components/MaterialIcon';
import Input from '../components/Input';
import Button from '../components/Button';
import { useLocation } from 'react-router-dom';
import { RUTAS } from '../constants/rutas';
import { COLORES } from '../styles/tokens';
import apiClient from '../services/apiClient';
import { useGoogleLogin } from '@react-oauth/google';
import useLogin from '../hooks/useLogin';
import BotonGoogle from '../components/BotonGoogle';
import { limpiarCelular, validarCelularPeru, validarDocumento } from '../utils/validaciones';
import ModalEstadoSolicitud from '../components/ModalEstadoSolicitud';
//import axios from 'axios';

const TIPOS_DOCUMENTO = ['DNI', 'Carnet de extranjería', 'Pasaporte'];

function validarContrasena(pass: string): boolean {
  return (
    pass.length >= 8 &&
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /[0-9]/.test(pass) &&
    /[^A-Za-z0-9]/.test(pass)
  );
}

function generarPasswordAleatoria(): string {
  // Cumple los requisitos: mayúscula, minúscula, número, especial, 8+ caracteres
  return `Gx${Math.random().toString(36).slice(-8)}!9`;
}

function RegistroExitosoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: '#effff5' }}
        >
          <MaterialIcon
            name="check_circle"
            style={{ fontSize: '40px', color: '#146c43' }}
          />
        </div>
        <div>
          <p className="text-xl font-extrabold text-gray-900 mb-2">Registro Exitoso</p>
          <p className="text-sm leading-relaxed text-gray-500">
            Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-sm font-semibold hover:underline mt-1"
          style={{ color: COLORES.primario }}
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const emailGoogle = location.state?.email || '';
  /*const correoFinal = emailGoogle || correo;*/
  const [nombres, setNombres]                   = useState('');
  const [primerApellido, setPrimerApellido]     = useState('');
  const [segundoApellido, setSegundoApellido]   = useState('');
  const [tipoDoc, setTipoDoc]                   = useState('');
  const [numeroDoc, setNumeroDoc]               = useState('');
  const [celular, setCelular]                   = useState('');
  const [contrasena, setContrasena]             = useState('');
  const [confirmar, setConfirmar]               = useState('');
  const [mostrarPass, setMostrarPass]           = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [errorForm, setErrorForm]               = useState<string | null>(null);
  const [errorCelularLive, setErrorCelularLive] = useState<string | null>(null);
  const [errorDocLive, setErrorDocLive] = useState<string | null>(null);
  const { loginConGoogle } = useLogin();
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [estadoModal, setEstadoModal] = useState<'pendiente' | 'rechazado' | 'desactivado' | null>(null);

  const loginGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const data = await loginConGoogle(tokenResponse.access_token);

        if (data?.estadoSolicitud === 'PENDIENTE') {
          setEstadoModal('pendiente');
          return;
        }
        if (data?.estadoSolicitud === 'RECHAZADO') {
          setEstadoModal('rechazado');
          return;
        }
        if (data?.estadoSolicitud === 'DESACTIVADO') {
          setEstadoModal('desactivado');
          return;
        }
        // needsRegistration=true → el hook ya navega a /registro con el email
      } catch {
        setErrorForm('Error al autenticar con Google');
      }
    },
    onError: () => setErrorForm('No se pudo conectar con Google'),
  });

  
  const puedeEnviar =
    (emailGoogle || correo).length > 0 &&
    nombres.length > 0 &&
    primerApellido.length > 0 &&
    tipoDoc.length > 0 &&
    numeroDoc.length > 0 &&
    celular.length > 0 &&
    validarDocumento(tipoDoc, numeroDoc) === null &&
    validarCelularPeru(celular) === null &&
    (emailGoogle
      ? true // viene de Google, no necesita contraseña
      : validarContrasena(contrasena) && contrasena === confirmar);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    const errorDoc = validarDocumento(tipoDoc, numeroDoc);
    if (errorDoc) {
      setErrorForm(errorDoc);
      return;
    }

    const errorCelular = validarCelularPeru(celular);
    if (errorCelular) {
      setErrorForm(errorCelular);
      return;
    }

    // También ajusta la validación de contraseña en handleSubmit (antes del payload):
    if (!emailGoogle) {
      if (!validarContrasena(contrasena)) {
        setErrorForm('La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.');
        return;
      }
      if (contrasena !== confirmar) {
        setErrorForm('Las contraseñas no coinciden.');
        return;
      }
    }

    try {
      const payload = {
        nombres,
        primerApellido,
        segundoApellido,
        email: emailGoogle || correo,
        contrasenha: emailGoogle ? generarPasswordAleatoria() : contrasena,
        dni: numeroDoc,
        telefono: limpiarCelular(celular),
        tipoDocumento: tipoDoc,
        rol: 'CLIENTE',
      };

      const endpoint = emailGoogle ? '/auth/google/register' : '/auth/register';
      await apiClient.post(endpoint, payload);

      setRegistroExitoso(true);

    } catch (error: any) {
      console.error(error);
      const mensaje = error.response?.data?.mensaje ?? 'Error al registrar usuario';
      setErrorForm(mensaje);
    }
  };

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {estadoModal && (
        <ModalEstadoSolicitud tipo={estadoModal} onClose={() => setEstadoModal(null)} />
      )}
      <TopBar minimal />
      {registroExitoso && (
        <RegistroExitosoModal onClose={() => navigate(RUTAS.LOGIN)} />
      )}
      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Left: form */}
        <section className="flex flex-1 items-start justify-center bg-white px-8 py-10 lg:items-center">
          <div className="flex w-full max-w-sm flex-col">
            <LogoGamarra size="md" className="mb-6 self-start" />

            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
              Crea tu cuenta
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Empieza tu experiencia.
            </p>

            {emailGoogle ? (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-pink-50 border border-pink-200 px-4 py-3 text-sm text-pink-700">
                <MaterialIcon name="check_circle" style={{ fontSize: '20px' }} />
                <span>Vinculado con Google: <strong>{emailGoogle}</strong></span>
              </div>
            ) : (
              <div className="mb-6 space-y-4">
                <BotonGoogle onClick={() => loginGoogle()} />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium whitespace-nowrap">
                    O continua con tus datos
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              <Input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={emailGoogle || correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
                disabled={!!emailGoogle}
              />

              <Input
                type="text"
                name="nombres"
                placeholder="Nombre(s)"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                autoComplete="given-name"
              />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  type="text"
                  name="primerApellido"
                  placeholder="Primer apellido"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  autoComplete="family-name"
                />
                <Input
                  type="text"
                  name="segundoApellido"
                  placeholder="Segundo apellido"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                />
              </div>

              {/* Tipo de documento */}
              <div className="relative">
                <select
                  name="tipoDoc"
                  value={tipoDoc}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setTipoDoc(e.target.value)}
                  className="
                    w-full appearance-none px-4 py-3 text-sm
                    rounded-input border border-neutro-200
                    bg-white focus:outline-none focus:border-primario focus:ring-2 focus:ring-primario-claro
                    transition-all duration-150
                    disabled:bg-neutro-50 disabled:cursor-not-allowed
                  "
                  style={{ color: tipoDoc ? '#212529' : '#adb5bd' }}
                >
                  <option value="" disabled>Tipo de documento</option>
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <MaterialIcon
                  name="expand_more"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  style={{ fontSize: '20px' }}
                />
              </div>

              <div className="space-y-1">
                <Input
                  type="text"
                  name="numeroDoc"
                  placeholder="Número de documento"
                  value={numeroDoc}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setNumeroDoc(valor);
                    setErrorDocLive(valor ? validarDocumento(tipoDoc, valor) : null);
                  }}
                  autoComplete="off"
                />
                {errorDocLive && (
                  <p className="text-xs text-red-500 px-1">{errorDocLive}</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-400 px-1">
                  Debe empezar con 9 y tener 9 dígitos.
                </p>
                <Input
                  type="tel"
                  name="celular"
                  placeholder="Celular (999 999 999)"
                  value={celular}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setCelular(valor);
                    setErrorCelularLive(valor ? validarCelularPeru(valor) : null);
                  }}
                  autoComplete="tel"
                />
                {errorCelularLive && (
                  <p className="text-xs text-red-500 px-1">{errorCelularLive}</p>
                )}
              </div>
              {!emailGoogle && (
                <>
                  <div className="space-y-1">
                    <Input
                      type={mostrarPass ? 'text' : 'password'}
                      name="contrasena"
                      placeholder="Contraseña"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      autoComplete="new-password"
                      suffix={
                        <button
                          type="button"
                          onClick={() => setMostrarPass((v) => !v)}
                          className="text-gray-400 hover:text-gray-500 transition-colors"
                          tabIndex={-1}
                          aria-label={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          <MaterialIcon
                            name={mostrarPass ? 'visibility_off' : 'visibility'}
                            style={{ fontSize: '20px' }}
                          />
                        </button>
                      }
                    />
                    <p className="text-xs text-gray-500 px-1">
                      Mínimo 8 caracteres, incluyendo 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
                    </p>
                  </div>

                  <Input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    name="confirmarContrasena"
                    placeholder="Confirmar contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    autoComplete="new-password"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmar((v) => !v)}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                        tabIndex={-1}
                        aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <MaterialIcon
                          name={mostrarConfirmar ? 'visibility_off' : 'visibility'}
                          style={{ fontSize: '20px' }}
                        />
                      </button>
                    }
                  />
                </>
              )}
              {errorForm && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  <MaterialIcon name="error_outline" style={{ fontSize: '18px', marginTop: '1px' }} />
                  <span>{errorForm}</span>
                </div>
              )}

              <Button type="submit" disabled={!puedeEnviar} className="!mt-4">
                Regístrate
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to={RUTAS.LOGIN}
                className="font-semibold hover:underline"
                style={{ color: COLORES.primario }}
              >
                Inicia sesión
              </Link>
            </p>

            {/* Vendor CTA */}
            <div
              className="mt-5 rounded-xl border border-pink-200 bg-pink-50 px-5 py-4 text-center"
            >
              <p className="text-sm font-medium text-gray-700 mb-1">¿Quieres vender?</p>
              <Link
                to={RUTAS.REGISTRO_COMERCIANTE}
                className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: COLORES.primario }}
              >
                Crea tu cuenta de comerciante aquí
                <MaterialIcon name="arrow_forward" style={{ fontSize: '16px' }} />
              </Link>
            </div>
          </div>
        </section>

        {/* Right: editorial image */}
        <aside
          className="relative hidden min-h-[400px] flex-[1.4] overflow-hidden lg:flex"
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.18) 100%)',
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
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';
import LogoGamarra from '../components/LogoGamarra';
import InputTexto from '../components/InputTexto';
import BotonPrimario from '../components/BotonPrimario';
import { RUTAS } from '../constants/rutas';
import { COLORES } from '../styles/tokens';
import apiClient from '../services/apiClient';

// ── Validación de contraseña (igual que en registro) ─────────────────────
function validarContrasena(pass: string): string | null {
  if (pass.length < 8)          return 'Mínimo 8 caracteres.';
  if (!/[A-Z]/.test(pass))      return 'Debe incluir al menos una mayúscula.';
  if (!/[a-z]/.test(pass))      return 'Debe incluir al menos una minúscula.';
  if (!/[0-9]/.test(pass))      return 'Debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(pass)) return 'Debe incluir al menos un carácter especial.';
  return null;
}

// ── Tipos de paso ─────────────────────────────────────────────────────────
type Paso = 'email' | 'codigo' | 'password';

export default function OlvidoPasswordPage() {
  const navigate = useNavigate();

  const [paso, setPaso]                 = useState<Paso>('email');
  const [email, setEmail]               = useState('');
  const [codigo, setCodigo]             = useState('');
  const [nuevaPass, setNuevaPass]       = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');
  const [mostrarPass, setMostrarPass]   = useState(false);
  const [mostrarConf, setMostrarConf]   = useState(false);
  const [cargando, setCargando]         = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [exitoso, setExitoso]           = useState(false);

  // ── PASO 1: Solicitar código ────────────────────────────────────────────
  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await apiClient.post('/auth/recuperar/solicitar', { email: email.trim() });
      setPaso('codigo');
    } catch (err: any) {
      setError(err.response?.data?.mensaje ?? 'No se pudo enviar el código. Verifica el correo.');
    } finally {
      setCargando(false);
    }
  };

  // ── PASO 2: Verificar código ────────────────────────────────────────────
  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (codigo.trim().length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }
    setCargando(true);
    try {
      await apiClient.post('/auth/recuperar/verificar', { email, codigo: codigo.trim() });
      setPaso('password');
    } catch (err: any) {
      setError(err.response?.data?.mensaje ?? 'Código incorrecto o expirado.');
    } finally {
      setCargando(false);
    }
  };

  // ── PASO 3: Nueva contraseña ────────────────────────────────────────────
  const handleRestablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errorPass = validarContrasena(nuevaPass);
    if (errorPass) { setError(errorPass); return; }
    if (nuevaPass !== confirmarPass) { setError('Las contraseñas no coinciden.'); return; }

    setCargando(true);
    try {
      await apiClient.post('/auth/recuperar/restablecer', {
        email,
        codigo,
        nuevaContrasenha: nuevaPass,
      });
      setExitoso(true);
    } catch (err: any) {
      setError(err.response?.data?.mensaje ?? 'Error al restablecer la contraseña.');
    } finally {
      setCargando(false);
    }
  };

  // ── Reenviar código ─────────────────────────────────────────────────────
  const handleReenviar = async () => {
    setError(null);
    setCargando(true);
    try {
      await apiClient.post('/auth/recuperar/solicitar', { email });
      setCodigo('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.mensaje ?? 'No se pudo reenviar el código.');
    } finally {
      setCargando(false);
    }
  };

  // ── Helpers UI ──────────────────────────────────────────────────────────
  const titulos: Record<Paso, { titulo: string; subtitulo: string }> = {
    email:    { titulo: 'Recuperar contraseña',   subtitulo: 'Ingresa tu correo y te enviaremos un código de verificación.' },
    codigo:   { titulo: 'Verifica tu identidad',  subtitulo: `Ingresa el código de 6 dígitos que enviamos a ${email}.` },
    password: { titulo: 'Nueva contraseña',        subtitulo: 'Elige una contraseña segura para tu cuenta.' },
  };

  const { titulo, subtitulo } = titulos[paso];

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutro-200 h-14 flex items-center px-6 justify-between">
        <LogoGamarra size="sm" />
        <Link
          to={RUTAS.LOGIN}
          className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-75"
          style={{ color: COLORES.primario }}
        >
          <MaterialIcon name="arrow_back" style={{ fontSize: '18px' }} />
          Volver al Login
        </Link>
      </header>

      <div className="flex flex-1 pt-14">

        {/* ── Panel izquierdo — imagen hero (idéntico al Login) ──────── */}
        <div
          className="hidden lg:flex flex-col justify-end relative overflow-hidden"
          style={{ width: '58%' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80')" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.25) 100%)' }}
          />
          <div className="relative z-10 p-6 pb-8 sm:p-10 sm:pb-12 lg:p-12 lg:pb-14">
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

        {/* ── Panel derecho — formulario ─────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-8 py-10 bg-white">
          <div className="w-full max-w-sm">

            <LogoGamarra size="md" className="mb-8" />

            {/* Indicador de pasos */}
            <div className="flex items-center gap-2 mb-6">
              {(['email', 'codigo', 'password'] as Paso[]).map((p, i) => (
                <React.Fragment key={p}>
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black transition-colors"
                    style={{
                      backgroundColor: paso === p || (exitoso && p === 'password')
                        ? COLORES.primario
                        : ['codigo', 'password'].includes(paso) && p === 'email'
                          ? COLORES.primario
                          : paso === 'password' && p === 'codigo'
                            ? COLORES.primario
                            : '#e5e7eb',
                      color: paso === p || ['codigo', 'password'].includes(paso) ? '#fff' : '#9ca3af',
                    }}
                  >
                    {(paso === 'codigo' && p === 'email') ||
                     (paso === 'password' && (p === 'email' || p === 'codigo')) ||
                     exitoso
                      ? <MaterialIcon name="check" style={{ fontSize: '14px' }} />
                      : i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className="flex-1 h-0.5 transition-colors"
                      style={{
                        backgroundColor:
                          (paso === 'codigo' && i === 0) ||
                          (paso === 'password' && i <= 1) ||
                          exitoso
                            ? COLORES.primario : '#e5e7eb',
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <h2 className="text-3xl font-extrabold text-neutro-900 mb-1">{titulo}</h2>
            <p className="text-neutro-400 text-sm mb-6">{subtitulo}</p>

            {/* ── Error global ──────────────────────────────────────── */}
            {error && (
              <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-error-claro border border-error/20 text-error text-sm">
                <MaterialIcon name="error_outline" style={{ fontSize: '18px', marginTop: '1px' }} />
                <span>{error}</span>
              </div>
            )}

            {/* ── Éxito final ───────────────────────────────────────── */}
            {exitoso ? (
              <div className="flex flex-col items-center gap-4 text-center py-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#effff5' }}
                >
                  <MaterialIcon name="check_circle" style={{ fontSize: '40px', color: '#146c43' }} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-neutro-900 mb-1">¡Contraseña actualizada!</p>
                  <p className="text-sm text-neutro-400">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                </div>
                <button
                  onClick={() => navigate(RUTAS.LOGIN)}
                  className="mt-2 w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: COLORES.primario }}
                >
                  Ir a Iniciar Sesión
                </button>
              </div>
            ) : (
              <>
                {/* ── PASO 1: Email ────────────────────────────────── */}
                {paso === 'email' && (
                  <form onSubmit={handleSolicitarCodigo} noValidate className="space-y-4">
                    <InputTexto
                      tipo="email"
                      nombre="email"
                      placeholder="Correo electrónico"
                      valor={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <BotonPrimario
                      type="submit"
                      disabled={!email.trim()}
                      cargando={cargando}
                    >
                      Enviar código
                    </BotonPrimario>
                  </form>
                )}

                {/* ── PASO 2: Código ──────────────────────────────── */}
                {paso === 'codigo' && (
                  <form onSubmit={handleVerificarCodigo} noValidate className="space-y-4">
                    {/* Input de 6 dígitos con estilo especial */}
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={codigo}
                        onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full text-center text-3xl font-black tracking-[0.5em] px-4 py-4 rounded-xl border border-neutro-200 focus:outline-none focus:border-primario focus:ring-2 focus:ring-primario/20 transition-all"
                        style={{ color: COLORES.primario, letterSpacing: '0.4em' }}
                      />
                      <p className="text-xs text-neutro-400 text-center mt-2">
                        El código expira en 10 minutos.
                      </p>
                    </div>

                    <BotonPrimario
                      type="submit"
                      disabled={codigo.length !== 6}
                      cargando={cargando}
                    >
                      Verificar código
                    </BotonPrimario>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleReenviar}
                        disabled={cargando}
                        className="text-sm font-semibold hover:underline disabled:opacity-50"
                        style={{ color: COLORES.primario }}
                      >
                        ¿No recibiste el código? Reenviar
                      </button>
                    </div>
                  </form>
                )}

                {/* ── PASO 3: Nueva contraseña ────────────────────── */}
                {paso === 'password' && (
                  <form onSubmit={handleRestablecerPassword} noValidate className="space-y-4">
                    <InputTexto
                      tipo={mostrarPass ? 'text' : 'password'}
                      nombre="nuevaPass"
                      placeholder="Nueva contraseña"
                      valor={nuevaPass}
                      onChange={e => setNuevaPass(e.target.value)}
                      autoComplete="new-password"
                      sufijo={
                        <button
                          type="button"
                          onClick={() => setMostrarPass(v => !v)}
                          className="text-neutro-400 hover:text-neutro-500 transition-colors"
                          tabIndex={-1}
                        >
                          <MaterialIcon
                            name={mostrarPass ? 'visibility_off' : 'visibility'}
                            style={{ fontSize: '20px' }}
                          />
                        </button>
                      }
                    />
                    <InputTexto
                      tipo={mostrarConf ? 'text' : 'password'}
                      nombre="confirmarPass"
                      placeholder="Confirmar contraseña"
                      valor={confirmarPass}
                      onChange={e => setConfirmarPass(e.target.value)}
                      autoComplete="new-password"
                      sufijo={
                        <button
                          type="button"
                          onClick={() => setMostrarConf(v => !v)}
                          className="text-neutro-400 hover:text-neutro-500 transition-colors"
                          tabIndex={-1}
                        >
                          <MaterialIcon
                            name={mostrarConf ? 'visibility_off' : 'visibility'}
                            style={{ fontSize: '20px' }}
                          />
                        </button>
                      }
                    />
                    <p className="text-xs text-neutro-400 px-1">
                      Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
                    </p>
                    <BotonPrimario
                      type="submit"
                      disabled={!nuevaPass || !confirmarPass}
                      cargando={cargando}
                    >
                      Guardar nueva contraseña
                    </BotonPrimario>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

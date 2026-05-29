import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleButton from '../components/GoogleButton';
import { useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import MaterialIcon from '../components/MaterialIcon';
import Input from '../components/Input';
import { RUTAS } from '../constants/rutas';
import { COLORES } from '../styles/tokens';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
/* ── Datos de selects ───────────────────────────────────────────────────── */

const GALERIAS = [
  'Galería Guizado', 'Los Inkas', 'Gamarra Center', 'El Rey de Gamarra',
  'Las Malvinas', 'Galería Molitalia', 'Galería Los Reyes',
];
const TIPOS_DOCUMENTO = ['DNI', 'Carnet de extranjería', 'Pasaporte'];
/* ── Helpers ────────────────────────────────────────────────────────────── */

function validarContrasena(pass: string) {
  return (
    pass.length >= 8 &&
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /[0-9]/.test(pass) &&
    /[^A-Za-z0-9]/.test(pass)
  );
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */

function SectionBadge({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: COLORES.primario }}
      >
        {num}
      </span>
      <h2 className="text-base font-semibold text-gray-800">{label}</h2>
    </div>
  );
}

function FieldSelect({
  name, value, onChange, placeholder, options, className = '',
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: string[];
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-[11px] text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all"
        style={{ color: value ? '#212529' : '#adb5bd' }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <MaterialIcon
        name="expand_more"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        style={{ fontSize: '18px' }}
      />
    </div>
  );
}

/* ── Success Modal ──────────────────────────────────────────────────────── */

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-modal flex flex-col items-center gap-4 text-center">
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
          <p className="text-xl font-extrabold text-gray-900 mb-2">¡Registro enviado!</p>
          <p className="text-sm leading-relaxed text-gray-500">
            Tu solicitud de registro como comerciante está en revisión.
            Te notificaremos por correo una vez aprobado tu acceso.
          </p>
        </div>
        <Link
          to={RUTAS.INICIO}
          onClick={onClose}
          className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-75"
          style={{ color: COLORES.primario }}
        >
          <MaterialIcon name="arrow_back" style={{ fontSize: '16px' }} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function RegistroComerciantePage() {
  const [estadoModal, setEstadoModal] = useState<'PENDIENTE' | 'RECHAZADO' | null>(null);
  const loginGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const response = await axios.post(
          'http://localhost:8080/api/v1/auth/google',
          { accessToken: tokenResponse.access_token }
        );
        // Usuario no existe → se queda en el formulario de registro
        if (response.data.needsRegistration) {
          navigate(RUTAS.REGISTRO_COMERCIANTE, {
            state: { email: response.data.email }
          });
          return;
        }
        // Comerciante pendiente de revisión
        if (response.data.estadoSolicitud === 'PENDIENTE') {
          setEstadoModal('PENDIENTE');
          return;
        }
        // Comerciante rechazado
        if (response.data.estadoSolicitud === 'RECHAZADO') {
          setEstadoModal('RECHAZADO');
          return;
        }
        // Aprobado → accede al home
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('nombreUsuario', response.data.nombres);
        window.location.href = '/home';
      } catch (error) {
        console.error('Error Google login:', error);
        setErrorForm('Error al autenticar con Google');
      }
    },
    onError: () => setErrorForm('No se pudo conectar con Google'),
  });
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const emailGoogle = location.state?.email || '';
  /* Datos del negocio */
  const [nombreTienda, setNombreTienda]   = useState('');
  const [razonSocial, setRazonSocial]     = useState('');
  const [ruc, setRuc]                     = useState('');
  const [galeria, setGaleria]             = useState('');
  const [piso, setPiso]                   = useState('');
  const [stand, setStand]                 = useState('');
  const [logoFile, setLogoFile]           = useState<File | null>(null);
  const [logoDragging, setLogoDragging]   = useState(false);

  /* Información del titular */
  const [correo, setCorreo]               = useState('');
  const [nombres, setNombres]             = useState('');
  const [apellidos, setApellidos]         = useState('');
  const [tipoDoc, setTipoDoc]             = useState('');
  const [numeroDoc, setNumeroDoc]         = useState('');
  const [celular, setCelular]             = useState('');

  /* Seguridad */
  const [contrasena, setContrasena]       = useState('');
  const [confirmar, setConfirmar]         = useState('');
  const [mostrarPass, setMostrarPass]     = useState(false);
  const [mostrarConf, setMostrarConf]     = useState(false);

  const [errorForm, setErrorForm]         = useState<string | null>(null);
  const [enviado, setEnviado]             = useState(false);

  const puedeEnviar =
  nombreTienda && razonSocial && ruc && galeria &&
  (emailGoogle || correo) && nombres && apellidos && tipoDoc && numeroDoc && celular &&
  validarContrasena(contrasena) && contrasena === confirmar;

  const handleLogoFile = (file: File | null) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    setLogoFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    if (!validarContrasena(contrasena)) {
      setErrorForm('La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.');
      return;
    }
    if (contrasena !== confirmar) {
      setErrorForm('Las contraseñas no coinciden.');
      return;
    }
    // TODO: POST /api/v1/comerciantes/registro — Responsable: equipo backend
    try {
      const apellidosArr = apellidos.split(' ');

      const payload = {
        nombres,
        primerApellido: apellidosArr[0] || '',
        segundoApellido: apellidosArr[1] || '',
        email: emailGoogle || correo,
        contrasenha: contrasena,
        dni: numeroDoc,
        telefono: celular,
        tipoDocumento: tipoDoc,
        rol: "VENDEDOR",

        ruc,
        razonSocial,

        nombreTienda,
        piso,
        stand,
        galeria,

        logoUrl: null
      };

      await axios.post(
        "http://localhost:8080/api/v1/auth/google/register-comerciante",
      payload
      );

      setEnviado(true);

    } catch (error: any) {
      console.log("ERROR COMPLETO:", error);
      console.log("RESPUESTA BACKEND:", error.response?.data);
      setErrorForm("Error al registrar comerciante");
    }

  };

  return (
    <div className="flex min-h-screen flex-col font-sans" style={{ backgroundColor: '#f7f7f7' }}>
      <TopBar active="Vender" />

      {enviado && <SuccessModal onClose={() => navigate(RUTAS.INICIO)} />}
      {/* Modal solicitud en revisión */}
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
      {/* Modal solicitud rechazada */}
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
      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div className="px-8 pt-12 pb-8 max-w-[960px] mx-auto w-full">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: COLORES.primario }}
        >
          Portal de Comerciantes
        </span>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight text-gray-900">
          Únete a la comunidad textil<br />
          <span style={{ color: COLORES.primario }}>más grande</span>
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Escala tu negocio de Gamarra al mundo digital con nuestra infraestructura premium.
        </p>
      </div>
      {/* ── Google ──────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[960px] px-8 flex flex-col gap-3 pb-2">
      {/* 👇 Google primero, divider abajo */}
        <GoogleButton onClick={() => loginGoogle()} />
        <div className="flex items-center gap-3">
          < div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-widest font-medium whitespace-nowrap">
              O continua con tus datos
            </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>
      {/* ── Form ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto w-full max-w-[960px] flex flex-col gap-4 px-8 pb-12"
      >
        {/* ── Sección 1: Datos del Negocio ─────────────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-cardShadow">
          <SectionBadge num={1} label="Datos del Negocio" />

          <div className="flex flex-col gap-3">
            <Input
              type="text" name="nombreTienda" placeholder="Nombre de la tienda"
              value={nombreTienda} onChange={(e) => setNombreTienda(e.target.value)}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
              <Input
                type="text" name="razonSocial" placeholder="Razón social"
                value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)}
              />
              <Input
                type="text" name="ruc" placeholder="RUC"
                value={ruc} onChange={(e) => setRuc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FieldSelect
                name="galeria" value={galeria} placeholder="Galería"
                options={GALERIAS} onChange={(e) => setGaleria(e.target.value)}
              />
              <Input
                type="text" name="piso" placeholder="Piso (opcional)"
                value={piso} onChange={(e) => setPiso(e.target.value)}
              />
              <Input
                type="text" name="stand" placeholder="Stand (opcional)"
                value={stand} onChange={(e) => setStand(e.target.value)}
              />
            </div>

            {/* Logo upload */}
            <div>
              <p className="mb-2 text-xs font-medium text-gray-600">Logo</p>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setLogoDragging(true); }}
                onDragLeave={() => setLogoDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setLogoDragging(false);
                  handleLogoFile(e.dataTransfer.files[0] ?? null);
                }}
                className={`relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                  logoDragging ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Hexagonal decorative background */}
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                      <polygon
                        points="28,2 52,14 52,38 28,50 4,38 4,14"
                        fill="none" stroke="#000" strokeWidth="1.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hex)" />
                </svg>

                <div className="relative z-10 flex flex-col items-center gap-1 text-center px-4">
                  {logoFile ? (
                    <>
                      <MaterialIcon name="check_circle" style={{ fontSize: '32px', color: COLORES.primario }} />
                      <p className="text-sm font-medium text-gray-700">{logoFile.name}</p>
                      <p className="text-xs text-gray-400">Haz clic para cambiar</p>
                    </>
                  ) : (
                    <>
                      <MaterialIcon name="cloud_upload" style={{ fontSize: '32px', color: '#0aa2c0' }} />
                      <p className="text-sm font-medium text-gray-700">
                        Arrastra tu logo aquí o haz clic para subir
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG o SVG (Max 10MB)</p>
                    </>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => handleLogoFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </div>

        {/* ── Sección 2: Información del Titular ───────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-cardShadow">
          <SectionBadge num={2} label="Información del Titular" />

          <div className="flex flex-col gap-3">
            <Input
              type="email" name="correo" placeholder="Correo electrónico corporativo"
              value={emailGoogle ||correo} 
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              disabled={!!emailGoogle}
            />
            <Input
              type="text" name="nombres" placeholder="Nombre(s)"
              value={nombres} onChange={(e) => setNombres(e.target.value)}
              autoComplete="given-name"
            />
            <Input
              type="text" name="apellidos" placeholder="Apellidos"
              value={apellidos} onChange={(e) => setApellidos(e.target.value)}
              autoComplete="family-name"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldSelect
                name="tipoDoc" value={tipoDoc} placeholder="Tipo de documento"
                options={TIPOS_DOCUMENTO} onChange={(e) => setTipoDoc(e.target.value)}
              />
              <Input
                type="text" name="numeroDoc" placeholder="Número de documento"
                value={numeroDoc} onChange={(e) => setNumeroDoc(e.target.value)}
              />
            </div>

            <Input
              type="tel" name="celular" placeholder="Celular"
              value={celular} onChange={(e) => setCelular(e.target.value)}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* ── Sección 3: Seguridad ──────────────────────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-cardShadow">
          <SectionBadge num={3} label="Seguridad" />

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                type={mostrarPass ? 'text' : 'password'} name="contrasena"
                placeholder="Contraseña" value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="new-password"
                suffix={
                  <button type="button" tabIndex={-1}
                    onClick={() => setMostrarPass((v) => !v)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                    aria-label={mostrarPass ? 'Ocultar' : 'Mostrar'}
                  >
                    <MaterialIcon name={mostrarPass ? 'visibility_off' : 'visibility'} style={{ fontSize: '20px' }} />
                  </button>
                }
              />
              <Input
                type={mostrarConf ? 'text' : 'password'} name="confirmar"
                placeholder="Confirmar contraseña" value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                autoComplete="new-password"
                suffix={
                  <button type="button" tabIndex={-1}
                    onClick={() => setMostrarConf((v) => !v)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                    aria-label={mostrarConf ? 'Ocultar' : 'Mostrar'}
                  >
                    <MaterialIcon name={mostrarConf ? 'visibility_off' : 'visibility'} style={{ fontSize: '20px' }} />
                  </button>
                }
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <MaterialIcon name="info" style={{ fontSize: '16px', color: '#6c757d', marginTop: '1px' }} />
              <p className="text-xs text-gray-500">
                Mínimo 8 caracteres, incluyendo 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
              </p>
            </div>
          </div>
        </div>

        {/* ── Error ────────────────────────────────────────────────── */}
        {errorForm && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <MaterialIcon name="error_outline" style={{ fontSize: '18px', marginTop: '1px' }} />
            <span>{errorForm}</span>
          </div>
        )}
        
        {/* ── Acciones ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(RUTAS.VENDER)}
            className="rounded-lg border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-pink-50"
            style={{ borderColor: COLORES.primario, color: COLORES.primario }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!puedeEnviar}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: puedeEnviar ? COLORES.primario : '#ced4da',
            }}
          >
            Regístrate
          </button>
        </div>
      </form>

      <Footer />
    </div>
  );
}

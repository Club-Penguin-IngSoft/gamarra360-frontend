import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import ComercianteSidebar from '../../components/ComercianteSidebar';
import MaterialIcon from '../../components/MaterialIcon';
import Input from '../../components/Input';
import { COLORES } from '../../styles/tokens';
import type { GaleriaGamarra } from '../../types/ITienda';
import { ETIQUETA_GALERIA } from '../../types/ITienda';
import {
  obtenerPerfilComerciante,
  actualizarPerfilComerciante,
  type IPerfilComerciante,
} from '../../services/tiendaService';
import apiClient from '../../services/apiClient';

/* ── Datos estáticos ─────────────────────────────────────────────────────── */

const GALERIA_OPTIONS = (Object.keys(ETIQUETA_GALERIA) as GaleriaGamarra[]).map((k) => ({
  value: k,
  label: ETIQUETA_GALERIA[k],
}));

const TIPOS_DOCUMENTO = ['DNI', 'Carnet de extranjería', 'Pasaporte'];

/* ── Subcomponentes locales ──────────────────────────────────────────────── */

function SectionTitle({
  title,
  badge,
}: {
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      {badge}
    </div>
  );
}

function FieldSelect({
  name,
  value,
  onChange,
  placeholder,
  options = [],
  optionItems,
  className = '',
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options?: string[];
  optionItems?: { value: string; label: string }[];
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
        <option value="" disabled>
          {placeholder}
        </option>
        {optionItems
          ? optionItems.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          : options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
      </select>
      <MaterialIcon
        name="expand_more"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        style={{ fontSize: '18px' }}
      />
    </div>
  );
}

function SaveButton({
  loading,
  label = 'Actualizar',
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <div className="flex justify-end mt-4">
      <button
        type="submit"
        disabled={loading}
        className="h-[42px] px-7 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: COLORES.primario }}
      >
        {loading ? 'Guardando…' : label}
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function MiCuentaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Estado de carga inicial */
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  /* Perfil del negocio */
  const [nombreTienda, setNombreTienda] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [ruc, setRuc] = useState('');
  const [galeria, setGaleria] = useState('');
  const [piso, setPiso] = useState('');
  const [stand, setStand] = useState('');
  const [informacion, setInformacion] = useState('');
  const [ofreceEnvio, setOfreceEnvio] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoDragging, setLogoDragging] = useState(false);
  const [verificada, setVerificada] = useState(false);

  /* Información del titular */
  const [email, setEmail] = useState('');
  const [nombres, setNombres] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');

  /* Estados de guardado independientes por bloque */
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);
  const [guardandoTitular, setGuardandoTitular] = useState(false);
  const [mensajeNegocio, setMensajeNegocio] = useState<string | null>(null);
  const [mensajeTitular, setMensajeTitular] = useState<string | null>(null);

  /* Carga inicial del perfil */
  useEffect(() => {
    setCargando(true);
    obtenerPerfilComerciante()
      .then((p: IPerfilComerciante) => {
        setNombreTienda(p.nombreTienda ?? '');
        setRazonSocial(p.razonSocial ?? '');
        setRuc(p.ruc ?? '');
        setGaleria(p.galeria ?? '');
        setPiso(p.piso ?? '');
        setStand(p.stand ?? '');
        setInformacion(p.informacion ?? '');
        setOfreceEnvio(p.ofreceEnvio ?? false);
        setLogoUrl(p.logoUrl ?? p.foto ?? '');
        setVerificada(p.verificada ?? false);
        setEmail(p.email ?? '');
        setNombres(p.nombres ?? '');
        setPrimerApellido(p.primerApellido ?? '');
        setSegundoApellido(p.segundoApellido ?? '');
        setTipoDocumento(p.tipoDocumento ?? '');
        setDni(p.dni ?? '');
        setTelefono(p.telefono ?? '');
      })
      .catch(() => setErrorCarga('No se pudo cargar el perfil. Intenta de nuevo.'))
      .finally(() => setCargando(false));
  }, []);

  /* Subida de logo a S3 */
  const handleLogoFile = (file: File | null) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setLogoFile(file);
  };

  const subirLogoSiHay = async (): Promise<string | undefined> => {
    if (!logoFile) return undefined;
    const formData = new FormData();
    formData.append('archivo', logoFile);
    formData.append('carpeta', 'tiendas');
    const { data } = await apiClient.post<{ url: string }>('/s3/upload', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data.url;
  };

  /* Guardar bloque Negocio */
  const handleGuardarNegocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoNegocio(true);
    setMensajeNegocio(null);
    try {
      const nuevoLogoUrl = await subirLogoSiHay();
      const urlFinal = nuevoLogoUrl ?? logoUrl;
      const perfil = await actualizarPerfilComerciante({
        nombreTienda,
        razonSocial,
        galeria: galeria || undefined,
        piso: piso || undefined,
        stand: stand || undefined,
        informacion: informacion || undefined,
        ofreceEnvio,
        logoUrl: urlFinal,
        foto: urlFinal,
        nombres,
        primerApellido,
        segundoApellido,
        tipoDocumento,
        dni,
        telefono,
      });
      const logoGuardado = perfil.logoUrl ?? perfil.foto ?? urlFinal ?? '';
      setLogoUrl(logoGuardado);
      setLogoFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setMensajeNegocio('Perfil del negocio actualizado.');
    } catch {
      setMensajeNegocio('Error al actualizar. Intenta de nuevo.');
    } finally {
      setGuardandoNegocio(false);
    }
  };

  /* Guardar bloque Titular */
  const handleGuardarTitular = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoTitular(true);
    setMensajeTitular(null);
    try {
      await actualizarPerfilComerciante({
        nombreTienda,
        razonSocial,
        galeria: galeria || undefined,
        piso: piso || undefined,
        stand: stand || undefined,
        informacion: informacion || undefined,
        ofreceEnvio,
        logoUrl,
        nombres,
        primerApellido,
        segundoApellido,
        tipoDocumento,
        dni,
        telefono,
      });
      setMensajeTitular('Datos del titular actualizados.');
    } catch {
      setMensajeTitular('Error al actualizar. Intenta de nuevo.');
    } finally {
      setGuardandoTitular(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="flex min-h-screen">
      <ComercianteSidebar />

      <main className="flex-1 bg-gray-100 p-7">
        {/* Header */}
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: COLORES.primario }}
        >
          Configuración de la Cuenta
        </span>
        <h1 className="mt-1 text-[22px] font-bold text-gray-900">Mi Cuenta</h1>
        <p className="mt-1 text-sm text-gray-500 mb-6">
          Administra los detalles de tu cuenta de vendedor, protocolos de seguridad y estado de
          verificación.
        </p>

        {cargando ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
            Cargando perfil…
          </div>
        ) : errorCarga ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {errorCarga}
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Bloque: Perfil del Negocio */}
            <form
              onSubmit={handleGuardarNegocio}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <SectionTitle
                title="Perfil del Negocio"
                badge={
                  verificada ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 border border-green-200">
                      <MaterialIcon name="verified" style={{ fontSize: '13px' }} />
                      VERIFICADO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-[11px] font-semibold text-yellow-700 border border-yellow-200">
                      PENDIENTE
                    </span>
                  )
                }
              />

              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  name="nombreTienda"
                  placeholder="Nombre de la tienda"
                  value={nombreTienda}
                  onChange={(e) => setNombreTienda(e.target.value)}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
                  <Input
                    type="text"
                    name="razonSocial"
                    placeholder="Razón social"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                  />
                  <Input
                    type="text"
                    name="ruc"
                    placeholder="RUC"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FieldSelect
                    name="galeria"
                    value={galeria}
                    placeholder="Galería"
                    optionItems={GALERIA_OPTIONS}
                    onChange={(e) => setGaleria(e.target.value)}
                  />
                  <Input
                    type="text"
                    name="piso"
                    placeholder="Piso (opcional)"
                    value={piso}
                    onChange={(e) => setPiso(e.target.value)}
                  />
                  <Input
                    type="text"
                    name="stand"
                    placeholder="Stand (opcional)"
                    value={stand}
                    onChange={(e) => setStand(e.target.value)}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <textarea
                    placeholder="Descripción de la tienda (visible para los compradores)"
                    value={informacion}
                    onChange={(e) => setInformacion(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-[11px] text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>

                {/* Envío a domicilio */}
                <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer select-none">
                  <div className="flex items-center gap-2.5">
                    <MaterialIcon name="local_shipping" style={{ fontSize: '18px', color: '#6c757d' }} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Envío a domicilio</p>
                      <p className="text-xs text-gray-500">¿Tu tienda ofrece despacho a domicilio?</p>
                    </div>
                  </div>
                  <div
                    onClick={() => setOfreceEnvio((v) => !v)}
                    className={`relative flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${
                      ofreceEnvio ? 'bg-primario' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        ofreceEnvio ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>

                {/* Logo */}
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
                    {previewUrl ? (
                      <div className="flex flex-col items-center gap-1 text-center px-4">
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="max-h-24 max-w-[220px] object-contain"
                        />
                        <p className="text-xs text-gray-400 mt-1">Haz clic para cambiar</p>
                      </div>
                    ) : logoUrl ? (
                      <div className="flex flex-col items-center gap-1 text-center px-4">
                        <img
                          src={logoUrl}
                          alt="Logo actual"
                          className="max-h-24 max-w-[220px] object-contain"
                        />
                        <p className="text-xs text-gray-400 mt-1">Logo actual · Haz clic para cambiar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center px-4">
                        <MaterialIcon name="cloud_upload" style={{ fontSize: '32px', color: '#0aa2c0' }} />
                        <p className="text-sm font-medium text-gray-700">
                          Arrastra tu logo aquí o haz clic para subir
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG o SVG (Max 10MB)</p>
                      </div>
                    )}
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

              {mensajeNegocio && (
                <p className={`mt-3 text-xs ${mensajeNegocio.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {mensajeNegocio}
                </p>
              )}
              <SaveButton loading={guardandoNegocio} label="Actualizar Perfil" />
            </form>

            {/* Bloque: Información del Titular */}
            <form
              onSubmit={handleGuardarTitular}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <SectionTitle title="Información del Titular" />

              <div className="flex flex-col gap-3">
                <Input
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico corporativo"
                  value={email}
                  onChange={() => {}}
                  disabled
                />
                <Input
                  type="text"
                  name="nombres"
                  placeholder="Nombre(s)"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    type="text"
                    name="primerApellido"
                    placeholder="Primer apellido"
                    value={primerApellido}
                    onChange={(e) => setPrimerApellido(e.target.value)}
                  />
                  <Input
                    type="text"
                    name="segundoApellido"
                    placeholder="Segundo apellido (opcional)"
                    value={segundoApellido}
                    onChange={(e) => setSegundoApellido(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FieldSelect
                    name="tipoDocumento"
                    value={tipoDocumento}
                    placeholder="Tipo de documento"
                    options={TIPOS_DOCUMENTO}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                  />
                  <Input
                    type="text"
                    name="dni"
                    placeholder="Número de documento"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                  />
                </div>
                <Input
                  type="tel"
                  name="telefono"
                  placeholder="Celular"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              {mensajeTitular && (
                <p className={`mt-3 text-xs ${mensajeTitular.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {mensajeTitular}
                </p>
              )}
              <SaveButton loading={guardandoTitular} label="Actualizar Datos" />
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

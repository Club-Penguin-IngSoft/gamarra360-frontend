/**
 * Página "Mi Cuenta" — perfil del usuario autenticado.
 * Accesible desde el TopBar al hacer clic en el nombre/email del usuario.
 *
 * Diseño: Figma 2682-4477
 * Muestra: datos personales, accesos rápidos y opción de cerrar sesión.
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Store as StoreIcon,
  LogOut,
  ChevronRight,
  Tag,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { RUTAS } from '../constants/rutas';

/* ---- Etiqueta visible del rol ---- */
const ROL_LABEL: Record<string, { texto: string; clases: string }> = {
  CLIENTE: {
    texto: 'Cliente',
    clases: 'bg-brand-50 text-brand-600 border border-brand-200',
  },
  COMERCIANTE: {
    texto: 'Comerciante',
    clases: 'bg-[#ecfdf5] text-[#146C43] border border-[#a7f3d0]',
  },
  ADMIN: {
    texto: 'Administrador',
    clases: 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]',
  },
};

/* ---- Tarjeta de acceso rápido ---- */
function AccesoRapidoCard({
  icon: Icon,
  titulo,
  descripcion,
  to,
}: {
  icon: React.ElementType;
  titulo: string;
  descripcion: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm border border-ink-100 transition-shadow hover:shadow-md group"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-ink-900">{titulo}</span>
          <span className="text-[13px] text-ink-500">{descripcion}</span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-ink-400 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/* ---- Fila de dato personal ---- */
function FilaDato({
  icon: Icon,
  etiqueta,
  valor,
}: {
  icon: React.ElementType;
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-ink-100 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
        <Icon className="h-4 w-4 text-ink-500" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[12px] font-medium uppercase tracking-wider text-ink-500">
          {etiqueta}
        </span>
        <span className="truncate text-[15px] font-medium text-ink-900">{valor}</span>
      </div>
    </div>
  );
}

/* ---- Página principal ---- */
export default function MiCuentaPage() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!usuario) {
      navigate(RUTAS.LOGIN, { replace: true });
    }
  }, [usuario, navigate]);

  if (!usuario) return null;

  const rolInfo = ROL_LABEL[usuario.rol] ?? {
    texto: usuario.rol,
    clases: 'bg-ink-100 text-ink-700',
  };

  const iniciales =
    `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate(RUTAS.INICIO, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <TopBar active="Inicio" />

      <main className="flex-1 px-4 py-10 md:px-12">
        <div className="mx-auto max-w-4xl flex flex-col gap-8">

          {/* ── Hero de perfil ─────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-sm border border-ink-100 sm:flex-row sm:gap-8">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[32px] font-bold text-white shadow-md">
              {iniciales}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[28px] font-bold text-ink-900 leading-tight">
                  {nombreCompleto}
                </h1>
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold ${rolInfo.clases}`}
                >
                  {rolInfo.texto}
                </span>
              </div>
              <span className="text-[15px] text-ink-500">{usuario.correo}</span>
            </div>
          </div>

          {/* ── Grid: datos + accesos rápidos ──────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Datos personales */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-ink-900">
                Datos Personales
              </h2>
              <div className="rounded-xl bg-white p-6 shadow-sm border border-ink-100">
                <FilaDato
                  icon={User}
                  etiqueta="Nombre"
                  valor={usuario.nombre}
                />
                <FilaDato
                  icon={User}
                  etiqueta="Apellido"
                  valor={usuario.apellido}
                />
                <FilaDato
                  icon={Mail}
                  etiqueta="Correo electrónico"
                  valor={usuario.correo}
                />
                <FilaDato
                  icon={ShieldCheck}
                  etiqueta="Tipo de cuenta"
                  valor={rolInfo.texto}
                />
              </div>
            </section>

            {/* Accesos rápidos */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-ink-900">
                Accesos Rápidos
              </h2>
              <div className="flex flex-col gap-3">
                {usuario.rol === 'CLIENTE' && (
                  <AccesoRapidoCard
                    icon={ShoppingBag}
                    titulo="Mis Pedidos"
                    descripcion="Revisa el estado de tus compras"
                    to={RUTAS.MIS_PEDIDOS}
                  />
                )}
                {usuario.rol === 'COMERCIANTE' && (
                  <AccesoRapidoCard
                    icon={StoreIcon}
                    titulo="Mi Panel"
                    descripcion="Gestiona tus productos y ventas"
                    to={RUTAS.COMERCIANTE_DASHBOARD}
                  />
                )}
                <AccesoRapidoCard
                  icon={Tag}
                  titulo="Catálogo"
                  descripcion="Explora todos los productos disponibles"
                  to={RUTAS.CATALOGO}
                />
              </div>
            </section>
          </div>

          {/* ── Cerrar sesión ──────────────────────────────────────── */}
          <div className="flex justify-end">
            <button
              onClick={handleCerrarSesion}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-[15px] font-semibold text-red-500 shadow-sm transition-colors hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

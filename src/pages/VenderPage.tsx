import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import MaterialIcon from '../components/MaterialIcon';
import { RUTAS } from '../constants/rutas';
import { COLORES } from '../styles/tokens';

/* ── Datos ──────────────────────────────────────────────────────────────── */

const beneficios = [
  {
    icon: 'visibility',
    iconColor: '#0aa2c0',
    iconBg: '#eafeff',
    titulo: 'Más Visibilidad',
    desc: 'Posicionamos tus productos frente a miles de compradores que buscan calidad textil gamarrina desde cualquier parte del mundo.',
  },
  {
    icon: 'inventory_2',
    iconColor: '#146c43',
    iconBg: '#effff5',
    titulo: 'Gestión de Inventario',
    desc: 'Controla stock, tallas y variantes de forma masiva y sencilla desde tu panel.',
  },
  {
    icon: 'local_shipping',
    iconColor: '#c83771',
    iconBg: '#fcedf1',
    titulo: 'Logística Integrada',
    desc: 'Nos encargamos del recojo y entrega. Olvídate de coordinar motorizados externos.',
  },
  {
    icon: 'bar_chart',
    iconColor: '#303a69',
    iconBg: '#eff0f8',
    titulo: 'Analítica de Negocio',
    desc: 'Entiende qué productos son tus "best-sellers" y ajusta tu producción con datos reales en tiempo real.',
  },
];

const pasos = [
  {
    num: '01',
    titulo: 'Registro',
    desc: 'Crea tu cuenta de comercio en menos de 5 minutos con tu RUC.',
    destacado: false,
  },
  {
    num: '02',
    titulo: 'Sube productos',
    desc: 'Toma fotos, define precios y tallas.',
    destacado: false,
  },
  {
    num: '03',
    titulo: 'Recibe pedidos',
    desc: 'Notificaciones al instante por cada venta. Gestiona stock desde cualquier dispositivo.',
    destacado: false,
  },
  {
    num: '04',
    titulo: 'Cobra',
    desc: 'Recibe tus ganancias de forma segura y directa a tu cuenta bancaria semanalmente.',
    destacado: true,
  },
];

/* ── Componente ─────────────────────────────────────────────────────────── */

export default function VenderPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <TopBar active="Vender" />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto flex w-full max-w-[1200px] items-center gap-16 px-8 py-20 lg:flex-row flex-col">
        {/* Text */}
        <div className="flex flex-1 flex-col gap-6">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: COLORES.primario }}
          >
            Portal de Comerciantes
          </span>

          <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
            Digitaliza tu tienda<br />
            en{' '}
            <span style={{ color: COLORES.primario }}>Gamarra</span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-gray-500">
            Lleva tus colecciones a todo el Perú. Expande tu alcance y gestiona
            tu negocio textil desde un solo lugar con Gamarra360°.
          </p>

          <div>
            <Link
              to={RUTAS.REGISTRO_COMERCIANTE}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLORES.primario }}
            >
              Empezar a vender
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=700&q=80"
            alt="Comerciante gestionando su tienda desde el móvil"
            className="w-full max-w-[480px] rounded-2xl object-cover shadow-cardShadow"
            style={{ aspectRatio: '4/3' }}
          />
        </div>
      </section>

      {/* ── Beneficios ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              ¿Por qué vender con nosotros?
            </h2>
            <div
              className="h-[3px] w-12 rounded-full"
              style={{ backgroundColor: COLORES.primario }}
            />
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {beneficios.map((b) => (
              <div
                key={b.titulo}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-cardShadow"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: b.iconBg }}
                >
                  <MaterialIcon
                    name={b.icon}
                    style={{ fontSize: '22px', color: b.iconColor }}
                  />
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-900">{b.titulo}</p>
                  <p className="text-sm leading-relaxed text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proceso ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Header row */}
          <div className="mb-12 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Tu camino al éxito digital
              </h2>
              <p className="text-sm text-gray-500">
                Sin complicaciones técnicas. Diseñado para comerciantes que valoran su tiempo.
              </p>
            </div>
            <span
              className="hidden text-6xl font-black select-none lg:block"
              style={{ color: '#e4e6e7' }}
            >
              Proceso
            </span>
          </div>

          {/* Step cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((p) => (
              <div
                key={p.num}
                className={`flex flex-col gap-4 rounded-xl border bg-white p-6 ${
                  p.destacado
                    ? 'border-pink-300 shadow-[0_0_0_1px_rgba(200,55,113,0.15)]'
                    : 'border-gray-200 shadow-cardShadow'
                }`}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: COLORES.primario }}
                >
                  {p.num}
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gray-900">{p.titulo}</p>
                  <p className="text-sm leading-relaxed text-gray-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${COLORES.primarioPressed} 0%, ${COLORES.primario} 100%)`,
        }}
      >
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-6">
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Únete a la plataforma textil<br />más grande del Perú
          </h2>
          <p className="text-base text-white/75 leading-relaxed">
            Más de 100 marcas ya están transformando su forma de vender. No te
            quedes atrás en la revolución digital de Gamarra.
          </p>
          <Link
            to={RUTAS.REGISTRO_COMERCIANTE}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'white', color: COLORES.primario }}
          >
            Empezar a vender
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

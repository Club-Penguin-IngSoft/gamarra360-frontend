import { Link } from 'react-router-dom';
import facebookLogo from '../assets/images/facebook-logo.svg';
import instagramLogo from '../assets/images/instagram-logo.svg';
import tiktokLogo from '../assets/images/tiktok-logo.svg';
import libroReclamaciones from '../assets/images/Libro_de_reclamaciones.png';
import Logo from './Logo';

const social = [
  { name: 'Facebook', href: '#', icon: facebookLogo },
  { name: 'Instagram', href: '#', icon: instagramLogo },
  { name: 'TikTok', href: '#', icon: tiktokLogo },
];

const enlaces: { label: string; to: string }[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Productos', to: '/productos' },
  { label: 'Tiendas', to: '/tiendas' },
  { label: 'Vender', to: '/vender' },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="grid grid-cols-1 gap-6 px-[120px] py-[60px] md:grid-cols-4">
        <div className="flex flex-col gap-6">
          <Logo size="lg" />
          <p className="text-[18px] text-ink-700">
            La plataforma definitiva para el emporio comercial.
          </p>
        </div>

        <div className="flex flex-col gap-[18px] md:ml-8 lg:ml-14">
          <h4 className="text-[18px] font-semibold text-ink-900">Enlaces</h4>
          <div className="flex flex-col gap-4">
            {enlaces.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-[18px] text-ink-700 hover:text-brand-500"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          <h4 className="text-[18px] font-semibold text-ink-900">Síguenos</h4>
          <div className="flex items-center gap-4">
            {social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="inline-flex items-center justify-center transition-opacity hover:opacity-80"
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-8 w-8 object-contain"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-start">
          <img
            src={libroReclamaciones}
            alt="Libro de Reclamaciones"
            className="h-auto w-[210px] object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <div className="border-t border-ink-100">
        <div className="flex items-center justify-between px-[120px] py-4 text-xs text-ink-500">
          <span>
            © {new Date().getFullYear()} Gamarra 360°. Todos los derechos
            reservados.
          </span>
          <span>Hecho en Perú</span>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import type { NavKey } from '../components/TopBar';
import { RUTAS } from '../constants/rutas';

interface Props {
  active: NavKey;
  title: string;
  description?: string;
}

export default function ComingSoonPage({ active, title, description }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <TopBar active={active} />
      <main className="flex flex-1 items-center justify-center px-12 py-24">
        <div className="flex max-w-xl flex-col items-center gap-6 text-center">
          <span className="text-[14px] font-bold uppercase tracking-[0.08em] text-brand-700">
            Próximamente
          </span>
          <h1 className="text-5xl font-bold text-ink-900">{title}</h1>
          <p className="text-[18px] text-ink-500">
            {description ??
              'Estamos construyendo esta sección. Muy pronto estará disponible.'}
          </p>
          <Link
            to={RUTAS.INICIO}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

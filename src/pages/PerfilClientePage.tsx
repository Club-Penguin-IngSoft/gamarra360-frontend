import TopBar from '../components/TopBar';
import PerfilUsuario  from '../components/PerfilUsuario';
import Footer from '../components/Footer';

export default function PerfilClientePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <PerfilUsuario />
      </div>
      <Footer />
    </div>
  );
}
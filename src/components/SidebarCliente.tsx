import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  active: string;
  onSelect: (section: string) => void;
}

export default function SidebarCliente({ active, onSelect }: SidebarProps) {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();
  
  const sections = [
    { label: 'Información Personal', key: 'info' },
    { label: 'Mis Pedidos', key: 'pedidos' },
    { label: 'Mis Personalizaciones', key: 'personalizaciones' },
    { label: 'Mis Cotizaciones', key: 'cotizaciones' },
    { label: 'Cerrar sesión', key: 'logout' },
  ];

  const handleClick = (key: string) => {
    if (key === 'logout') {
      cerrarSesion();
      navigate('/');
    } else {
      onSelect(key);
    }
  };

  return (
    <aside className="w-64 flex flex-col gap-2 p-4 bg-white rounded-xl shadow">
      {sections.map((s) => (
        <button
          key={s.key}
          className={`text-left px-4 py-2 rounded-lg ${
            active === s.key ? 'bg-pink-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => handleClick(s.key)}
        >
          {s.label}
        </button>
      ))}
    </aside>
  );
}
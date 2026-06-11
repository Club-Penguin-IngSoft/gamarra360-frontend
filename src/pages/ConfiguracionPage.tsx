import { Navigate } from 'react-router-dom';
import { RUTAS } from '../constants/rutas';

export default function ConfiguracionPage() {
  return <Navigate to={RUTAS.CUENTA} replace />;
}

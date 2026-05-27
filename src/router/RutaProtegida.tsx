/**
 * Wrapper de ruta protegida — redirige a /login si no hay usuario autenticado,
 * y opcionalmente exige un rol específico (RBAC, RNF-2).
 *
 * Uso:
 *   <Route element={<RutaProtegida rolesPermitidos={['COMERCIANTE']} />}>
 *     <Route path="/backoffice" element={<BackofficePage />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RUTAS } from '../constants/rutas';
import type { RolUsuario } from '../types/IUsuario';

interface Props {
  rolesPermitidos?: RolUsuario[];
}

export default function RutaProtegida({ rolesPermitidos }: Props) {
  const { usuario, estaAutenticado } = useAuth();

  if (!estaAutenticado || !usuario) {
    return <Navigate to={RUTAS.LOGIN} replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    // Sin permisos → vuelve al inicio (más adelante: toast + página 403)
    return <Navigate to={RUTAS.INICIO} replace />;
  }

  return <Outlet />;
}

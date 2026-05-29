import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { ILoginRequest, RolUsuario } from '../types/IAuth';
import { RUTAS } from '../constants/rutas';
import { useAuth } from './useAuth';

const rutaPorRol: Record<string, string> = {
  CLIENTE:     RUTAS.INICIO,
  VENDEDOR:    RUTAS.COMERCIANTE_DASHBOARD,
  COMERCIANTE: RUTAS.COMERCIANTE_DASHBOARD,
  ADMIN:       RUTAS.ADMIN_DASHBOARD,
};

const useLogin = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const login = async (credentials: ILoginRequest) => {
    try {
      setCargando(true);
      setError(null);

      const response = await authService.login(credentials);

const rol = (response.rol === 'VENDEDOR' ? 'COMERCIANTE' : response.rol) as RolUsuario;

localStorage.setItem('token', response.token);
localStorage.setItem('nombreUsuario', response.nombres ?? response.email);

iniciarSesion({
  token: response.token,
  usuario: {
    id: String(response.usuarioId),
    nombre: response.nombres ?? '',
    apellido: '',
    correo: response.email,
    rol, 
  }
});

navigate(rutaPorRol[rol] ?? RUTAS.INICIO); // 
// Guardar nombre para el TopBar
//localStorage.setItem('token', response.token);
//localStorage.setItem('nombreUsuario', response.nombres ?? response.email);

//navigate(rutaPorRol[response.rol] ?? RUTAS.INICIO);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { mensaje?: string } } };
      const mensaje =
        axiosError?.response?.data?.mensaje ??
        'Correo o contraseña incorrectos. Inténtalo de nuevo.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const limpiarError = () => setError(null);

  return { iniciarSesion: login, cargando, error, limpiarError };
};

export default useLogin;

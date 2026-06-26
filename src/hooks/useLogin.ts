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

      // Cuenta desactivada por un admin — no loguear, retornar para que
      // LoginPage muestre el modal correspondiente.
      if (response.estadoSolicitud === 'DESACTIVADO') {
        return response;
      }

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
          direccionEntrega: response.direccionEntrega ?? null,
        }
      });

      navigate(rutaPorRol[rol] ?? RUTAS.INICIO);
      return response;
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

  const loginConGoogle = async (accessToken: string) => {
    try {
      setCargando(true);
      setError(null);

      const response = await authService.loginConGoogle(accessToken);

      // Comerciante bloqueado o cuenta desactivada — retornar para que
      // LoginPage muestre el modal correspondiente.
      if (
        response.estadoSolicitud === 'PENDIENTE' ||
        response.estadoSolicitud === 'RECHAZADO' ||
        response.estadoSolicitud === 'DESACTIVADO'
      ) {
        return response;
      }

      if (response.needsRegistration) {
        navigate(RUTAS.REGISTRO, { state: { email: response.email } });
        return response;
      }

      const rol = (response.rol === 'VENDEDOR' ? 'COMERCIANTE' : response.rol) as RolUsuario;

      iniciarSesion({
        token: response.token,
        usuario: {
          id: String(response.usuarioId),
          nombre: response.nombres ?? '',
          apellido: '',
          correo: response.email,
          rol,
          direccionEntrega: response.direccionEntrega ?? null,
        },
      });

      navigate(rutaPorRol[rol] ?? RUTAS.INICIO);
      return response;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { mensaje?: string } } };
      const mensaje =
        axiosError?.response?.data?.mensaje ?? 'Error al iniciar sesión con Google.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const limpiarError = () => setError(null);

  return { iniciarSesion: login, loginConGoogle, cargando, error, limpiarError };
};

export default useLogin;
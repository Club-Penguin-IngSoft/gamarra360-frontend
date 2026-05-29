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

      // MOCK FALLBACK: Permitir login de admin sin backend para pruebas
      if (credentials.email === 'admin@gamarra360.com') {
        iniciarSesion({
          token: 'mock-admin-token-' + Date.now(),
          usuario: {
            id: 'admin-1',
            nombre: 'Administrador',
            apellido: 'Gamarra360',
            correo: credentials.email,
            rol: 'ADMIN',
          }
        });
        navigate(rutaPorRol['ADMIN']);
        return;
      }

      // MOCK FALLBACK: Permitir login de vendedor sin backend para pruebas
      if (credentials.email === 'vendedor@gamarra360.com') {
        iniciarSesion({
          token: 'mock-vendedor-token-' + Date.now(),
          usuario: {
            id: 'vendedor-1',
            nombre: 'Vendedor',
            apellido: 'Prueba',
            correo: credentials.email,
            rol: 'COMERCIANTE',
            idComerciante: 'comerciante-1',
          }
        });
        navigate(rutaPorRol['COMERCIANTE']);
        return;
      }

      // MOCK FALLBACK: Permitir login de cliente sin backend para pruebas
      if (credentials.email === 'cliente@gamarra360.com') {
        iniciarSesion({
          token: 'mock-cliente-token-' + Date.now(),
          usuario: {
            id: 'cliente-1',
            nombre: 'Cliente',
            apellido: 'Prueba',
            correo: credentials.email,
            rol: 'CLIENTE',
          }
        });
        navigate(rutaPorRol['CLIENTE']);
        return;
      }

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

  const loginConGoogle = async (accessToken: string) => {
    try {
      setCargando(true);
      setError(null);

      const response = await authService.loginConGoogle(accessToken);

      if (response.needsRegistration) {
        navigate(RUTAS.REGISTRO, { state: { email: response.email } });
        return;
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
        },
      });

      navigate(rutaPorRol[rol] ?? RUTAS.INICIO);
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

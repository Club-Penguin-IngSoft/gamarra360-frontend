/**
 * Contexto de autenticación. Mantiene en memoria al usuario logueado y expone
 * `iniciarSesion` / `cerrarSesion`. Persiste el JWT en localStorage para que
 * `apiClient` lo lea en sus interceptores.
 *
 * Pendiente: cablear al endpoint real `/api/v1/autenticacion/login` cuando exista.
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { TOKEN_KEY, USUARIO_KEY } from '../constants';
import type { ISesion, IUsuario } from '../types/IUsuario';

interface IAuthContextValue {
  usuario: IUsuario | null;
  estaAutenticado: boolean;
  iniciarSesion: (sesion: ISesion) => void;
  cerrarSesion: () => void;
}

export const AuthContext = createContext<IAuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<IUsuario | null>(null);

  // Rehidratación desde localStorage al montar
  useEffect(() => {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (raw) {
      try {
        setUsuario(JSON.parse(raw) as IUsuario);
      } catch {
        localStorage.removeItem(USUARIO_KEY);
      }
    }
  }, []);

  const iniciarSesion = useCallback((sesion: ISesion) => {
    localStorage.setItem(TOKEN_KEY, sesion.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(sesion.usuario));
    if (sesion.usuario.idTienda) {
      localStorage.setItem('idTienda', String(sesion.usuario.idTienda));
    }
    setUsuario(sesion.usuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem('idTienda');
    setUsuario(null);
  }, []);

  const value = useMemo<IAuthContextValue>(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

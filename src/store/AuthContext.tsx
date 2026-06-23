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
  actualizarUsuario: (datos: Partial<IUsuario>) => void;
}

export const AuthContext = createContext<IAuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<IUsuario | null>(() => {
    try {
      const raw = localStorage.getItem(USUARIO_KEY);
      return raw ? (JSON.parse(raw) as IUsuario) : null;
    } catch {
      localStorage.removeItem(USUARIO_KEY);
      return null;
    }
  });

  const iniciarSesion = useCallback((sesion: ISesion) => {
    localStorage.setItem(TOKEN_KEY, sesion.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(sesion.usuario));
    setUsuario(sesion.usuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  }, []);

  const actualizarUsuario = useCallback((datos: Partial<IUsuario>) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const actualizado = { ...prev, ...datos };
      localStorage.setItem(USUARIO_KEY, JSON.stringify(actualizado));
      return actualizado;
    });
  }, []);

  const value = useMemo<IAuthContextValue>(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario,
    }),
    [usuario, iniciarSesion, cerrarSesion, actualizarUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

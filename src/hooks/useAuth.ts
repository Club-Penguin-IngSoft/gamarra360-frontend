/**
 * Hook que da acceso al contexto de autenticación.
 * Lanza un error útil si se usa fuera del AuthProvider.
 */

import { useContext } from 'react';
import { AuthContext } from '../store/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

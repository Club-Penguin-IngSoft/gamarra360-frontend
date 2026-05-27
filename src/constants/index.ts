/**
 * Constantes globales de la aplicación.
 * Convención CLAUDE.md §4: UPPER_SNAKE_CASE.
 */

export { RUTAS } from './rutas';

/** Base URL del API REST de Gamarra 360°. Se sobreescribe vía .env (VITE_API_BASE_URL) */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/api/v1';

/** Llave en localStorage donde se guarda el JWT */
export const TOKEN_KEY = 'gamarra_token';

/** Llave en localStorage donde se guarda el usuario autenticado */
export const USUARIO_KEY = 'gamarra_usuario';

/** Timeout por defecto para peticiones HTTP (ms) */
export const HTTP_TIMEOUT_MS = 15000;

/** Cantidad de productos por página en el catálogo */
export const PAGINA_TAMANO_CATALOGO = 12;

/**
 * Cliente HTTP base — instancia única de Axios con la URL del backend
 * Spring Boot, timeout, e interceptores de autenticación y errores.
 *
 * Convenciones CLAUDE.md §5:
 *  - 401 → limpia token y redirige a /login
 *  - 403 → toast de permisos (placeholder por ahora)
 *  - Otros → expone el campo `mensaje` del payload de error
 */

import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, HTTP_TIMEOUT_MS, TOKEN_KEY, RUTAS } from '../constants';

/** Formato uniforme de error que devuelve el GlobalExceptionHandler del backend */
export interface IErrorApi {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ----------------------- Interceptor de request ------------------------ */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Intentar con TOKEN_KEY (gamarra_token) y con el fallback 'token'
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ---------------------- Interceptor de response ------------------------ */

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<IErrorApi>) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Evita loops si ya estamos en /login
      if (window.location.pathname !== RUTAS.LOGIN) {
        window.location.href = RUTAS.LOGIN;
      }
    }

    // TODO: integrar sistema de toasts cuando exista
    // if (status === 403) toast.error('No tienes permisos para esta acción');

    return Promise.reject(error);
  },
);

export default apiClient;

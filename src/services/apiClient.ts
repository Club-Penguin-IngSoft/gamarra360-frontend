import axios from 'axios';
import { API_BASE_URL, HTTP_TIMEOUT_MS, TOKEN_KEY, RUTAS } from '../constants';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<IErrorApi>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== RUTAS.LOGIN) window.location.href = RUTAS.LOGIN;
    }
    return Promise.reject(error);
  },
);

export default apiClient;
